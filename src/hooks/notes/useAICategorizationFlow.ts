import { useCallback } from 'react';
import { Note } from '../../types';
import { usePerNoteRateLimit } from '../usePerNoteRateLimit';
import { getAICategorization } from '../../services/aiService';
import { processAIResult } from '../useAICategorization';
import {
  validateCustomInstructions,
  validateNoteContent,
} from '../../utils/inputValidation';

export function useAICategorizationFlow(
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
) {
  const { checkRateLimit } = usePerNoteRateLimit();

  const regenerateNote = useCallback(
    async (note: Note, newContent: string, customInstructions: string) => {
      checkRateLimit(note.id);

      const validatedContent = validateNoteContent(newContent);
      const validatedInstructions = validateCustomInstructions(
        customInstructions || ''
      );

      const aiResult = await getAICategorization(
        validatedContent,
        validatedInstructions
      );
      const processed = aiResult
        ? processAIResult(aiResult, validatedContent)
        : null;

      const updates: Partial<Note> = {
        content: validatedContent,
        ...(processed ?? {}),
      };

      await updateNote(note.id, updates);
    },
    [checkRateLimit, updateNote]
  );

  return { regenerateNote };
}


