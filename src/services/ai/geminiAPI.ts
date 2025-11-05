import { logError, logWarning } from '../../utils/logger';
import { TimeoutError } from '../aiService';

// The API key for fallback Gemini API (only needed when Chrome built-in AI unavailable)
const apiKey: string | undefined = import.meta.env.VITE_GEMINI_API_KEY as
  | string
  | undefined;

// Track if we've already warned about missing key to avoid spam
let hasWarnedAboutMissingKey = false;

// Gemini API types (fallback)
type GenAIResponse = { text: string };
type GenAIModel = {
  generateContent: (args: {
    model: string;
    contents: string;
    config?: {
      systemInstruction?: string;
      responseMimeType?: string;
      responseSchema?: unknown;
    };
  }) => Promise<GenAIResponse>;
};
type GenAIClient = {
  models: GenAIModel;
};

type GenAIModule = {
  GoogleGenAI: new (options: { apiKey: string }) => GenAIClient;
  Type: {
    OBJECT: unknown;
    STRING: unknown;
    ARRAY: unknown;
  };
};

// Configuration
const REQUEST_TIMEOUT_MS: number = Number(
  import.meta.env.VITE_GEMINI_TIMEOUT_MS ?? 20000
);

// Lazy load @google/genai only when needed for fallback
let aiInstance: GenAIClient | null = null;
let googleGenAIModule: GenAIModule | null = null;

/**
 * Load Google GenAI module
 */
export const loadGoogleGenAI = async (): Promise<{
  ai: GenAIClient | null;
  module: GenAIModule;
}> => {
  if (!googleGenAIModule) {
    googleGenAIModule = (await import(
      '@google/genai'
    )) as unknown as GenAIModule;
  }
  if (!aiInstance && apiKey) {
    const { GoogleGenAI } = googleGenAIModule;
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return { ai: aiInstance, module: googleGenAIModule } as {
    ai: GenAIClient | null;
    module: GenAIModule;
  };
};

/**
 * Validate API key format without exposing it
 */
const validateApiKey = (): boolean => {
  if (!apiKey) return false;
  return apiKey.startsWith('AI') && apiKey.length > 20;
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = (): boolean => {
  return validateApiKey();
};

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
 * Use Gemini API as fallback
 */
export const useGeminiAPI = async (
  prompt: string,
  systemInstruction: string,
  responseSchema: unknown
): Promise<string> => {
  if (!apiKey) {
    if (!hasWarnedAboutMissingKey) {
      hasWarnedAboutMissingKey = true;
      logWarning(
        'Gemini API key (VITE_GEMINI_API_KEY) is not configured. AI features will be disabled when Chrome built-in AI is unavailable.'
      );
    }
    throw new Error('Gemini API key not configured');
  }

  let ai: GenAIClient | null;
  try {
    const { ai: loadedAi } = await loadGoogleGenAI();
    ai = loadedAi;

    if (!ai) {
      throw new Error('Failed to initialize Gemini API client');
    }
  } catch (error) {
    logError('Failed to load Google GenAI library:', error);
    throw error;
  }

  const response = await withTimeout(
    ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
    REQUEST_TIMEOUT_MS
  );

  // Ensure response has text property
  if (!response.text) {
    throw new Error('Gemini API returned empty response');
  }

  return response.text;
};
