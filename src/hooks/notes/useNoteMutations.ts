import { useCallback } from 'react';
import { Note } from '../../types';
import {
  applyOptimisticUpdate,
  revertOptimisticUpdate,
} from '../../utils/optimisticUpdates';
import { googleDriveService } from '../../services/googleDriveService';
import { logError } from '../../utils/logger';

export function useNoteMutations(
  accessToken: string | null,
  notes: Note[],
  setNotes: (notes: Note[]) => void,
  onError: (error: Error) => void,
  refetch: () => void
) {
  const saveNote = useCallback(
    async (noteData: Omit<Note, 'id'>) => {
      if (!accessToken) return;

      const optimisticNote = { ...noteData, id: `temp-${Date.now()}` };
      const tempId = optimisticNote.id;
      const undo = applyOptimisticUpdate(setNotes, notes, optimisticNote);

      try {
        const newNote = await googleDriveService.createNote(
          accessToken,
          noteData
        );
        // Replace the optimistic note with the real note
        setNotes(currentNotes =>
          currentNotes.map(note => (note.id === tempId ? newNote : note))
        );
        return newNote;
      } catch (error) {
        revertOptimisticUpdate(undo);
        onError(error as Error);
        // Log error but don't display here - let the caller handle display
        logError('Failed to save note:', error);
        throw error;
      }
    },
    [accessToken, notes, setNotes, onError]
  );

  const updateNote = useCallback(
    async (noteId: string, noteData: Partial<Note>) => {
      if (!accessToken) return;

      const existingNote = notes.find(n => n.id === noteId);
      if (!existingNote) {
        throw new Error(`Note with id ${noteId} not found`);
      }
      const updatedNote = {
        ...existingNote,
        ...noteData,
        id: noteId,
      };
      const undo = applyOptimisticUpdate(setNotes, notes, updatedNote);
      setNotes(notes.map(n => (n.id === noteId ? updatedNote : n)));

      try {
        await googleDriveService.updateNote(accessToken, noteId, noteData);
      } catch (error) {
        revertOptimisticUpdate(undo);
        onError(error as Error);
        // Log error but don't display here - let the caller handle display
        logError('Failed to update note:', error);
        throw error;
      }
    },
    [accessToken, notes, setNotes, onError]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!accessToken) return;

      const noteToDelete = notes.find(n => n.id === noteId);
      if (!noteToDelete) return;

      const undo = applyOptimisticUpdate(setNotes, notes, noteToDelete, true);

      try {
        await googleDriveService.deleteNote(accessToken, noteId);
      } catch (error) {
        revertOptimisticUpdate(undo);
        onError(error as Error);
        // Log error but don't display here - let the caller handle display
        logError('Failed to delete note:', error);
        throw error;
      }
    },
    [accessToken, notes, setNotes, onError]
  );

  const deleteNotesByIds = useCallback(
    async (noteIds: string[]) => {
      if (!accessToken) return;

      const notesToDelete = notes.filter(n => noteIds.includes(n.id));
      if (notesToDelete.length === 0) return;

      const undo = applyOptimisticUpdate(setNotes, notes, notesToDelete, true);

      try {
        await googleDriveService.deleteNotesByIds(accessToken, noteIds);
      } catch (error) {
        revertOptimisticUpdate(undo);
        onError(error as Error);
        // Log error but don't display here - let the caller handle display
        logError('Failed to delete notes:', error);
        throw error;
      }
    },
    [accessToken, notes, setNotes, onError]
  );

  return { saveNote, updateNote, deleteNote, deleteNotesByIds };
}
