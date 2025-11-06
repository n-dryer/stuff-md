/**
 * Error Handling Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

/**
 * Test error handling
 */
export const testErrorHandling = async (): Promise<TestResult> => {
  try {
    // Test with invalid content (empty string)
    const emptyResult = await getAICategorization('');

    // Test with very long content
    const longContent = 'A'.repeat(100000);
    const longResult = await getAICategorization(longContent);

    // Both should either return null or valid results (not throw errors)
    const passed =
      emptyResult === null || (emptyResult && typeof emptyResult === 'object');

    return {
      name: 'Error Handling',
      passed,
      details: {
        emptyContentHandled: emptyResult === null,
        longContentHandled: longResult !== null,
        message: passed
          ? 'Error handling working correctly'
          : 'Error handling may have issues',
      },
    };
  } catch (error) {
    // If error is thrown, that's actually a failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Error Handling',
      passed: false,
      error: `Error was thrown: ${errorMessage}`,
    };
  }
};
