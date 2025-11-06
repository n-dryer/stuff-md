/**
 * Shared test utilities and types for AI workflow tests
 */

import { AICategorizationResult } from '../../../types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

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
