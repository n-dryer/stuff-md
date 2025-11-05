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
import { validateAndParseResponse } from './ai/validation';
import {
  sanitizeContent,
  truncateContent,
  withRetry,
  hashContent,
  estimateTokens,
  formatSchemaDescription,
} from './ai/utils';

// Error types for better error handling
export class BrowserAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserAPIError';
  }
}

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Prompt version for tracking and gradual rollouts
const PROMPT_VERSION = '1.1.0';

// Enhanced system instruction with detailed guidelines
export const SYSTEM_INSTRUCTION = `[Version ${PROMPT_VERSION}] You are an organizational assistant specialized in analyzing and categorizing user content. Your task is to analyze the user's input and generate:

1. A concise, descriptive title (50-100 characters)
2. A detailed summary (2-4 sentences, 100-300 characters) that captures key points. CRITICAL: The summary MUST be between 100-300 characters. It must be informative, substantive, and capture the essential information. Never return a summary shorter than 100 characters or longer than 300 characters. Always write 2-4 complete sentences that provide meaningful context.
3. A hierarchical category path (2-3 levels, PascalCase, e.g., ["Programming", "Web Development"])
4. Context-aware tags (1-2 words, lowercase, max 5, distinct from categories)
5. An icon suggestion that is unique and specific to the category (not generic). Must be one of: "lightbulb" (ideas/notes/thoughts), "link" (links/URLs/bookmarks), "code" (programming/development/technical), "shopping-cart" (shopping/personal/purchases), or "default" (all other content types). The icon must match the primary category path element.
6. A brief rationale explaining the categorization

Guidelines:
- Titles should be informative, not generic ("Untitled", "Note", etc.)
- Categories should be consistent with existing hierarchies when possible
- Tags should help with filtering and be distinct from category names
- Summaries MUST be 100-300 characters (2-4 sentences). They must be informative, substantive, and capture key points. Never just restate the title or content. Always provide meaningful context and essential information.
- Icons must match the primary category: Programming → "code", Shopping → "shopping-cart", Ideas → "lightbulb", Links → "link"

Examples of good outputs:
Content: "React hooks tutorial: useState and useEffect basics"
Title: "React Hooks: useState and useEffect Tutorial"
Summary: "A tutorial covering React hooks fundamentals, focusing on useState for state management and useEffect for side effects in functional components."
Categories: ["Programming", "Web Development", "React"]
Tags: ["react", "hooks", "tutorial", "javascript"]
Icon: "code"
Rationale: "Categorized under Programming/Web Development/React as it's a technical tutorial about React development."

Content: "Grocery list: milk, eggs, bread"
Title: "Grocery Shopping List"
Summary: "A shopping list containing essential grocery items including dairy (milk), proteins (eggs), and bread."
Categories: ["Personal", "Shopping"]
Tags: ["shopping", "groceries", "food"]
Icon: "shopping-cart"
Rationale: "Personal shopping list categorized under Personal/Shopping."

Content: "Meeting notes from Q4 planning: discussed budget, timeline, and team assignments"
Title: "Q4 Planning Meeting Notes"
Summary: "Meeting notes covering Q4 planning discussions including budget considerations, project timeline, and team assignment allocations."
Categories: ["Work", "Meetings"]
Tags: ["planning", "q4", "meeting"]
Icon: "default"
Rationale: "Work-related meeting notes categorized under Work/Meetings."

Content: "Daily journal entry: feeling grateful for family and good health today"
Title: "Daily Journal: Gratitude Entry"
Summary: "A personal journal entry expressing gratitude for family and good health, reflecting on positive aspects of the day."
Categories: ["Personal", "Journal"]
Tags: ["journal", "gratitude", "reflection"]
Icon: "lightbulb"
Rationale: "Personal reflection categorized under Personal/Journal with lightbulb icon for ideas/thoughts."

What NOT to do (negative examples):
- Bad: Title: "Untitled" or "Note" (too generic)
- Bad: Categories: ["Programming"] with Icon: "shopping-cart" (mismatched)
- Bad: Tags: ["programming", "Programming"] (redundant with category)
- Bad: Summary: "This is a note about React hooks" (too brief, only 35 chars, just restatement, doesn't meet 100-300 char requirement)
- Bad: Summary: "React hooks tutorial." (too short, only 20 chars, must be 100-300 chars with 2-4 sentences)
- Good: Summary: "A comprehensive tutorial covering React hooks fundamentals, focusing on useState for state management and useEffect for side effects in functional components. Explains best practices and common patterns for effective React development." (185 chars, informative, 2-4 sentences)`;

