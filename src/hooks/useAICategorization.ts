import { useCallback } from 'react';
import { getAICategorization } from '../services/aiService';
import { driveService } from '../services/googleDriveService';
import { Note } from '../types';
import { logError } from '../utils/logger';

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
      summary = summary.slice(0, 297).trim();
      const lastPunct = Math.max(
        summary.lastIndexOf('.'),
        summary.lastIndexOf('!'),
        summary.lastIndexOf('?')
      );
      if (lastPunct > 100) {
        summary = summary.slice(0, lastPunct + 1);
      } else {
        summary = summary.slice(0, 297) + '...';
      }
    }
  } else if (summary.length > 300) {
    // Truncate intelligently at sentence boundaries
    summary = summary.slice(0, 297).trim();
    const lastPunct = Math.max(
      summary.lastIndexOf('.'),
      summary.lastIndexOf('!'),
      summary.lastIndexOf('?')
    );
    if (lastPunct > 100) {
      summary = summary.slice(0, lastPunct + 1);
    } else {
      summary = summary.slice(0, 297) + '...';
    }
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
              return !categoryNamesLower.has(tag);
            })
            .filter(tag => {
              const words = tag.split(/\s+/);
              return words.length <= 2;
            })
        )
      ).slice(0, 5)
    : [];

  // If no tags generated, assign "misc" tag and ensure "Misc" category exists
  const finalTags = validTags.length === 0 ? ['misc'] : validTags;

  // If no tags were generated, ensure the category is "Misc"
  if (validTags.length === 0 && !categories.includes('Misc')) {
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

export function useAICategorization() {
  const applyAICategorization = useCallback(
    async (
      accessToken: string,
      noteId: string,
      content: string,
      customInstructions: string,
      onUpdate: (updates: Partial<Note>) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      try {
        const aiResult = await getAICategorization(content, customInstructions);
        if (!aiResult) {
          const error = new Error('AI categorization returned no result');
          onError?.(error);
          return;
        }

        const updates = processAIResult(aiResult, content);
        if (!updates) {
          const error = new Error('Failed to process AI result');
          onError?.(error);
          return;
        }

        await driveService.updateNote(accessToken, noteId, updates);
        onUpdate(updates);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logError('Failed to update note with AI results:', err);

        // Propagate rate limit errors
        if (
          error.message.includes('Too many') ||
          error.message.includes('rate limit')
        ) {
          onError?.(error);
          throw error;
        }

        onError?.(error);
      }
    },
    []
  );

  return { applyAICategorization, processAIResult };
}
