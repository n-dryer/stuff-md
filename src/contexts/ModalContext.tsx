import React, { createContext, useContext, useState, useCallback } from 'react';
import { Note } from '../types';

interface ModalState {
  noteToDelete: Note | null;
  notesToDelete: string[];
  editingNote: Note | null;
  isClearDraftModalOpen: boolean;
  showReauthModal: boolean;
  isDeleteAllModalOpen: boolean;
  isDeleteSelectedModalOpen: boolean;
  showInstructions: boolean;
  showHelp: boolean;
  showRegenerateConfirmation: boolean;
  confirmLogoutOpen: boolean;
}

interface ModalActions {
  setNoteToDelete: (note: Note | null) => void;
  requestDeleteNote: (note: Note) => void;
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
  setShowInstructions: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowRegenerateConfirmation: (show: boolean) => void;
  setConfirmLogoutOpen: (open: boolean) => void;
}

const ModalStateContext = createContext<ModalState | undefined>(undefined);
const ModalActionsContext = createContext<ModalActions | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<ModalState>({
    noteToDelete: null,
    notesToDelete: [],
    editingNote: null,
    isClearDraftModalOpen: false,
    showReauthModal: false,
    isDeleteAllModalOpen: false,
isDeleteSelectedModalOpen: false,
    showInstructions: false,
    showHelp: false,
    showRegenerateConfirmation: false,
    confirmLogoutOpen: false,
  });

  const setNoteToDelete = useCallback(
    (note: Note | null) =>
      setModalState(prev => ({ ...prev, noteToDelete: note })),
    []
  );

  const requestDeleteNote = useCallback((note: Note) => {
    setModalState(prev => ({ ...prev, noteToDelete: note }));
  }, []);

  const requestDeleteNotes = useCallback((noteIds: string[]) => {
    setModalState(prev => ({
      ...prev,
      notesToDelete: noteIds,
      isDeleteSelectedModalOpen: true,
    }));
  }, []);

  const openEditModal = useCallback(
    (note: Note) => setModalState(prev => ({ ...prev, editingNote: note })),
    []
  );
  const closeEditModal = useCallback(
    () => setModalState(prev => ({ ...prev, editingNote: null })),
    []
  );
  const openClearDraftModal = useCallback(
    () => setModalState(prev => ({ ...prev, isClearDraftModalOpen: true })),
    []
  );
  const closeClearDraftModal = useCallback(
    () => setModalState(prev => ({ ...prev, isClearDraftModalOpen: false })),
    []
  );
  const openReauthModal = useCallback(
    () => setModalState(prev => ({ ...prev, showReauthModal: true })),
    []
  );
  const closeReauthModal = useCallback(
    () => setModalState(prev => ({ ...prev, showReauthModal: false })),
    []
  );
  const openDeleteAllModal = useCallback(
    () => setModalState(prev => ({ ...prev, isDeleteAllModalOpen: true })),
    []
  );
  const closeDeleteAllModal = useCallback(
    () => setModalState(prev => ({ ...prev, isDeleteAllModalOpen: false })),
    []
  );

  const openDeleteSelectedModal = useCallback(
    () =>
      setModalState(prev => ({ ...prev, isDeleteSelectedModalOpen: true })),
    []
  );

  const closeDeleteSelectedModal = useCallback(
    () =>
      setModalState(prev => ({
        ...prev,
        isDeleteSelectedModalOpen: false,
        notesToDelete: [],
      })),
    []
  );

  const setShowInstructions = useCallback(
    (show: boolean) => setModalState(prev => ({ ...prev, showInstructions: show })),
    []
  );

  const setShowHelp = useCallback(
    (show: boolean) => setModalState(prev => ({ ...prev, showHelp: show })),
    []
  );

  const setShowRegenerateConfirmation = useCallback(
    (show: boolean) =>
      setModalState(prev => ({ ...prev, showRegenerateConfirmation: show })),
    []
  );

  const setConfirmLogoutOpen = useCallback(
    (open: boolean) =>
      setModalState(prev => ({ ...prev, confirmLogoutOpen: open })),
    []
  );

  const actions = {
    setNoteToDelete,
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
    setShowInstructions,
    setShowHelp,
    setShowRegenerateConfirmation,
    setConfirmLogoutOpen,
  };

  return (
    <ModalStateContext.Provider value={modalState}>
      <ModalActionsContext.Provider value={actions}>
        {children}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
};

export const useModalStateContext = () => {
  const context = useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error('useModalStateContext must be used within a ModalProvider');
  }
  return context;
};

export const useModalActions = () => {
  const context = useContext(ModalActionsContext);
  if (context === undefined) {
    throw new Error('useModalActions must be used within a ModalProvider');
  }
  return context;
};
