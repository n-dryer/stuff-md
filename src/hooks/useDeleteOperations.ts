import { useCallback } from 'react';
import { Note } from '../types';
import { useModalActions } from '../contexts/ModalContext';
import { handleError } from '../utils/errorHandler';

interface UseDeleteOperationsProps {
  accessToken: string | null;
  notes: Note[];
  deleteNote: (noteId: string) => Promise<void>;
  deleteNotesByIds: (noteIds: string[]) => Promise<void>;
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
  closeEditModal: () => void;
  noteToDelete: Note | null;
  notesToDelete: string[];
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
}

export const useDeleteOperations = ({
  accessToken,
  notes,
  deleteNote,
  deleteNotesByIds,
  displayFeedback,
  closeEditModal,
  noteToDelete,
  notesToDelete,
  isDeleting,
  setIsDeleting,
}: UseDeleteOperationsProps) => {
  const { closeDeleteAllModal, closeDeleteSelectedModal, setNoteToDelete } =
    useModalActions();

  const handleConfirmDelete = useCallback(async () => {
    if (noteToDelete && accessToken && !isDeleting) {
      setIsDeleting(true);
      try {
        await deleteNote(noteToDelete.id);
        displayFeedback('success', 'Stuff deleted.');
        setNoteToDelete(null);
      } catch (error) {
        handleError(
          error,
          displayFeedback,
          'Failed to delete stuff.',
          'useDeleteOperations:handleConfirmDelete'
        );
      } finally {
        setIsDeleting(false);
        closeEditModal();
      }
    }
  }, [
    noteToDelete,
    accessToken,
    isDeleting,
    setIsDeleting,
    deleteNote,
    displayFeedback,
    closeEditModal,
    setNoteToDelete,
  ]);

  const handleConfirmDeleteAll = useCallback(async () => {
    if (!accessToken || isDeleting) return;
    setIsDeleting(true);
    try {
      const allNoteIds = notes.map(n => n.id);
      await deleteNotesByIds(allNoteIds);
      displayFeedback('success', 'All stuff has been deleted.');
    } catch (error) {
      handleError(
        error,
        displayFeedback,
        'Failed to delete all stuff.',
        'useDeleteOperations:handleConfirmDeleteAll'
      );
    } finally {
      setIsDeleting(false);
      closeDeleteAllModal();
    }
  }, [
    accessToken,
    isDeleting,
    notes,
    deleteNotesByIds,
    displayFeedback,
    setIsDeleting,
    closeDeleteAllModal,
  ]);

  const handleConfirmDeleteSelected = useCallback(async () => {
    if (!accessToken || isDeleting || notesToDelete.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteNotesByIds(notesToDelete);
      displayFeedback('success', `${notesToDelete.length} stuff deleted.`);
    } catch (error) {
      handleError(
        error,
        displayFeedback,
        'Failed to delete selected stuff.',
        'useDeleteOperations:handleConfirmDeleteSelected'
      );
    } finally {
      setIsDeleting(false);
      closeDeleteSelectedModal();
    }
  }, [
    accessToken,
    isDeleting,
    notesToDelete,
    deleteNotesByIds,
    displayFeedback,
    setIsDeleting,
    closeDeleteSelectedModal,
  ]);

  return {
    handleConfirmDelete,
    handleConfirmDeleteAll,
    handleConfirmDeleteSelected,
  };
};
