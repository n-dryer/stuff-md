/**
 * Summary Enhancement Utilities
 *
 * Functions for enhancing and generating summaries to meet
 * the 100-300 character requirement with 2-4 sentences.
 */

function truncateAtSentenceBoundary(text: string, maxLength: number): string {
  let truncated = text.slice(0, maxLength - 3).trim();
  const lastPunct = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  if (lastPunct > 100) {
    truncated = truncated.slice(0, lastPunct + 1);
  } else {
    truncated = text.slice(0, maxLength - 3) + '...';
  }
  return truncated;
}

/**
 * Enhances a summary to ensure it meets length requirements (100-300 chars)
 */
export const enhanceSummary = (summary: string, content: string): string => {
  let enhanced = summary.trim();
  const contentTrimmed = content.trim();

  if (enhanced.length < 100) {
    if (enhanced.length > 20) {
      const sentences = contentTrimmed
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      // Find sentences that aren't already in summary
      const summaryWords = new Set(
        enhanced
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 2)
      );

      for (const sentence of sentences) {
        const sentenceWords = new Set(
          sentence
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2)
        );
        // Check if sentence adds new information
        const hasNewInfo = Array.from(sentenceWords).some(
          w => !summaryWords.has(w)
        );

        if (hasNewInfo && enhanced.length + sentence.length + 2 <= 300) {
          const newSummary = `${enhanced} ${sentence}.`;
          if (newSummary.length >= 100) {
            return newSummary.slice(0, 300).trim();
          }
          enhanced = newSummary;
          // Update summary words for next iteration
          const newWords = newSummary
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2);
          newWords.forEach(w => summaryWords.add(w));
        }
      }

      if (enhanced.length < 100) {
        return `${enhanced} This content has been automatically organized and categorized for easy retrieval and future reference.`;
      }
    } else {
      return generateFallbackSummary(content);
    }
  }

  if (enhanced.length > 300) {
    return truncateAtSentenceBoundary(enhanced, 300);
  }

  return enhanced;
};

/**
 * Generates a fallback summary when AI fails to provide one
 */
export const generateFallbackSummary = (content: string): string => {
  const trimmed = content.trim();

  const sentences = trimmed
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (trimmed.length < 100) {
    const firstPart = trimmed.slice(0, Math.min(50, trimmed.length));
    return `${firstPart}. This note contains essential information that requires organization and categorization for future reference. The content has been automatically categorized to help with retrieval and management.`;
  }

  let summary = '';
  let charCount = 0;

  for (const sentence of sentences) {
    if (charCount + sentence.length + 2 <= 300) {
      if (summary) summary += ' ';
      summary += sentence;
      charCount = summary.length;

      if (charCount >= 100 && sentences.length > 1) {
        break;
      }
    } else {
      break;
    }
  }

  if (summary.length >= 100) {
    const lastPeriod = summary.lastIndexOf('.');
    const lastExclamation = summary.lastIndexOf('!');
    const lastQuestion = summary.lastIndexOf('?');
    const lastPunct = Math.max(lastPeriod, lastExclamation, lastQuestion);

    if (lastPunct > 0 && summary.length - lastPunct - 1 > 50) {
      summary = summary.slice(0, lastPunct + 1);
    }

    if (summary.length > 300) {
      summary = truncateAtSentenceBoundary(summary, 300);
    }

    if (summary.length < 100) {
      summary += ` This content has been automatically organized and categorized for easy retrieval and management.`;
    }

    return summary;
  }

  // Fallback: create structured summary
  const firstPart = trimmed.slice(0, Math.min(150, trimmed.length));
  const words = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);
  const topic = words.slice(0, 3).join(' ');

  summary = `${firstPart}${firstPart.length < trimmed.length ? '...' : ''} This note contains information about ${topic || 'various topics'}. The content has been automatically categorized to facilitate organization and future reference.`;

  // Ensure it's in the 100-300 range
  if (summary.length < 100) {
    summary += ` Additional context and details are preserved in the full note content for comprehensive understanding.`;
  } else if (summary.length > 300) {
    summary = truncateAtSentenceBoundary(summary, 300);
  }

  return summary;
};
