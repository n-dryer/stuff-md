/**
 * Fallback Categorization Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

/**
 * Test fallback categorization
 */
export const testFallbackCategorization = async (): Promise<TestResult> => {
  try {
    // Test with content that should trigger fallback
    const testContent = 'Random text without clear categorization';

    const result = await getAICategorization(testContent);

    if (!result) {
      return {
        name: 'Fallback Categorization',
        passed: false,
        error:
          'Categorization returned null - fallback should still return a result',
      };
    }

    // Fallback should return valid structure
    const passed =
      typeof result.title === 'string' &&
      typeof result.summary === 'string' &&
      Array.isArray(result.categories) &&
      Array.isArray(result.tags);

    return {
      name: 'Fallback Categorization',
      passed,
      details: {
        result,
        message: passed
          ? 'Fallback categorization working correctly'
          : 'Fallback categorization failed',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Fallback Categorization',
      passed: false,
      error: errorMessage,
    };
  }
};
