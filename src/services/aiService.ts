import { AICategorizationResult } from '../types';
import { logError, logWarning, logDebug } from '../utils/logger';
import { validateContentForAI } from '../utils/inputValidation';
import { useChromeBuiltInAI } from './ai/chromeAI';
import {
  useGeminiAPI,
  loadGoogleGenAI,
  isApiKeyConfigured,
} from './ai/geminiAPI';
import { buildResponseSchema } from './ai/schema';
import { validateAndParseResponse } from './ai/aiResponseValidation';
import {
  sanitizeContent,
  truncateContent,
  hashContent,
  estimateTokens,
  formatSchemaDescription,
} from './ai/utils';
import { retryWithBackoff } from '../utils/retry';
import { BrowserAPIError, SchemaError, TimeoutError } from './ai/errors';
import { SYSTEM_INSTRUCTION } from './ai/prompts';

// Re-export for components
export { SYSTEM_INSTRUCTION };
import { enhanceSummary } from './ai/summaryEnhancement';
import { aiRateLimiter } from './ai/rateLimiter';
import { requestCache } from './ai/cache';
import { createFallbackCategorization } from './ai/fallback';

function handleValidationAndEnhancement(
  response: string,
  truncatedContent: string
): AICategorizationResult {
  try {
    return validateAndParseResponse(response);
  } catch (validationError) {
    if (
      validationError instanceof SchemaError &&
      validationError.message.includes('Summary length')
    ) {
      logDebug(
        '[AI Service] Summary validation failed, attempting enhancement'
      );
      try {
        const parsed = JSON.parse(response) as Partial<AICategorizationResult>;
        if (parsed.summary) {
          const enhancedSummary = enhanceSummary(
            parsed.summary,
            truncatedContent
          );
          return {
            title: parsed.title || truncatedContent.slice(0, 100).trim(),
            summary: enhancedSummary,
            categories:
              parsed.categories && parsed.categories.length > 0
                ? parsed.categories
                : ['Misc'],
            tags:
              parsed.tags && parsed.tags.length > 0 ? parsed.tags : ['misc'],
            icon: parsed.icon || 'default',
            rationale:
              parsed.rationale ||
              'Categorization completed with enhanced summary.',
          };
        }
      } catch {
        // Fall through to throw original error
      }
    }
    throw validationError;
  }
}

/**
 * Gets AI-powered categorization for a given text content.
 * Uses Chrome built-in AI (Gemini Nano via Prompt API) as primary method,
 * falls back to Gemini API if unavailable.
 *
 * @param content The text content to analyze.
 * @param userPrompt Optional user instructions to guide categorization.
 * @returns A promise that resolves to an AICategorizationResult or null if it fails.
 */
export const getAICategorization = async (
  content: string,
  userPrompt?: string
): Promise<AICategorizationResult | null> => {
  try {
    // Rate limiting check
    aiRateLimiter.checkRateLimit();

    // Create unique key for this request
    const contentHash = hashContent(content.slice(0, 100));
    const instructionsHash = hashContent(userPrompt || 'default');
    const requestKey = `${contentHash}_${instructionsHash}`;

    // Check if same request is already in progress
    const existingRequest = requestCache.getActiveRequest(requestKey);
    if (existingRequest) {
      logDebug('[AI Service] Reusing existing request');
      return existingRequest;
    }

    let validatedContent: string;
    try {
      validatedContent = validateContentForAI(content);
    } catch (validationError) {
      logError('Content validation failed:', validationError);
      return null;
    }

    const contentHashForCache = hashContent(validatedContent);
    const instructionsHashForCache = hashContent(userPrompt || 'default');
    const cacheKey = `${contentHashForCache}_${instructionsHashForCache}`;
    const cachedResult = requestCache.get(cacheKey);
    if (cachedResult) {
      logDebug('[AI Service] Using cached result');
      return cachedResult;
    }

    const requestPromise =
      (async (): Promise<AICategorizationResult | null> => {
        try {
          const sanitizedContent = sanitizeContent(validatedContent);

          const normalizedUserPrompt = userPrompt?.trim() || '';
          const isDefaultInstruction =
            !normalizedUserPrompt ||
            normalizedUserPrompt === SYSTEM_INSTRUCTION.trim();

          const systemInstruction = isDefaultInstruction
            ? SYSTEM_INSTRUCTION
            : `${SYSTEM_INSTRUCTION}\n\n---\n\nADDITIONAL USER GUIDELINES:\n${normalizedUserPrompt}\n\nNote: These guidelines modify the base instructions above. You must still follow the output format, schema structure, and provide all required fields (title, summary, categories, tags, icon, rationale).`;

          const schemaForChrome = buildResponseSchema();
          const { module: genAIModule } = await loadGoogleGenAI();
          const schemaForGemini = buildResponseSchema(genAIModule.Type);
          const schemaDescription = formatSchemaDescription(schemaForChrome);

          const truncatedContent = truncateContent(sanitizedContent);

          const estimatedTokens = estimateTokens(
            systemInstruction +
              normalizedUserPrompt +
              truncatedContent +
              schemaDescription
          );
          logDebug(`[AI Service] Estimated tokens: ${estimatedTokens}`);

          const fullPrompt = `CONTENT TO ORGANIZE:\n---\n${truncatedContent}`;

          let response: string;
          try {
            response = await retryWithBackoff(() =>
              useChromeBuiltInAI(fullPrompt, systemInstruction, schemaForChrome)
            );

            logDebug('[AI Service] Using Chrome built-in AI (Gemini Nano)');
          } catch (chromeError) {
            if (chromeError instanceof BrowserAPIError) {
              logDebug(
                '[AI Service] Chrome built-in AI unavailable, falling back to Gemini API'
              );

              if (!isApiKeyConfigured()) {
                logWarning(
                  'Chrome built-in AI unavailable and Gemini API key not configured. AI features disabled.'
                );
                return null;
              }

              response = await retryWithBackoff(() =>
                useGeminiAPI(fullPrompt, systemInstruction, schemaForGemini)
              );
            } else {
              throw chromeError;
            }
          }

          let result = handleValidationAndEnhancement(
            response,
            truncatedContent
          );

          if (result.summary.length < 100 || result.summary.length > 300) {
            logDebug(
              `[AI Service] Summary length ${result.summary.length} outside range, enhancing`
            );
            result.summary = enhanceSummary(result.summary, truncatedContent);
          }

          requestCache.set(cacheKey, result);

          logDebug('[AI Service] Successfully categorized:', result.title);

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          if (error instanceof TimeoutError || error instanceof SchemaError) {
            logError('AI categorization failed:', errorMessage);
          } else {
            logError('AI categorization failed:', error);
          }

          logWarning('Using fallback categorization due to AI failure');
          const fallbackResult = createFallbackCategorization(validatedContent);
          requestCache.set(cacheKey, fallbackResult);

          return fallbackResult;
        }
      })();

    requestCache.setActiveRequest(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      requestCache.deleteActiveRequest(requestKey);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many')) {
      logError('AI rate limit exceeded:', error.message);
      throw error;
    }

    logError('AI categorization error:', error);
    return null;
  }
};
