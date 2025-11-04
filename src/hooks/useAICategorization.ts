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

  let summary = aiResult.summary || 'No summary generated.';
  if (summary.length < 50) {
    summary = summary.trim() || 'No summary generated.';
  } else if (summary.length > 300) {
    summary = summary.slice(0, 297).trim() + '...';
  } else {
    summary = summary.trim();
  }

  let categories = aiResult.categories || ['Uncategorized'];
  if (
    categories.length === 0 ||
    !categories.some(cat => cat && cat.trim().length > 0)
  ) {
    categories = ['Uncategorized'];
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

  return {
    title: displayTitle,
    summary,
    categoryPath: categories,
    tags: validTags,
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
      onUpdate: (updates: Partial<Note>) => void
    ): Promise<void> => {
      try {
        const aiResult = await getAICategorization(content, customInstructions);
        if (!aiResult) return;

        const updates = processAIResult(aiResult, content);
        if (!updates) return;

        await driveService.updateNote(accessToken, noteId, updates);
        onUpdate(updates);
      } catch (err) {
        logError('Failed to update note with AI results:', err);
      }
    },
    []
  );

  return { applyAICategorization, processAIResult };
}
