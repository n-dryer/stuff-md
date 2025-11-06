/**
 * Chrome AI Categorization Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

/**
 * Test Chrome AI categorization with sample content
 */
export const testChromeAICategorization = async (
  testContent: string = 'React hooks tutorial: useState and useEffect basics for managing component state'
): Promise<TestResult> => {
  try {
    const result = await getAICategorization(testContent);

    if (!result) {
      return {
        name: 'Chrome AI Categorization',
        passed: false,
        error: 'Categorization returned null',
      };
    }

    const passed =
      result.title.length >= 10 &&
      result.title.length <= 100 &&
      result.summary.length >= 100 &&
      result.summary.length <= 300 &&
      Array.isArray(result.categories) &&
      result.categories.length >= 1 &&
      result.categories.length <= 3 &&
      Array.isArray(result.tags) &&
      result.tags.length <= 5 &&
      ['lightbulb', 'link', 'code', 'shopping-cart', 'default'].includes(
        result.icon
      );

    return {
      name: 'Chrome AI Categorization',
      passed,
      details: {
        result,
        message: passed
          ? 'Categorization successful and valid'
          : 'Categorization returned invalid data',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Chrome AI Categorization',
      passed: false,
      error: errorMessage,
    };
  }
};
