import { getAICategorization } from '../services/aiService';
import { Note } from '../types';

function truncateSummary(summary: string): string {
  let truncated = summary.slice(0, 297).trim();
  const lastPunct = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  if (lastPunct > 100) {
    truncated = truncated.slice(0, lastPunct + 1);
  } else {
    truncated = truncated.slice(0, 297) + '...';
  }
  return truncated;
}

export function processAIResult(
  aiResult: Awaited<ReturnType<typeof getAICategorization>>,
  content: string
): Partial<Note> | null {
  if (!aiResult) return null;

  const displayTitle = aiResult.title || content.slice(0, 100).trim();

  let summary = aiResult.summary || '';

  // Ensure summary is within 100-300 char range
  summary = summary.trim();

  if (!summary || summary.length < 100) {
    // If summary is too short or missing, create a meaningful one from content
    const trimmed = content.trim();
    if (trimmed.length < 100) {
      summary = `${trimmed}. This note contains essential information that requires organization and categorization for future reference. The content has been automatically categorized to help with retrieval and management.`;
    } else {
      // Extract first meaningful sentences
      const sentences = trimmed
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 3);

      if (sentences.length > 0) {
        summary = sentences.join('. ') + '.';
        if (summary.length < 100) {
          summary += ` This content has been automatically organized and categorized for easy retrieval and management.`;
        }
      } else {
        summary = `${trimmed.slice(0, 80)}... This note contains important information that has been automatically categorized for organization and future reference.`;
      }
    }

    // Ensure it's in range
    if (summary.length > 300) {
      summary = truncateSummary(summary);
    }
  } else if (summary.length > 300) {
    // Truncate intelligently at sentence boundaries
    summary = truncateSummary(summary);
  }

  let categories = aiResult.categories || ['Misc'];
  if (
    categories.length === 0 ||
    !categories.some(cat => cat && cat.trim().length > 0)
  ) {
    categories = ['Misc'];
  }
  const categoryNamesLower = new Set(
    categories.map(cat => cat.toLowerCase().trim())
  );
  const validTags = aiResult.tags
    ? Array.from(
        new Set(
          aiResult.tags
            .map(tag =>
              typeof tag === 'string'
                ? tag.toLowerCase().trim()
                : String(tag).toLowerCase().trim()
            )
            .filter(tag => {
              if (tag.length === 0) return false;
              if (categoryNamesLower.has(tag)) return false;
              const words = tag.split(/\s+/);
              return words.length <= 2;
            })
        )
      ).slice(0, 5)
    : [];

  // If no tags generated, assign "misc" tag and ensure "Misc" category exists
  const finalTags = validTags.length === 0 ? ['misc'] : validTags;
  if (validTags.length === 0) {
    categories = ['Misc'];
  }

  return {
    title: displayTitle,
    summary,
    categoryPath: categories,
    tags: finalTags,
    aiGenerated: {
      title: aiResult.title,
      summary: aiResult.summary,
      rationale: aiResult.rationale,
    },
  };
}
