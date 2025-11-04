import { AICategorizationResult } from '../../types';
import { SchemaError } from '../aiService';

/**
 * Validate and parse AI response
 */
export const validateAndParseResponse = (
  jsonString: string
): AICategorizationResult => {
  let parsedResult: unknown;
  try {
    parsedResult = JSON.parse(jsonString);
  } catch {
    throw new SchemaError('AI returned invalid JSON payload');
  }

  const candidate = parsedResult as Partial<AICategorizationResult>;

  // Validate required fields
  if (
    typeof candidate.title !== 'string' ||
    typeof candidate.summary !== 'string' ||
    !Array.isArray(candidate.categories) ||
    !Array.isArray(candidate.tags) ||
    typeof candidate.icon !== 'string' ||
    typeof candidate.rationale !== 'string'
  ) {
    throw new SchemaError(
      'Invalid AI response schema - missing required fields'
    );
  }

  // Validate constraints with better error messages
  if (candidate.title.length < 10 || candidate.title.length > 100) {
    throw new SchemaError(
      `Title length must be between 10 and 100 characters, got ${candidate.title.length}`
    );
  }

  if (candidate.summary.length < 50 || candidate.summary.length > 300) {
    // Allow slightly shorter summaries but warn in dev
    if (import.meta.env.DEV && candidate.summary.length < 50) {
      console.warn(
        `[AI Service] Summary is shorter than recommended (${candidate.summary.length} chars, min 50)`
      );
    }
    if (candidate.summary.length > 300) {
      throw new SchemaError(
        `Summary length must not exceed 300 characters, got ${candidate.summary.length}`
      );
    }
  }

  if (candidate.categories.length < 1 || candidate.categories.length > 3) {
    throw new SchemaError(
      `Categories must have 1-3 items, got ${candidate.categories.length}`
    );
  }

  if (candidate.tags.length > 5) {
    throw new SchemaError(
      `Tags must have at most 5 items, got ${candidate.tags.length}`
    );
  }

  // Validate tag format (each tag should be 1-2 words)
  const invalidTags = candidate.tags.filter(tag => {
    const str = String(tag).trim();
    if (str.length === 0) return true;
    const words = str.split(/\s+/);
    return words.length > 2;
  });
  if (invalidTags.length > 0) {
    throw new SchemaError(
      `Tags must be 1-2 words each, found tags with more words: ${invalidTags.join(', ')}`
    );
  }

  // Normalize tags: lowercase, trim, deduplicate, validate format (max 2 words)
  const normalizedTags = Array.from(
    new Set(
      candidate.tags
        .map(tag =>
          typeof tag === 'string'
            ? tag.toLowerCase().trim()
            : String(tag).toLowerCase().trim()
        )
        .filter(tag => {
          if (tag.length === 0) return false;
          // Validate tag format: max 2 words
          const words = tag.split(/\s+/);
          return words.length <= 2;
        })
    )
  ).slice(0, 5);

  // Normalize categories: handle multi-word categories (e.g., "Personal / Shopping")
  const normalizedCategories = candidate.categories
    .map(cat => {
      const str = String(cat).trim();
      if (str.length === 0) return str;
      // Handle multi-word categories with separators (/, -, etc.)
      if (str.includes(' / ')) {
        // Preserve structure for multi-part categories
        return str
          .split(' / ')
          .map(part => {
            const trimmed = part.trim();
            if (trimmed.length === 0) return trimmed;
            return (
              trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
            );
          })
          .join(' / ');
      }
      // Standard PascalCase for single categories
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    })
    .filter(cat => cat.length > 0); // Remove empty categories

  return {
    title: candidate.title.trim(),
    summary: candidate.summary.trim(),
    categories: normalizedCategories,
    tags: normalizedTags,
    icon: candidate.icon.trim().toLowerCase(),
    rationale: candidate.rationale.trim(),
  };
};
