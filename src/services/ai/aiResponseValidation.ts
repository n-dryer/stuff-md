import { AICategorizationResult } from '../../types';
import { SchemaError } from './errors';

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

  if (candidate.summary.length < 100 || candidate.summary.length > 300) {
    if (candidate.summary.length < 100) {
      throw new SchemaError(
        `Summary length must be at least 100 characters (got ${candidate.summary.length}). Summaries must be 2-4 sentences and informative.`
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
          if (words.length > 2) {
            throw new SchemaError(
              `Tags must be 1-2 words each, found tag with more words: ${tag}`
            );
          }
          return true;
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

  // Validate and normalize icon
  const normalizedIcon = validateAndNormalizeIcon(
    candidate.icon.trim(),
    normalizedCategories
  );

  return {
    title: candidate.title.trim(),
    summary: candidate.summary.trim(),
    categories: normalizedCategories,
    tags: normalizedTags,
    icon: normalizedIcon,
    rationale: candidate.rationale.trim(),
  };
};

/**
 * Validate icon relevance to category and ensure uniqueness
 */
const isIconRelevantToCategory = (icon: string, category: string): boolean => {
  const mappings: Record<string, string[]> = {
    code: ['programming', 'code', 'development', 'dev', 'tech', 'technical'],
    'shopping-cart': ['shopping', 'personal', 'purchase', 'grocery', 'store'],
    link: ['link', 'url', 'bookmark', 'reference', 'web'],
    lightbulb: ['idea', 'note', 'thought', 'brainstorm', 'creative'],
  };

  const relevantTerms = mappings[icon] || [];
  return relevantTerms.some(term => category.includes(term));
};

/**
 * Derive icon from category path for uniqueness
 */
const deriveIconFromCategory = (categoryPath: string[]): string => {
  const primaryCategory = categoryPath[0]?.toLowerCase() || '';

  if (
    primaryCategory.includes('programming') ||
    primaryCategory.includes('code') ||
    primaryCategory.includes('dev') ||
    primaryCategory.includes('tech')
  ) {
    return 'code';
  }
  if (
    primaryCategory.includes('shopping') ||
    primaryCategory.includes('personal')
  ) {
    return 'shopping-cart';
  }
  if (primaryCategory.includes('link') || primaryCategory.includes('url')) {
    return 'link';
  }
  if (primaryCategory.includes('idea') || primaryCategory.includes('note')) {
    return 'lightbulb';
  }

  return 'default';
};

/**
 * Validate and normalize icon name based on category
 */
const validateAndNormalizeIcon = (
  icon: string,
  categoryPath: string[]
): string => {
  const normalized = icon.toLowerCase().trim().replace(/\s+/g, '-');
  const allowedIcons = [
    'lightbulb',
    'link',
    'code',
    'shopping-cart',
    'default',
  ];

  if (allowedIcons.includes(normalized)) {
    const primaryCategory = categoryPath[0]?.toLowerCase() || '';
    const isRelevant = isIconRelevantToCategory(normalized, primaryCategory);
    if (isRelevant) return normalized;
  }

  return deriveIconFromCategory(categoryPath);
};
