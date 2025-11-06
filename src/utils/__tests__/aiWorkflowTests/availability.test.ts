/**
 * Chrome AI Availability Tests
 */

import { checkChromeAIAvailability } from '../../../services/ai/chromeAI';
import { TestResult } from './helpers';

/**
 * Test Chrome AI availability
 */
export const testChromeAIAvailability = async (): Promise<TestResult> => {
  try {
    const availability = await checkChromeAIAvailability();
    const passed = availability !== 'no';

    return {
      name: 'Chrome AI Availability',
      passed,
      details: {
        availability,
        message: passed
          ? `Chrome AI is available (${availability})`
          : 'Chrome AI is not available. This is expected if not using Chrome 138+ or origin trial not enrolled.',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Chrome AI Availability',
      passed: false,
      error: errorMessage,
    };
  }
};