// Rate limiting for AI requests
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 5;
const MAX_REQUESTS_PER_HOUR = 20;

const checkRateLimit = (): void => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const oneHourAgo = now - 3600000;

  const filtered = requestTimestamps.filter(ts => ts > oneHourAgo);
  requestTimestamps.length = 0;
  requestTimestamps.push(...filtered);

  const recentRequests = requestTimestamps.filter(ts => ts > oneMinuteAgo);
  const hourlyRequests = requestTimestamps.length;

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Too many AI requests. Please wait a minute.');
  }

  if (hourlyRequests >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Hourly AI request limit reached. Please try again later.');
  }

  requestTimestamps.push(now);
};

// Track active requests to prevent concurrent duplicates
const activeRequests = new Map<
  string,
  Promise<AICategorizationResult | null>
>();

// Cache for recent requests to prevent duplicates
const requestCache = new Map<string, AICategorizationResult>();
const CACHE_MAX_SIZE = 50;

/**
 * Enhance a summary to meet 100-300 char requirement
 */
const enhanceSummary = (summary: string, content: string): string => {
  let enhanced = summary.trim();
  const contentTrimmed = content.trim();

  // If summary is too short, enhance it
  if (enhanced.length < 100) {
    // If we have a partial summary, build on it
    if (enhanced.length > 20) {
      // Extract more context from content
      const sentences = contentTrimmed
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      // Find sentences that aren't already in summary
      const summaryWords = new Set(
        enhanced
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 2)
      );

      for (const sentence of sentences) {
        const sentenceWords = new Set(
          sentence
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2)
        );
        // Check if sentence adds new information
        const hasNewInfo = Array.from(sentenceWords).some(
          w => !summaryWords.has(w)
        );

        if (hasNewInfo && enhanced.length + sentence.length + 2 <= 300) {
          const newSummary = `${enhanced} ${sentence}.`;
          if (newSummary.length >= 100) {
            return newSummary.slice(0, 300).trim();
          }
          enhanced = newSummary;
          // Update summary words for next iteration
          const newWords = newSummary
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2);
          newWords.forEach(w => summaryWords.add(w));
        }
      }

      // If still too short, add contextual information
      if (enhanced.length < 100) {
        return `${enhanced} This content has been automatically organized and categorized for easy retrieval and future reference.`;
      }
    } else {
      // Summary is too short, use fallback generation
      return generateFallbackSummary(content);
    }
  }

  // If summary is too long, truncate intelligently
  if (enhanced.length > 300) {
    let truncated = enhanced.slice(0, 297).trim();
    const lastPunct = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    if (lastPunct > 100) {
      truncated = truncated.slice(0, lastPunct + 1);
    } else {
      truncated = enhanced.slice(0, 297) + '...';
    }
    return truncated;
  }

  return enhanced;
};

/**
 * Generate a meaningful summary from content (100-300 chars, 2-4 sentences)
 */
