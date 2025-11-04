import React, { useCallback, useRef } from 'react';
import { Note } from '../types';
import { logError } from '../utils/logger';
import { rateLimit } from '../utils/rateLimiter';

interface UseNoteHandlersProps {
  accessToken: string | null;
  draft: string;
  saveNote: (
    content: string,
    customInstructions: string
  ) => Promise<Omit<Note, 'id'>>;
  deleteNote: (noteId: string) => Promise<void>;
  regenerateNote: (
    note: Note,
    newContent: string,
    customInstructions: string
  ) => Promise<void>;
  customInstructions: string;
  displayFeedback: (
    message: string,
    type: 'success' | 'error' | 'info'
  ) => void;
  noteInputRef: React.RefObject<HTMLTextAreaElement>;
  setDraft: (draft: string) => void;
  setNoteToDelete: (noteId: string | null) => void;
  setShowNoteSavedToast: (show: boolean) => void;
}

export const useNoteHandlers = ({
  accessToken,
  draft,
  saveNote,
  deleteNote,
  regenerateNote,
  customInstructions,
  displayFeedback,
  noteInputRef,
  setDraft,
  setNoteToDelete,
  setShowNoteSavedToast,
}: UseNoteHandlersProps) => {
  // Rate limiters - shared across re-renders
  const saveLimiterRef = useRef(
    rateLimit(saveNote, { minInterval: 300, maxCalls: 10, windowMs: 60000 })
  );
  const deleteLimiterRef = useRef(
    rateLimit(deleteNote, { minInterval: 500, maxCalls: 20, windowMs: 60000 })
  );
  const updateLimiterRef = useRef(
    rateLimit(regenerateNote, {
      minInterval: 2000,
      maxCalls: 5,
      windowMs: 60000,
    })
  );

  // Update rate limiters when functions change
  saveLimiterRef.current = rateLimit(saveNote, {
    minInterval: 300,
    maxCalls: 10,
    windowMs: 60000,
  });
  deleteLimiterRef.current = rateLimit(deleteNote, {
    minInterval: 500,
    maxCalls: 20,
    windowMs: 60000,
  });
  updateLimiterRef.current = rateLimit(regenerateNote, {
    minInterval: 2000,
    maxCalls: 5,
    windowMs: 60000,
  });

  const handleSaveNote = useCallback(async () => {
    if (!accessToken || !draft.trim()) return;

    try {
      await saveLimiterRef.current(draft, customInstructions);
      setDraft('');
      if (noteInputRef.current) {
        noteInputRef.current.style.height = 'auto';
      }
      setShowNoteSavedToast(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        displayFeedback(error.message, 'error');
      } else {
        logError('Error saving note:', error);
        displayFeedback('Failed to save note.', 'error');
      }
    }
  }, [
    accessToken,
    draft,
    customInstructions,
    displayFeedback,
    noteInputRef,
    setDraft,
    setShowNoteSavedToast,
  ]);

  const handleConfirmDelete = useCallback(
    async (noteToDelete: string | null) => {
      if (!noteToDelete) return;
      try {
        await deleteLimiterRef.current(noteToDelete);
        displayFeedback('Note deleted.', 'success');
      } catch (error) {
        if (error instanceof Error && error.message.includes('Rate limit')) {
          displayFeedback(error.message, 'error');
        } else {
          logError('Failed to delete note:', error);
          displayFeedback('Failed to delete note.', 'error');
        }
      } finally {
        setNoteToDelete(null);
      }
    },
    [setNoteToDelete, displayFeedback]
  );

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      try {
        await updateLimiterRef.current(note, newContent, customInstructions);
        displayFeedback('Note updated.', 'success');
      } catch (error) {
        if (error instanceof Error && error.message.includes('Rate limit')) {
          displayFeedback(error.message, 'error');
        } else {
          logError('Failed to update note:', error);
          displayFeedback('Failed to update note.', 'error');
        }
      }
    },
    [customInstructions, displayFeedback]
  );

  return {
    handleSaveNote,
    handleConfirmDelete,
    handleUpdateAndRecategorizeNote,
  };
};
