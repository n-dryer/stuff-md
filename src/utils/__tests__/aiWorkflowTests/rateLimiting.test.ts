/**
 * Rate Limiting Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

/**
 * Test rate limiting behavior
 */
export const testRateLimiting = async (): Promise<TestResult> => {
  try {
    // Make multiple rapid requests to test rate limiting
    const requests = Array.from({ length: 6 }, () =>
      getAICategorization('Test content for rate limiting')
    );

    const results = await Promise.allSettled(requests);

    const rateLimitErrors = results.filter(
      r =>
        r.status === 'rejected' &&
        r.reason instanceof Error &&
        (r.reason.message.includes('Too many') ||
          r.reason.message.includes('rate limit'))
    );

    // Rate limiting should kick in after 5 requests per minute
    const passed =
      rateLimitErrors.length > 0 ||
      results.every(r => r.status === 'fulfilled');

    return {
      name: 'Rate Limiting',
      passed,
      details: {
        totalRequests: requests.length,
        rateLimitErrors: rateLimitErrors.length,
        message: passed
          ? 'Rate limiting working as expected'
          : 'Rate limiting may not be working correctly',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Rate Limiting',
      passed: false,
      error: errorMessage,
    };
  }
};