const generateFallbackSummary = (content: string): string => {
  const trimmed = content.trim();

  // Extract key sentences/phrases
  const sentences = trimmed
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  // If content is very short, expand it
  if (trimmed.length < 100) {
    // Create an informative summary from what we have
    const firstPart = trimmed.slice(0, Math.min(50, trimmed.length));
    return `${firstPart}. This note contains essential information that requires organization and categorization for future reference. The content has been automatically categorized to help with retrieval and management.`;
  }

  // Build summary from sentences
  let summary = '';
  let charCount = 0;

  for (const sentence of sentences) {
    if (charCount + sentence.length + 2 <= 300) {
      if (summary) summary += ' ';
      summary += sentence;
      charCount = summary.length;

      // Aim for 2-4 sentences, target 150-250 chars
      if (charCount >= 100 && sentences.length > 1) {
        break;
      }
    } else {
      break;
    }
  }

  // If we have a good summary, ensure it ends properly
  if (summary.length >= 100) {
    // Find last sentence boundary
    const lastPeriod = summary.lastIndexOf('.');
    const lastExclamation = summary.lastIndexOf('!');
    const lastQuestion = summary.lastIndexOf('?');
    const lastPunct = Math.max(lastPeriod, lastExclamation, lastQuestion);

    if (lastPunct > 0 && summary.length - lastPunct - 1 > 50) {
      summary = summary.slice(0, lastPunct + 1);
    }

    // Ensure it's within range
    if (summary.length > 300) {
      summary = summary.slice(0, 297).trim();
      // Find last sentence boundary before truncation
      const lastPunct = Math.max(
        summary.lastIndexOf('.'),
        summary.lastIndexOf('!'),
        summary.lastIndexOf('?')
      );
      if (lastPunct > 100) {
        summary = summary.slice(0, lastPunct + 1);
      } else {
        summary = summary.slice(0, 297) + '...';
      }
    }

    // If still too short, add context
    if (summary.length < 100) {
      summary += ` This content has been automatically organized and categorized for easy retrieval and management.`;
    }

    return summary;
  }

  // Fallback: create structured summary
  const firstPart = trimmed.slice(0, Math.min(150, trimmed.length));
  const words = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);
  const topic = words.slice(0, 3).join(' ');

  summary = `${firstPart}${firstPart.length < trimmed.length ? '...' : ''} This note contains information about ${topic || 'various topics'}. The content has been automatically categorized to facilitate organization and future reference.`;

  // Ensure it's in the 100-300 range
  if (summary.length < 100) {
    summary += ` Additional context and details are preserved in the full note content for comprehensive understanding.`;
  } else if (summary.length > 300) {
    summary = summary.slice(0, 297).trim();
    const lastPunct = Math.max(
      summary.lastIndexOf('.'),
      summary.lastIndexOf('!'),
      summary.lastIndexOf('?')
    );
    if (lastPunct > 100) {
      summary = summary.slice(0, lastPunct + 1);
    } else {
      summary = summary.slice(0, 297) + '...';
    }
  }

  return summary;
};

/**
 * Fallback categorization when AI fails
 */
