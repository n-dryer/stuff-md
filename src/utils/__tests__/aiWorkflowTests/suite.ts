/**
 * AI Workflow Test Suite Runner
 *
 * Runs all AI workflow tests and aggregates results
 */

import { logDebug, logError, logWarning } from '../../logger';
import { testChromeAIAvailability } from './availability.test';
import { testChromeAICategorization } from './categorization.test';
import { testSummaryValidation, testSchemaValidation } from './validation.test';
import { testCustomInstructions } from './instructions.test';
import { testRateLimiting } from './rateLimiting.test';
import { testErrorHandling } from './errorHandling.test';
import { testFallbackCategorization } from './fallback.test';
import { TestResult } from './helpers';

export interface WorkflowTestSuite {
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
 * Run complete AI workflow test suite
 */
export const runAIWorkflowTests = async (): Promise<WorkflowTestSuite> => {
  logDebug('=== Starting AI Workflow Validation Tests ===');

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
  logDebug('=== AI Workflow Test Results ===');
  Object.values(results).forEach(result => {
    if (typeof result === 'object' && 'passed' in result) {
      logDebug(
        `${result.passed ? '✓' : '✗'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`
      );
      if (result.error) {
        logError(`  Error: ${result.error}`);
      }
      if (result.details) {
        logDebug(`  Details:`, result.details);
      }
    }
  });
  logDebug(
    `Overall: ${results.overall.toUpperCase()} (${passedTests}/${totalTests} tests passed)`
  );

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
