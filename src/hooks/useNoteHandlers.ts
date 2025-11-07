import React, { useCallback } from 'react';
import { Note } from '../types';
import { logError } from '../utils/logger';

interface UseNoteHandlersProps {
  accessToken: string | null;
  draft: string;
  saveNote: (
    content: string,
    customInstructions: string
  ) => Promise<Omit<Note, 'id'>>;
  regenerateNote: (
    note: Note,
    newContent: string,
    customInstructions: string
  ) => Promise<void>;
  customInstructions: string;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const useNoteHandlers = ({
  accessToken,
  draft,
  saveNote,
  regenerateNote,
  customInstructions,
  noteInputRef,
}: UseNoteHandlersProps) => {
  const handleSaveNote = useCallback(async () => {
    if (!accessToken || !draft.trim()) {
      logError('Cannot save note: missing accessToken or empty draft', {
        hasAccessToken: !!accessToken,
        hasDraft: !!draft.trim(),
      });
      throw new Error('Cannot save note: missing access token or empty draft');
    }

    try {
      const result = await saveNote(draft, customInstructions);
      if (noteInputRef.current) {
        noteInputRef.current.style.height = 'auto';
      }
      return result;
    } catch (error) {
      logError('Error saving note:', error);
      // Don't display a generic error message here.
      // Let the specific error from the service layer propagate.
      throw error;
    }
  }, [accessToken, draft, saveNote, customInstructions, noteInputRef]);

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      await regenerateNote(note, newContent, customInstructions);
    },
    [regenerateNote, customInstructions]
  );

  return {
    handleSaveNote,
    handleUpdateAndRecategorizeNote,
  };
};
