import { AICategorizationResult } from '../types';
import { logError, logWarning } from '../utils/logger';
import { useChromeBuiltInAI } from './ai/chromeAI';
import {
  useGeminiAPI,
  loadGoogleGenAI,
  isApiKeyConfigured,
} from './ai/geminiAPI';
import { buildResponseSchema } from './ai/schema';
import { validateAndParseResponse } from './ai/validation';
import { truncateContent, withRetry } from './ai/utils';

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

// Enhanced system instruction with detailed guidelines
export const SYSTEM_INSTRUCTION = `You are an organizational assistant specialized in analyzing and categorizing user content. Your task is to analyze the user's input and generate:

1. A concise, descriptive title (50-100 characters)
2. A detailed summary (2-4 sentences, 100-300 characters) that captures key points
3. A hierarchical category path (2-3 levels, PascalCase, e.g., ["Programming", "Web Development"])
4. Context-aware tags (1-2 words, lowercase, max 5, distinct from categories)
5. An icon suggestion (e.g., "lightbulb", "link", "code", "shopping-cart", "book", "file")
6. A brief rationale explaining the categorization

Guidelines:
- Titles should be informative, not generic ("Untitled", "Note", etc.)
- Categories should be consistent with existing hierarchies when possible
- Tags should help with filtering and be distinct from category names
- Summaries should be informative, not just restatements
- Icons should match the content type and category

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
Rationale: "Personal shopping list categorized under Personal/Shopping."`;

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
  // Truncate content if too long
  const truncatedContent = truncateContent(content);

  // Determine which system instruction to use
  // If custom instructions are provided and not empty/default, use them as system instruction
  // Otherwise, use the default SYSTEM_INSTRUCTION
  const normalizedUserPrompt = userPrompt?.trim() || '';
  const isDefaultInstruction =
    !normalizedUserPrompt ||
    normalizedUserPrompt === SYSTEM_INSTRUCTION.trim();
  
  const systemInstruction = isDefaultInstruction
    ? SYSTEM_INSTRUCTION
    : normalizedUserPrompt;

  // Build prompt with content only (system instruction is passed separately to APIs)
  const fullPrompt = `CONTENT TO ORGANIZE:\n---\n${truncatedContent}`;

  // Build schema (will be adapted for each API)
  const schemaForChrome = buildResponseSchema();
  const { module: genAIModule } = await loadGoogleGenAI();
  const schemaForGemini = buildResponseSchema(genAIModule.Type);

  try {
    // Try Chrome built-in AI first
    let response: string;
    try {
      response = await withRetry(() =>
        useChromeBuiltInAI(fullPrompt, systemInstruction, schemaForChrome)
      );

      if (import.meta.env.DEV) {
        console.log('[AI Service] Using Chrome built-in AI (Gemini Nano)');
      }
    } catch (chromeError) {
      // Fallback to Gemini API
      if (chromeError instanceof BrowserAPIError) {
        if (import.meta.env.DEV) {
          console.log(
            '[AI Service] Chrome built-in AI unavailable, falling back to Gemini API'
          );
        }

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
    const result = validateAndParseResponse(response);

    if (import.meta.env.DEV) {
      console.log('[AI Service] Successfully categorized:', result.title);
    }

    return result;
  } catch (error) {
    if (error instanceof TimeoutError || error instanceof SchemaError) {
      logError('AI categorization failed:', error.message);
    } else {
      logError('AI categorization failed:', error);
    }
    return null;
  }
};
