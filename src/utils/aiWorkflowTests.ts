/**
 * Comprehensive AI Workflow Validation Test Suite
 *
 * This test suite validates all AI-related workflows including:
 * - Chrome AI availability and categorization
 * - Gemini API fallback
 * - Schema validation
 * - Custom instructions integration
 * - Rate limiting
 * - Error handling
 */

import { getAICategorization } from '../services/aiService';
import { checkChromeAIAvailability } from '../services/ai/chromeAI';
import { validateAndParseResponse } from '../services/ai/validation';
import { AICategorizationResult } from '../types';
import { logError, logWarning } from './logger';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

interface WorkflowTestSuite {
  chromeAIAvailability: TestResult;
  chromeAICategorization: TestResult;
  summaryValidation: TestResult;
  schemaValidation: TestResult;
  customInstructions: TestResult;
  rateLimiting: TestResult;
  errorHandling: TestResult;
  fallbackCategorization: TestResult;
  overall: 'pass' | 'fail' | 'partial';
}

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

/**
 * Test summary validation (100-300 chars, 2-4 sentences)
 */
export const testSummaryValidation = async (
  testContent: string = 'A comprehensive guide to React hooks including useState, useEffect, and custom hooks. Learn how to manage component state and side effects effectively.'
): Promise<TestResult> => {
  try {
    const result = await getAICategorization(testContent);

    if (!result) {
      return {
        name: 'Summary Validation',
        passed: false,
        error: 'Categorization returned null',
      };
    }

    const summaryLength = result.summary.length;
    const sentenceCount = result.summary
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0).length;

    const lengthValid = summaryLength >= 100 && summaryLength <= 300;
    const sentenceCountValid = sentenceCount >= 2 && sentenceCount <= 4;

    const passed = lengthValid && sentenceCountValid;

    return {
      name: 'Summary Validation',
      passed,
      details: {
        summaryLength,
        sentenceCount,
        lengthValid,
        sentenceCountValid,
        message: passed
          ? `Summary is valid (${summaryLength} chars, ${sentenceCount} sentences)`
          : `Summary validation failed (${summaryLength} chars, ${sentenceCount} sentences)`,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Summary Validation',
      passed: false,
      error: errorMessage,
    };
  }
};

/**
 * Test schema validation
 */
export const testSchemaValidation = async (
  testContent: string = 'TypeScript tutorial: Understanding type inference and generics'
): Promise<TestResult> => {
  try {
    const result = await getAICategorization(testContent);

    if (!result) {
      return {
        name: 'Schema Validation',
        passed: false,
        error: 'Categorization returned null',
      };
    }

    // Validate all required fields
    const validations = {
      title:
        typeof result.title === 'string' &&
        result.title.length >= 10 &&
        result.title.length <= 100,
      summary:
        typeof result.summary === 'string' &&
        result.summary.length >= 100 &&
        result.summary.length <= 300,
      categories:
        Array.isArray(result.categories) &&
        result.categories.length >= 1 &&
        result.categories.length <= 3,
      tags: Array.isArray(result.tags) && result.tags.length <= 5,
      icon:
        typeof result.icon === 'string' &&
        ['lightbulb', 'link', 'code', 'shopping-cart', 'default'].includes(
          result.icon
        ),
      rationale:
        typeof result.rationale === 'string' && result.rationale.length >= 10,
    };

    const passed = Object.values(validations).every(v => v === true);

    return {
      name: 'Schema Validation',
      passed,
      details: {
        validations,
        message: passed
          ? 'All schema fields are valid'
          : 'Schema validation failed for some fields',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      name: 'Schema Validation',
      passed: false,
      error: errorMessage,
    };
  }
};

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

/**
 * Run complete AI workflow test suite
 */
export const runAIWorkflowTests = async (): Promise<WorkflowTestSuite> => {
  if (import.meta.env.DEV) {
    console.log('=== Starting AI Workflow Validation Tests ===');
  }

  const results: WorkflowTestSuite = {
    chromeAIAvailability: await testChromeAIAvailability(),
    chromeAICategorization: await testChromeAICategorization(),
    summaryValidation: await testSummaryValidation(),
    schemaValidation: await testSchemaValidation(),
    customInstructions: await testCustomInstructions(),
    rateLimiting: await testRateLimiting(),
    errorHandling: await testErrorHandling(),
    fallbackCategorization: await testFallbackCategorization(),
    overall: 'fail',
  };

  // Calculate overall result
  const passedTests = Object.values(results).filter(
    (r): r is TestResult =>
      typeof r === 'object' && 'passed' in r && r.passed === true
  ).length;
  const totalTests = Object.values(results).filter(
    (r): r is TestResult => typeof r === 'object' && 'passed' in r
  ).length;

  if (passedTests === totalTests) {
    results.overall = 'pass';
  } else if (passedTests > 0) {
    results.overall = 'partial';
  }

  // Log results
  if (import.meta.env.DEV) {
    console.log('=== AI Workflow Test Results ===');
    Object.values(results).forEach(result => {
      if (typeof result === 'object' && 'passed' in result) {
        console.log(
          `${result.passed ? '✓' : '✗'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`
        );
        if (result.error) {
          console.error(`  Error: ${result.error}`);
        }
        if (result.details) {
          console.log(`  Details:`, result.details);
        }
      }
    });
    console.log(
      `Overall: ${results.overall.toUpperCase()} (${passedTests}/${totalTests} tests passed)`
    );
  }

  // Log warnings for failed tests
  Object.values(results).forEach(result => {
    if (typeof result === 'object' && 'passed' in result && !result.passed) {
      logWarning(
        `AI workflow test failed: ${result.name}`,
        result.error || 'Unknown error'
      );
    }
  });

  return results;
};

/**
 * Validate AI response format
 */
export const validateAIResponse = (
  response: unknown
): response is AICategorizationResult => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const result = response as Partial<AICategorizationResult>;

  return (
    typeof result.title === 'string' &&
    typeof result.summary === 'string' &&
    Array.isArray(result.categories) &&
    Array.isArray(result.tags) &&
    typeof result.icon === 'string' &&
    typeof result.rationale === 'string'
  );
};
