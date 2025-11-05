import { useState, useCallback } from 'react';
import { Note } from '../types';

interface UseModalStateReturn {
  noteToDelete: string | null;
  notesToDelete: string[] | null;
  editingNote: Note | null;
  isClearDraftModalOpen: boolean;
  showReauthModal: boolean;
  isDeleteAllModalOpen: boolean;
  isDeleteSelectedModalOpen: boolean;
  setNoteToDelete: (noteId: string | null) => void;
  setNotesToDelete: (noteIds: string[] | null) => void;
  setEditingNote: (note: Note | null) => void;
  setIsClearDraftModalOpen: (isOpen: boolean) => void;
  setShowReauthModal: (isOpen: boolean) => void;
  setIsDeleteAllModalOpen: (isOpen: boolean) => void;
  setIsDeleteSelectedModalOpen: (isOpen: boolean) => void;
  requestDeleteNote: (noteId: string) => void;
  requestDeleteNotes: (noteIds: string[]) => void;
  openEditModal: (note: Note) => void;
  closeEditModal: () => void;
  openClearDraftModal: () => void;
  closeClearDraftModal: () => void;
  openReauthModal: () => void;
  closeReauthModal: () => void;
  openDeleteAllModal: () => void;
  closeDeleteAllModal: () => void;
  openDeleteSelectedModal: () => void;
  closeDeleteSelectedModal: () => void;
}

export const useModalState = (): UseModalStateReturn => {
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [notesToDelete, setNotesToDelete] = useState<string[] | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isClearDraftModalOpen, setIsClearDraftModalOpen] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);

  const requestDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId);
  }, []);

  const requestDeleteNotes = useCallback((noteIds: string[]) => {
    setNotesToDelete(noteIds);
    setIsDeleteSelectedModalOpen(true);
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

  const openDeleteAllModal = useCallback(() => {
    setIsDeleteAllModalOpen(true);
  }, []);

  const closeDeleteAllModal = useCallback(() => {
    setIsDeleteAllModalOpen(false);
  }, []);

  const openDeleteSelectedModal = useCallback(() => {
    setIsDeleteSelectedModalOpen(true);
  }, []);

  const closeDeleteSelectedModal = useCallback(() => {
    setIsDeleteSelectedModalOpen(false);
    setNotesToDelete(null);
  }, []);

  return {
    noteToDelete,
    notesToDelete,
    editingNote,
    isClearDraftModalOpen,
    showReauthModal,
    isDeleteAllModalOpen,
    isDeleteSelectedModalOpen,
    setNoteToDelete,
    setNotesToDelete,
    setEditingNote,
    setIsClearDraftModalOpen,
    setShowReauthModal,
    setIsDeleteAllModalOpen,
    setIsDeleteSelectedModalOpen,
    requestDeleteNote,
    requestDeleteNotes,
    openEditModal,
    closeEditModal,
    openClearDraftModal,
    closeClearDraftModal,
    openReauthModal,
    closeReauthModal,
    openDeleteAllModal,
    closeDeleteAllModal,
    openDeleteSelectedModal,
    closeDeleteSelectedModal,
  };
};
