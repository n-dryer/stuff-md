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
  setDraft: (draft: string) => void;
  setShowNoteSavedToast: (show: boolean) => void;
}

export const useNoteHandlers = ({
  accessToken,
  draft,
  saveNote,
  regenerateNote,
  customInstructions,
  displayFeedback,
  noteInputRef,
  setDraft,
  setShowNoteSavedToast,
}: UseNoteHandlersProps) => {
  const handleSaveNote = useCallback(async () => {
    if (!accessToken || !draft.trim()) return;

    try {
      await saveNote(draft, customInstructions);
      setDraft('');
      if (noteInputRef.current) {
        noteInputRef.current.style.height = 'auto';
      }
      setShowNoteSavedToast(true);
    } catch (error) {
      logError('Error saving note:', error);
      displayFeedback('error', 'Failed to save note.');
    }
  }, [
    accessToken,
    draft,
    customInstructions,
    displayFeedback,
    noteInputRef,
    setDraft,
    setShowNoteSavedToast,
    saveNote,
  ]);

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      try {
        await regenerateNote(note, newContent, customInstructions);
        displayFeedback('success', 'Note updated.');
      } catch (error) {
        logError('Failed to update note:', error);
        displayFeedback('error', 'Failed to update note.');
      }
    },
    [customInstructions, displayFeedback, regenerateNote]
  );

  return {
    handleSaveNote,
    handleUpdateAndRecategorizeNote,
  };
};
