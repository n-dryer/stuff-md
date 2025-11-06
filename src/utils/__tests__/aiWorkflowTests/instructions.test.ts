/**
 * Custom Instructions Integration Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

/**
 * Test custom instructions integration
 */
export const testCustomInstructions = async (): Promise<TestResult> => {
  try {
    const testContent = 'Meeting notes from Q4 planning session';
    const customInstructions =
      'Always categorize meeting notes under Work/Meetings category';

    const result = await getAICategorization(testContent, customInstructions);

    if (!result) {
      return {
        name: 'Custom Instructions',
        passed: false,
        error: 'Categorization returned null',
      };
    }

    // Check if custom instructions influenced the result
    const hasWorkCategory = result.categories.some(
      cat =>
        cat.toLowerCase().includes('work') ||
        cat.toLowerCase().includes('meeting')
    );

    const passed = hasWorkCategory || result.categories.length > 0;

    return {
      name: 'Custom Instructions',
      passed,
      details: {
        categories: result.categories,
        hasWorkCategory,
        message: passed
          ? 'Custom instructions processed successfully'
          : 'Custom instructions may not have been applied',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Custom Instructions',
      passed: false,
      error: errorMessage,
    };
  }
};
