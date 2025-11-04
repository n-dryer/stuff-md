import { useState, useCallback } from 'react';
import { Note } from '../types';

interface UseModalStateReturn {
  noteToDelete: string | null;
  editingNote: Note | null;
  isClearDraftModalOpen: boolean;
  showReauthModal: boolean;
  setNoteToDelete: (noteId: string | null) => void;
  setEditingNote: (note: Note | null) => void;
  setIsClearDraftModalOpen: (isOpen: boolean) => void;
  setShowReauthModal: (isOpen: boolean) => void;
  requestDeleteNote: (noteId: string) => void;
  openEditModal: (note: Note) => void;
  closeEditModal: () => void;
  openClearDraftModal: () => void;
  closeClearDraftModal: () => void;
  openReauthModal: () => void;
  closeReauthModal: () => void;
}

export const useModalState = (): UseModalStateReturn => {
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isClearDraftModalOpen, setIsClearDraftModalOpen] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  const requestDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId);
  }, []);

  const openEditModal = useCallback((note: Note) => {
    setEditingNote(note);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingNote(null);
  }, []);

  const openClearDraftModal = useCallback(() => {
    setIsClearDraftModalOpen(true);
  }, []);

  const closeClearDraftModal = useCallback(() => {
    setIsClearDraftModalOpen(false);
  }, []);

  const openReauthModal = useCallback(() => {
    setShowReauthModal(true);
  }, []);

  const closeReauthModal = useCallback(() => {
    setShowReauthModal(false);
  }, []);

  return {
    noteToDelete,
    editingNote,
    isClearDraftModalOpen,
    showReauthModal,
    setNoteToDelete,
    setEditingNote,
    setIsClearDraftModalOpen,
    setShowReauthModal,
    requestDeleteNote,
    openEditModal,
    closeEditModal,
    openClearDraftModal,
    closeClearDraftModal,
    openReauthModal,
    closeReauthModal,
  };
};

