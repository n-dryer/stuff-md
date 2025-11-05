/**
 * Chrome AI Validation Test Utility
 *
 * This utility helps validate that Chrome AI is working correctly.
 *
 * Browser Console Usage:
 *   // In browser console, after app loads:
 *   window.testChromeAI = async () => {
 *     const { testChromeAI } = await import('./utils/chromeAITest');
 *     return await testChromeAI();
 *   };
 *   await window.testChromeAI();
 *
 * Or use the exposed global:
 *   window.__STUFF_TEST_AI__?.()
 */

import { checkChromeAIAvailability } from '../services/ai/chromeAI';
import { getAICategorization } from '../services/aiService';

/**
 * Test Chrome AI availability and basic functionality
 */
export const testChromeAIAvailability = async (): Promise<{
  available: boolean;
  status: 'readily' | 'after-download' | 'no';
  windowExists: boolean;
  aiExists: boolean;
  error?: string;
}> => {
  const result = {
    available: false,
    status: 'no' as const,
    windowExists: typeof window !== 'undefined',
    aiExists: false,
    error: undefined as string | undefined,
  };

  try {
    if (!result.windowExists) {
      result.error = 'Window is undefined (SSR)';
      return result;
    }

    result.aiExists = typeof window.ai !== 'undefined';

    if (!result.aiExists) {
      result.error =
        'window.ai is not available. Check Chrome version and origin trial enrollment.';
      return result;
    }

    result.status = await checkChromeAIAvailability();
    result.available = result.status !== 'no';

    if (!result.available) {
      result.error = `Chrome AI availability returned: ${result.status}`;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
};

/**
 * Test Chrome AI categorization with sample content
 */
export const testChromeAICategorization = async (
  testContent: string = 'React hooks tutorial: useState and useEffect basics for managing component state'
): Promise<{
  success: boolean;
  result?: {
    title: string;
    summary: string;
    categories: string[];
    tags: string[];
    icon: string;
    rationale: string;
  };
  error?: string;
  validation?: {
    titleValid: boolean;
    summaryValid: boolean;
    categoriesValid: boolean;
    tagsValid: boolean;
    iconValid: boolean;
    rationaleValid: boolean;
  };
}> => {
  try {
    console.log('[Chrome AI Test] Starting categorization test...');
    console.log('[Chrome AI Test] Test content:', testContent);

    const result = await getAICategorization(testContent);

    if (!result) {
      return {
        success: false,
        error: 'Categorization returned null',
      };
    }

    // Validate the result
    const validation = {
      titleValid:
        result.title.length >= 10 &&
        result.title.length <= 100 &&
        result.title.trim() !== '',
      summaryValid:
        result.summary.length >= 100 &&
        result.summary.length <= 300 &&
        result.summary.trim() !== '',
      categoriesValid:
        Array.isArray(result.categories) &&
        result.categories.length >= 1 &&
        result.categories.length <= 3 &&
        result.categories.every(
          cat => typeof cat === 'string' && cat.length > 0
        ),
      tagsValid:
        Array.isArray(result.tags) &&
        result.tags.length <= 5 &&
        result.tags.every(tag => typeof tag === 'string' && tag.length > 0),
      iconValid: [
        'lightbulb',
        'link',
        'code',
        'shopping-cart',
        'default',
      ].includes(result.icon),
      rationaleValid:
        typeof result.rationale === 'string' &&
        result.rationale.length >= 10 &&
        result.rationale.length <= 200,
    };

    const allValid = Object.values(validation).every(v => v === true);

    console.log('[Chrome AI Test] Categorization result:', result);
    console.log('[Chrome AI Test] Validation:', validation);

    return {
      success: allValid,
      result,
      validation,
      error: allValid
        ? undefined
        : 'Validation failed. Check validation details.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chrome AI Test] Error:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Comprehensive Chrome AI test suite
 */
export const testChromeAI = async (): Promise<{
  availability: Awaited<ReturnType<typeof testChromeAIAvailability>>;
  categorization: Awaited<ReturnType<typeof testChromeAICategorization>>;
  overall: 'pass' | 'fail' | 'partial';
}> => {
  console.log('=== Chrome AI Validation Test ===');

  const availability = await testChromeAIAvailability();
  console.log('Availability test:', availability);

  let categorization = {
    success: false,
    error: 'Not tested',
  } as Awaited<ReturnType<typeof testChromeAICategorization>>;

  if (availability.available) {
    categorization = await testChromeAICategorization();
    console.log('Categorization test:', categorization);
  } else {
    console.warn('Skipping categorization test - Chrome AI not available');
    categorization.error = 'Chrome AI not available';
  }

  const overall =
    availability.available && categorization.success
      ? 'pass'
      : !availability.available && !categorization.success
        ? 'fail'
        : 'partial';

  console.log('=== Test Complete ===');
  console.log('Overall result:', overall);

  return {
    availability,
    categorization,
    overall,
  };
};
