import { logError, logDebug } from '../../utils/logger';
import { BrowserAPIError } from './errors';
import { formatSchemaDescription } from './utils';
import { withTimeout as promiseWithTimeout } from '../../utils/asyncUtils';

// Chrome Built-in AI API types (Prompt API)
type ChromeAISession = {
  prompt(input: string): Promise<string>;
  destroy(): void;
};

// Configuration
const REQUEST_TIMEOUT_MS: number = Number(
  import.meta.env.VITE_GEMINI_TIMEOUT_MS ?? 20000
);

/**
 * Check Chrome built-in AI availability
 */
export const checkChromeAIAvailability = async (): Promise<
  'readily' | 'after-download' | 'no'
> => {
  if (typeof window === 'undefined') {
    logDebug('[Chrome AI] Window is undefined (SSR)');
    return 'no';
  }

  if (!window.ai) {
    logDebug('[Chrome AI] window.ai is not available');
    return 'no';
  }

  try {
    const availability = await window.ai.canCreateTextSession();
    logDebug(`[Chrome AI] Availability check returned: ${availability}`);
    return availability;
  } catch (error) {
    // Handle version-related errors gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('version not supported') ||
      errorMessage.includes('Version')
    ) {
      logDebug(
        '[Chrome AI] Chrome version not supported by origin trial, will use fallback'
      );
    } else {
      logError('Failed to check Chrome AI availability:', error);
    }
    return 'no';
  }
};

/**
 * Create Chrome AI session
 */
export const createChromeAISession =
  async (): Promise<ChromeAISession | null> => {
    if (typeof window === 'undefined' || !window.ai) {
      logDebug('[Chrome AI] Cannot create session: window.ai not available');
      return null;
    }
    try {
      logDebug('[Chrome AI] Attempting to create text session...');
      const session = await window.ai.createTextSession();
      logDebug('[Chrome AI] Session created successfully');
      return session as unknown as ChromeAISession;
    } catch (error) {
      // Handle version-related errors gracefully
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('version not supported') ||
        errorMessage.includes('Version')
      ) {
        logDebug('[Chrome AI] Chrome version not supported, will use fallback');
      } else {
        logError('Failed to create Chrome AI session:', error);
      }
      return null;
    }
  };

/**
 * Use Chrome built-in AI (Prompt API with Gemini Nano)
 *
 * Note: The Prompt API (window.ai.createTextSession) is the correct API for structured output.
 * The Prompt API doesn't support separate system instructions, so we concatenate the system
 * instruction with the user prompt. This matches the API's expected usage pattern.
 */
export const useChromeBuiltInAI = async (
  prompt: string,
  systemInstruction: string,
  responseSchema: unknown
): Promise<string> => {
  logDebug('[Chrome AI] Starting Chrome built-in AI request');

  const availability = await checkChromeAIAvailability();

  if (availability === 'no') {
    logDebug('[Chrome AI] Availability check returned "no"');
    logDebug('[Chrome AI] Possible reasons:');
    logDebug('  - Not using Chrome browser');
    logDebug(
      '  - Chrome version < 138 (for extensions) or beta version not supported by origin trial'
    );
    logDebug('  - Origin trial not enrolled (for web usage)');
    logDebug('  - Chrome AI flags not enabled');
    logDebug('  - Gemini Nano model not available');
    logDebug('  - Chrome beta versions may not be supported by origin trial');
    throw new BrowserAPIError(
      'Chrome built-in AI is not available. The app will automatically use Gemini API fallback if configured. Ensure you are using Chrome 138+ stable with built-in AI enabled, or configure VITE_GEMINI_API_KEY for fallback.'
    );
  }

  logDebug(`[Chrome AI] Availability: ${availability}`);

  // Wait for download if needed
  if (availability === 'after-download') {
    logDebug('[Chrome AI] Model needs download, waiting...');
    // Wait a bit for model download, then try again
    await new Promise(resolve => setTimeout(resolve, 2000));
    const retryAvailability = await checkChromeAIAvailability();
    if (retryAvailability === 'no') {
      logDebug('[Chrome AI] Model download failed or timed out');
      throw new BrowserAPIError(
        'Chrome built-in AI model download failed or timed out'
      );
    }
    logDebug(`[Chrome AI] After download check: ${retryAvailability}`);
  }

  const session = await createChromeAISession();
  if (!session) {
    logDebug('[Chrome AI] Session creation returned null');
    throw new BrowserAPIError('Failed to create Chrome AI session');
  }

  try {
    logDebug('[Chrome AI] Constructing prompt with schema...');
    const schemaDescription = formatSchemaDescription(responseSchema);
    const fullPrompt = `${systemInstruction}\n\n${prompt}\n\nCRITICAL REQUIREMENTS:\n- The summary field MUST be exactly 100-300 characters (2-4 sentences). This is mandatory.\n- The summary must be informative and substantive, capturing key points from the content.\n- Never return a summary shorter than 100 characters or longer than 300 characters.\n\nIMPORTANT: Respond with valid JSON only, matching this exact schema structure:\n${schemaDescription}\n\nDo not include any text before or after the JSON. Return only the JSON object.`;

    logDebug('[Chrome AI] Sending prompt to session...');
    const response = await promiseWithTimeout(
      session.prompt(fullPrompt),
      REQUEST_TIMEOUT_MS
    );

    logDebug('[Chrome AI] Received response, cleaning...');

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

    logDebug('[Chrome AI] Successfully processed response');

    return cleanedResponse.trim();
  } catch (error) {
    logError('[Chrome AI] Error during prompt execution:', error);
    throw error;
  } finally {
    logDebug('[Chrome AI] Destroying session');
    session.destroy();
  }
};
