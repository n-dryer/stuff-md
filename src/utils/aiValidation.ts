import { AICategorizationResult } from '../types';

/**
 * Validates AI-generated title
 * @param title The title to validate
 * @returns true if valid, throws error if invalid
 */
export const validateTitle = (title: string): boolean => {
  if (typeof title !== 'string') {
    throw new Error('Title must be a string');
  }

  const trimmed = title.trim();

  if (trimmed.length < 10) {
    throw new Error(`Title too short: minimum 10 characters, got ${trimmed.length}`);
  }

  if (trimmed.length > 100) {
    throw new Error(`Title too long: maximum 100 characters, got ${trimmed.length}`);
  }

  // Reject generic titles
  const genericTitles = ['untitled', 'note', 'new note', 'untitled note', 'no title'];
  if (genericTitles.includes(trimmed.toLowerCase())) {
    throw new Error('Title is too generic and not informative');
  }

  return true;
};

/**
 * Validates AI-generated summary
 * @param summary The summary to validate
 * @returns true if valid, throws error if invalid
 */
export const validateSummary = (summary: string): boolean => {
  if (typeof summary !== 'string') {
    throw new Error('Summary must be a string');
  }

  const trimmed = summary.trim();

  if (trimmed.length < 50) {
    throw new Error(`Summary too short: minimum 50 characters, got ${trimmed.length}`);
  }

  if (trimmed.length > 300) {
    throw new Error(`Summary too long: maximum 300 characters, got ${trimmed.length}`);
  }

  return true;
};

/**
 * Validates category structure and depth
 * @param categories The category path array
 * @returns true if valid, throws error if invalid
 */
export const validateCategories = (categories: string[]): boolean => {
  if (!Array.isArray(categories)) {
    throw new Error('Categories must be an array');
  }

  if (categories.length < 1) {
    throw new Error('Categories must have at least 1 item');
  }

  if (categories.length > 3) {
    throw new Error(`Categories must have at most 3 items, got ${categories.length}`);
  }

  // Validate each category is a non-empty string
  categories.forEach((cat, index) => {
    if (typeof cat !== 'string') {
      throw new Error(`Category at index ${index} must be a string`);
    }
    if (cat.trim().length === 0) {
      throw new Error(`Category at index ${index} cannot be empty`);
    }
  });

  return true;
};

/**
 * Validates tags (count, format, uniqueness)
 * @param tags The tags array
 * @returns true if valid, throws error if invalid
 */
export const validateTags = (tags: string[]): boolean => {
  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }

  if (tags.length > 5) {
    throw new Error(`Tags must have at most 5 items, got ${tags.length}`);
  }

  // Validate each tag
  tags.forEach((tag, index) => {
    if (typeof tag !== 'string') {
      throw new Error(`Tag at index ${index} must be a string`);
    }

    const trimmed = tag.trim().toLowerCase();
    if (trimmed.length === 0) {
      throw new Error(`Tag at index ${index} cannot be empty`);
    }

    // Check for multi-word tags (should be 1-2 words max)
    const words = trimmed.split(/\s+/);
    if (words.length > 2) {
      throw new Error(`Tag at index ${index} should be 1-2 words, got ${words.length}`);
    }
  });

  // Check for duplicates
  const normalizedTags = tags.map(t => t.trim().toLowerCase());
  const uniqueTags = new Set(normalizedTags);
  if (uniqueTags.size !== normalizedTags.length) {
    throw new Error('Tags must be unique');
  }

  return true;
};

/**
 * Validates icon name
 * @param icon The icon name string
 * @returns true if valid, throws error if invalid
 */
export const validateIcon = (icon: string): boolean => {
  if (typeof icon !== 'string') {
    throw new Error('Icon must be a string');
  }

  if (icon.trim().length === 0) {
    throw new Error('Icon cannot be empty');
  }

  return true;
};

/**
 * Validates rationale
 * @param rationale The rationale string
 * @returns true if valid, throws error if invalid
 */
export const validateRationale = (rationale: string): boolean => {
  if (typeof rationale !== 'string') {
    throw new Error('Rationale must be a string');
  }

  const trimmed = rationale.trim();

  if (trimmed.length < 10) {
    throw new Error(`Rationale too short: minimum 10 characters, got ${trimmed.length}`);
  }

  if (trimmed.length > 200) {
    throw new Error(`Rationale too long: maximum 200 characters, got ${trimmed.length}`);
  }

  return true;
};

/**
 * Validates a complete AI categorization result
 * @param result The AI categorization result to validate
 * @returns true if valid, throws error with details if invalid
 */
export const validateAICategorizationResult = (result: Partial<AICategorizationResult>): boolean => {
  const errors: string[] = [];

  try {
    validateTitle(result.title || '');
  } catch (e) {
    errors.push(`Title: ${(e as Error).message}`);
  }

  try {
    validateSummary(result.summary || '');
  } catch (e) {
    errors.push(`Summary: ${(e as Error).message}`);
  }

  try {
    validateCategories(result.categories || []);
  } catch (e) {
    errors.push(`Categories: ${(e as Error).message}`);
  }

  try {
    validateTags(result.tags || []);
  } catch (e) {
    errors.push(`Tags: ${(e as Error).message}`);
  }

  try {
    validateIcon(result.icon || '');
  } catch (e) {
    errors.push(`Icon: ${(e as Error).message}`);
  }

  try {
    validateRationale(result.rationale || '');
  } catch (e) {
    errors.push(`Rationale: ${(e as Error).message}`);
  }

  if (errors.length > 0) {
    throw new Error(`AI categorization validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

