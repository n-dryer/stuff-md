/**
 * Fallback Categorization
 *
 * Provides fallback categorization when AI fails.
 * Uses keyword-based detection to categorize content.
 */

import { AICategorizationResult } from '../../types';
import { generateFallbackSummary } from './summaryEnhancement';

/**
 * Fallback categorization when AI fails
 */
export const createFallbackCategorization = (
  content: string
): AICategorizationResult => {
  const trimmed = content.trim();
  const words = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5);

  const title = trimmed.slice(0, 100).trim() || 'Untitled Note';
  const summary = generateFallbackSummary(content);

  // Basic keyword-based category detection
  const categoryMap = new Map<string, { category: string; icon: string }>([
    ['programming', { category: 'Programming', icon: 'code' }],
    ['shopping', { category: 'Personal', icon: 'shopping-cart' }],
    ['link', { category: 'Links', icon: 'link' }],
  ]);

  let category = 'Misc';
  let icon = 'default';
  const lowerContent = content.toLowerCase();

  for (const [keyword, value] of categoryMap.entries()) {
    if (lowerContent.includes(keyword)) {
      category = value.category;
      icon = value.icon;
      break;
    }
  }

  return {
    title,
    summary,
    categories: [category],
    tags: words.length > 0 ? words.slice(0, 5) : ['misc'],
    icon,
    rationale: `Fallback categorization based on content keywords. Category: ${category}.`,
  };
};
