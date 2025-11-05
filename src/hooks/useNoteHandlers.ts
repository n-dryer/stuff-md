import React, { useCallback, useRef, useMemo } from 'react';
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
  // Store latest function references to avoid recreating limiters
  const saveNoteRef = useRef(saveNote);
  const deleteNoteRef = useRef(deleteNote);
  const regenerateNoteRef = useRef(regenerateNote);

  // Update refs when functions change
  saveNoteRef.current = saveNote;
  deleteNoteRef.current = deleteNote;
  regenerateNoteRef.current = regenerateNote;

  // Create stable rate limiters that use refs to always call latest functions
  // This prevents unnecessary recreation while ensuring latest functions are called
  const saveLimiter = useMemo(
    () =>
      rateLimit(
        (...args) => saveNoteRef.current(...args),
        { minInterval: 300, maxCalls: 10, windowMs: 60000 }
      ),
    [] // Empty deps - limiter is stable, uses ref for latest function
  );

  const deleteLimiter = useMemo(
    () =>
      rateLimit(
        (...args) => deleteNoteRef.current(...args),
        { minInterval: 500, maxCalls: 20, windowMs: 60000 }
      ),
    [] // Empty deps - limiter is stable, uses ref for latest function
  );

  const updateLimiter = useMemo(
    () =>
      rateLimit(
        (...args) => regenerateNoteRef.current(...args),
        { minInterval: 2000, maxCalls: 5, windowMs: 60000 }
      ),
    [] // Empty deps - limiter is stable, uses ref for latest function
  );

  const handleSaveNote = useCallback(async () => {
    if (!accessToken || !draft.trim()) return;

    try {
      await saveLimiter(draft, customInstructions);
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
    saveLimiter,
  ]);

  const handleConfirmDelete = useCallback(
    async (noteToDelete: string | null) => {
      if (!noteToDelete) return;
      try {
        await deleteLimiter(noteToDelete);
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
    [setNoteToDelete, displayFeedback, deleteLimiter]
  );

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      try {
        await updateLimiter(note, newContent, customInstructions);
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
    [customInstructions, displayFeedback, updateLimiter]
  );

  return {
    handleSaveNote,
    handleConfirmDelete,
    handleUpdateAndRecategorizeNote,
  };
};
