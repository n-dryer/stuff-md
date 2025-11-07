import { useCallback } from 'react';
import { Note } from '../types';
import { useNotesQuery } from './notes/useNotesQuery';
import { useNoteMutations } from './notes/useNoteMutations';
import { useAICategorizationFlow } from './notes/useAICategorizationFlow';
import { validateNoteContent } from '../utils/inputValidation';
import { getAICategorization } from '../services/aiService';
import { processAIResult } from './useAICategorization';
import { logError } from '../utils/logger';

export function useNotes(accessToken: string | null) {
  const { notes, setNotes, isLoading, error, refetch } =
    useNotesQuery(accessToken);
  const onError = useCallback((_e: Error) => {
    // No-op here; consumers already read `error` from query hook if needed.
    // Kept to satisfy optimistic helpers' error handler.
  }, []);
  const { saveNote, updateNote, deleteNote, deleteNotesByIds } =
    useNoteMutations(accessToken, notes, setNotes, onError, refetch);
  const { regenerateNote } = useAICategorizationFlow(updateNote);

  const saveNoteWithAI = useCallback(
    async (
      content: string,
      customInstructions: string
    ): Promise<Omit<Note, 'id'>> => {
      const validatedContent = validateNoteContent(content);
      const noteData: Omit<Note, 'id'> = {
        name: validatedContent.slice(0, 100).trim() || 'Untitled',
        content: validatedContent,
        title: validatedContent.slice(0, 100).trim() || 'Untitled',
        summary: 'Processing...',
        date: new Date().toISOString(),
        categoryPath: ['Misc'],
        tags: ['misc'],
        aiGenerated: null,
      };

      // Create the note first with placeholder data
      const createdNote = await saveNote(noteData);

      // Then asynchronously call AI service to generate title, summary, tags, and categoryPath
      getAICategorization(validatedContent, customInstructions)
        .then(aiResult => {
          if (aiResult) {
            const processed = processAIResult(aiResult, validatedContent);
            if (processed) {
              // Update the note with AI-generated data
              updateNote(createdNote.id, processed).catch(error => {
                logError(
                  'Failed to update note with AI categorization:',
                  error
                );
              });
            }
          }
        })
        .catch(error => {
          logError('AI categorization failed:', error);
          // Note remains with default Misc category and placeholder data
        });

      return noteData;
    },
    [saveNote, updateNote]
  );

  const deleteTagFromNote = useCallback(
    async (noteId: string, tagToDelete: string): Promise<void> => {
      const target = notes.find(n => n.id === noteId);
      if (!target) return;
      const updatedTags = target.tags.filter(t => t !== tagToDelete);
      await updateNote(noteId, { tags: updatedTags });
    },
    [notes, updateNote]
  );

  return {
    notes,
    isLoading,
    error,
    fetchNotes: refetch,
    saveNote: saveNoteWithAI,
    updateNote,
    regenerateNote: regenerateNote,
    deleteTagFromNote,
    deleteNote,
    deleteNotesByIds,
  };
}
