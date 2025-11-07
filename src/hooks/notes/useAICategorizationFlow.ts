import { useCallback } from 'react';
import { Note } from '../../types';
import { usePerNoteRateLimit } from '../usePerNoteRateLimit';
import {
  getAICategorization,
  SYSTEM_INSTRUCTION,
} from '../../services/aiService';
import { processAIResult } from '../useAICategorization';
import { validateNoteContent } from '../../utils/inputValidation';

export function useAICategorizationFlow(
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
) {
  const { checkRateLimit } = usePerNoteRateLimit();

  const regenerateNote = useCallback(
    async (note: Note, newContent: string, customInstructions: string) => {
      checkRateLimit(note.id);

      const validatedContent = validateNoteContent(newContent);
      // Use SYSTEM_INSTRUCTION as default if customInstructions is empty or whitespace
      const useDefault = !(customInstructions || '').trim();
      const instructionsToUse = useDefault
        ? SYSTEM_INSTRUCTION
        : customInstructions;

      const aiResult = await getAICategorization(
        validatedContent,
        instructionsToUse
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
