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
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const useNoteHandlers = ({
  accessToken,
  draft,
  saveNote,
  regenerateNote,
  customInstructions,
  displayFeedback,
  noteInputRef,
}: UseNoteHandlersProps) => {
  const handleSaveNote = useCallback(async () => {
    if (!accessToken || !draft.trim()) return;

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
  }, [displayFeedback]);

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      await handleSaveNote(note, newContent, true);
    },
    [customInstructions, displayFeedback, regenerateNote]
  );

  return {
    handleSaveNote,
    handleUpdateAndRecategorizeNote,
  };
};