const createFallbackCategorization = (
  content: string
): AICategorizationResult => {
  const trimmed = content.trim();
  const words = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5);

  const title = trimmed.slice(0, 100).trim() || 'Untitled Note';
  const summary = generateFallbackSummary(content);

  // Basic keyword-based category detection
  const programmingKeywords = [
    'code',
    'programming',
    'function',
    'class',
    'api',
    'javascript',
    'python',
    'react',
    'node',
  ];
  const shoppingKeywords = [
    'shopping',
    'buy',
    'purchase',
    'grocery',
    'store',
    'cart',
  ];
  const linkKeywords = ['http', 'https', 'www', 'url', 'link', 'website'];

  let category = 'Misc';
  const lowerContent = content.toLowerCase();

  if (programmingKeywords.some(kw => lowerContent.includes(kw))) {
    category = 'Programming';
  } else if (shoppingKeywords.some(kw => lowerContent.includes(kw))) {
    category = 'Personal';
  } else if (linkKeywords.some(kw => lowerContent.includes(kw))) {
    category = 'Links';
  }

  return {
    title,
    summary,
    categories: [category],
    tags: words.length > 0 ? words.slice(0, 5) : ['misc'],
    icon:
      category === 'Programming'
        ? 'code'
        : category === 'Personal'
          ? 'shopping-cart'
          : category === 'Links'
            ? 'link'
            : 'default',
    rationale: `Fallback categorization based on content keywords. Category: ${category}.`,
  };
};

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
    checkRateLimit();

    // Create unique key for this request
    const contentHash = hashContent(content.slice(0, 100));
    const instructionsHash = hashContent(userPrompt || 'default');
    const requestKey = `${contentHash}_${instructionsHash}`;

    // Check if same request is already in progress
    const existingRequest = activeRequests.get(requestKey);
    if (existingRequest) {
      logDebug('[AI Service] Reusing existing request');
      return existingRequest;
    }

    // Validate content first (fail fast if invalid)
    let validatedContent: string;
    try {
      validatedContent = validateContentForAI(content);
    } catch (validationError) {
      logError('Content validation failed:', validationError);
      return null;
    }

    // Check cache after validation
    // Use full content hash for cache key to ensure accuracy
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
          // Sanitize content to prevent prompt injection
          const sanitizedContent = sanitizeContent(validatedContent);

          // Determine which system instruction to use
          const normalizedUserPrompt = userPrompt?.trim() || '';
          const isDefaultInstruction =
            !normalizedUserPrompt ||
            normalizedUserPrompt === SYSTEM_INSTRUCTION.trim();

          // CRITICAL FIX: Combine system + custom instructions instead of replacing
          const systemInstruction = isDefaultInstruction
            ? SYSTEM_INSTRUCTION
            : `${SYSTEM_INSTRUCTION}\n\n---\n\nADDITIONAL USER GUIDELINES:\n${normalizedUserPrompt}\n\nNote: These guidelines modify the base instructions above. You must still follow the output format, schema structure, and provide all required fields (title, summary, categories, tags, icon, rationale).`;

          // Build schema
          const schemaForChrome = buildResponseSchema();
          const { module: genAIModule } = await loadGoogleGenAI();
          const schemaForGemini = buildResponseSchema(genAIModule.Type);
          const schemaDescription = formatSchemaDescription(schemaForChrome);

          // Optimize content truncation based on token usage
          const truncatedContent = truncateContent(sanitizedContent);

          // Log token estimation in dev mode
          const estimatedTokens = estimateTokens(
            systemInstruction +
              normalizedUserPrompt +
              truncatedContent +
              schemaDescription
          );
          logDebug(`[AI Service] Estimated tokens: ${estimatedTokens}`);

          // Build prompt with content only (system instruction is passed separately to APIs)
          const fullPrompt = `CONTENT TO ORGANIZE:\n---\n${truncatedContent}`;

          // Try Chrome built-in AI first
          let response: string;
          try {
            response = await withRetry(() =>
              useChromeBuiltInAI(fullPrompt, systemInstruction, schemaForChrome)
            );

            logDebug('[AI Service] Using Chrome built-in AI (Gemini Nano)');
          } catch (chromeError) {
            // Fallback to Gemini API
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

              response = await withRetry(() =>
                useGeminiAPI(fullPrompt, systemInstruction, schemaForGemini)
              );
            } else {
              throw chromeError;
            }
          }

          // Validate and parse response
          let result: AICategorizationResult;
          try {
            result = validateAndParseResponse(response);
          } catch (validationError) {
            // If validation fails due to summary length, try to enhance it
            if (
              validationError instanceof SchemaError &&
              validationError.message.includes('Summary length')
            ) {
              logDebug(
                '[AI Service] Summary validation failed, attempting enhancement'
              );

              // Try to parse anyway to get the partial result
              try {
                const parsed = JSON.parse(
                  response
                ) as Partial<AICategorizationResult>;
                if (parsed.summary) {
                  // Enhance the summary to meet requirements
                  const enhancedSummary = enhanceSummary(
                    parsed.summary,
                    truncatedContent
                  );
                  result = {
                    title:
                      parsed.title || truncatedContent.slice(0, 100).trim(),
                    summary: enhancedSummary,
                    categories:
                      parsed.categories && parsed.categories.length > 0
                        ? parsed.categories
                        : ['Misc'],
                    tags:
                      parsed.tags && parsed.tags.length > 0
                        ? parsed.tags
                        : ['misc'],
                    icon: parsed.icon || 'default',
                    rationale:
                      parsed.rationale ||
                      'Categorization completed with enhanced summary.',
                  };
                } else {
                  throw validationError;
                }
              } catch {
                throw validationError;
              }
            } else {
              throw validationError;
            }
          }

          // Double-check summary length and enhance if needed
          if (result.summary.length < 100 || result.summary.length > 300) {
            logDebug(
              `[AI Service] Summary length ${result.summary.length} outside range, enhancing`
            );
            result.summary = enhanceSummary(result.summary, truncatedContent);
          }

          // Cache successful result
          if (requestCache.size >= CACHE_MAX_SIZE) {
            const firstKey = requestCache.keys().next().value;
            requestCache.delete(firstKey);
          }
          requestCache.set(cacheKey, result);

          logDebug('[AI Service] Successfully categorized:', result.title);

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // Log full error for debugging
          if (error instanceof TimeoutError || error instanceof SchemaError) {
            logError('AI categorization failed:', errorMessage);
          } else {
            logError('AI categorization failed:', error);
          }

          // Use fallback categorization instead of returning null
          logWarning('Using fallback categorization due to AI failure');
          const fallbackResult = createFallbackCategorization(validatedContent);

          // Cache fallback result too
          if (requestCache.size >= CACHE_MAX_SIZE) {
            const firstKey = requestCache.keys().next().value;
            requestCache.delete(firstKey);
          }
          requestCache.set(cacheKey, fallbackResult);

          return fallbackResult;
        }
      })();

    activeRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      activeRequests.delete(requestKey);
    }
  } catch (error) {
    // Handle rate limiting errors
    if (error instanceof Error && error.message.includes('Too many')) {
      logError('AI rate limit exceeded:', error.message);
      throw error;
    }

    // Other errors are logged but return null
    logError('AI categorization error:', error);
    return null;
  }
};
