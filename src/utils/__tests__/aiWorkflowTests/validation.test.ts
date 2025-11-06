/**
 * Summary and Schema Validation Tests
 */

import { getAICategorization } from '../../../services/aiService';
import { TestResult } from './helpers';

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
