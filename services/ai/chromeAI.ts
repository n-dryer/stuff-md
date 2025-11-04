import { logError } from '../../utils/logger';
import { BrowserAPIError, TimeoutError } from '../aiService';

// Chrome Built-in AI API types (Prompt API)
type ChromeAISession = {
  prompt(input: string): Promise<string>;
  destroy(): void;
};

// Configuration
const REQUEST_TIMEOUT_MS: number = Number(
  import.meta.env.VITE_GEMINI_TIMEOUT_MS ?? 30000
);

// Promise timeout helper
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: number | undefined;
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(
        () => reject(new TimeoutError('AI request timed out')),
        timeoutMs
      );
    }),
  ]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
};

/**
 * Check Chrome built-in AI availability
 */
export const checkChromeAIAvailability = async (): Promise<
  'readily' | 'after-download' | 'no'
> => {
  if (typeof window === 'undefined' || !window.ai) {
    return 'no';
  }
  try {
    const availability = await window.ai.canCreateTextSession();
    return availability;
  } catch (error) {
    logError('Failed to check Chrome AI availability:', error);
    return 'no';
  }
};

/**
 * Create Chrome AI session
 */
export const createChromeAISession =
  async (): Promise<ChromeAISession | null> => {
    if (typeof window === 'undefined' || !window.ai) {
      return null;
    }
    try {
      const session = await window.ai.createTextSession();
      return session as unknown as ChromeAISession;
    } catch (error) {
      logError('Failed to create Chrome AI session:', error);
      return null;
    }
  };

/**
 * Use Chrome built-in AI (Prompt API with Gemini Nano)
 */
export const useChromeBuiltInAI = async (
  prompt: string,
  systemInstruction: string,
  responseSchema: unknown
): Promise<string> => {
  const availability = await checkChromeAIAvailability();

  if (availability === 'no') {
    throw new BrowserAPIError('Chrome built-in AI is not available');
  }

  // Wait for download if needed
  if (availability === 'after-download') {
    // Wait a bit for model download, then try again
    await new Promise(resolve => setTimeout(resolve, 2000));
    const retryAvailability = await checkChromeAIAvailability();
    if (retryAvailability === 'no') {
      throw new BrowserAPIError(
        'Chrome built-in AI model download failed or timed out'
      );
    }
  }

  const session = await createChromeAISession();
  if (!session) {
    throw new BrowserAPIError('Failed to create Chrome AI session');
  }

  try {
    // Chrome Prompt API - format prompt to request JSON output
    // Include schema in the prompt for structured output
    const schemaDescription = JSON.stringify(responseSchema, null, 2);
    const fullPrompt = `${systemInstruction}\n\n${prompt}\n\nIMPORTANT: Respond with valid JSON only, matching this exact schema structure:\n${schemaDescription}\n\nDo not include any text before or after the JSON. Return only the JSON object.`;

    const response = await withTimeout(
      session.prompt(fullPrompt),
      REQUEST_TIMEOUT_MS
    );

    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
    }

    return cleanedResponse.trim();
  } finally {
    session.destroy();
  }
};
