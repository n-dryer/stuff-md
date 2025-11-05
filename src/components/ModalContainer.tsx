import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ModalErrorFallback from './ModalErrorFallback';
import ModalLoadingFallback from './ModalLoadingFallback';
import { Note } from '../types';
import { SYSTEM_INSTRUCTION } from '../services/aiService';

const ConfirmationModal = lazy(() => import('./ConfirmationModal'));
const EditNoteModal = lazy(() => import('./EditNoteModal'));
const InstructionsModal = lazy(() => import('./InstructionsModal'));
const ReauthModal = lazy(() => import('./ReauthModal'));
const HelpModal = lazy(() => import('./HelpModal'));

interface ModalContainerProps {
  noteToDelete: string | null;
  setNoteToDelete: (noteId: string | null) => void;
  handleConfirmDelete: () => Promise<void>;
  isClearDraftModalOpen: boolean;
  handleConfirmClearDraft: () => void;
  closeClearDraftModal: () => void;
  editingNote: Note | null;
  closeEditModal: () => void;
  handleUpdateAndRecategorizeNote: (
    note: Note,
    newContent: string
  ) => Promise<void>;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
  saveInstructions: (instructions: string) => void;
  customInstructions: string;
  lastCustomInstructions?: string;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showRegenerateConfirmation: boolean;
  confirmRegenerate: () => void;
  cancelRegenerate: () => void;
  showReauthModal: boolean;
  handleReconnect: () => Promise<void>;
  logout: () => Promise<void>;
  closeReauthModal: () => void;
  confirmLogoutOpen: boolean;
  confirmLogout: () => Promise<void>;
  cancelLogout: () => void;
  isDeleteAllModalOpen: boolean;
  handleConfirmDeleteAll: () => Promise<void>;
  closeDeleteAllModal: () => void;
  isDeleteSelectedModalOpen: boolean;
  notesToDelete: string[] | null;
  handleConfirmDeleteSelected: () => Promise<void>;
  closeDeleteSelectedModal: () => void;
  isDeleting?: boolean;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  noteToDelete,
  setNoteToDelete,
  handleConfirmDelete,
  isClearDraftModalOpen,
  handleConfirmClearDraft,
  closeClearDraftModal,
  editingNote,
  closeEditModal,
  handleUpdateAndRecategorizeNote,
  showInstructions,
  setShowInstructions,
  saveInstructions,
  customInstructions,
  lastCustomInstructions,
  showHelp,
  setShowHelp,
  showRegenerateConfirmation,
  confirmRegenerate,
  cancelRegenerate,
  showReauthModal,
  handleReconnect,
  logout,
  closeReauthModal,
  confirmLogoutOpen,
  confirmLogout,
  cancelLogout,
  isDeleteAllModalOpen,
  handleConfirmDeleteAll,
  closeDeleteAllModal,
  isDeleteSelectedModalOpen,
  notesToDelete,
  handleConfirmDeleteSelected,
  closeDeleteSelectedModal,
  isDeleting = false,
}) => {
  return (
    <>
      <Suspense fallback={<ModalLoadingFallback />}>
        <ErrorBoundary fallback={<ModalErrorFallback />}>
          <ConfirmationModal
            isOpen={!!noteToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => setNoteToDelete(null)}
            title='CONFIRM DELETION'
            message='Are you sure you want to delete this note? This action cannot be undone.'
            isDeleting={isDeleting}
          />
          <ConfirmationModal
            isOpen={isClearDraftModalOpen}
            onConfirm={handleConfirmClearDraft}
            onCancel={closeClearDraftModal}
            title='CLEAR DRAFT'
            message='Are you sure you want to discard your current draft?'
            confirmLabel='CLEAR'
            confirmTone='default'
          />
          <EditNoteModal
            isOpen={!!editingNote}
            note={editingNote}
            onClose={closeEditModal}
            onSave={handleUpdateAndRecategorizeNote}
            onRequestDelete={setNoteToDelete}
            isDeleting={isDeleting}
          />
          <InstructionsModal
            isVisible={showInstructions}
            onClose={() => setShowInstructions(false)}
            onSave={saveInstructions}
            initialInstructions={customInstructions}
            initialMode={
              !customInstructions || customInstructions === SYSTEM_INSTRUCTION
                ? 'default'
                : 'custom'
            }
            lastCustomInstructions={lastCustomInstructions}
          />
          <ReauthModal
            isOpen={showReauthModal}
            onReconnect={handleReconnect}
            onLogout={logout}
            onClose={closeReauthModal}
          />
          <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            onOpenInstructions={() => setShowInstructions(true)}
          />
          <ConfirmationModal
            isOpen={showRegenerateConfirmation}
            onConfirm={confirmRegenerate}
            onCancel={cancelRegenerate}
            title='INSTRUCTIONS CHANGED'
            message='Your AI instructions have been updated. New notes will use these instructions. Existing notes will not be automatically regenerated to prevent excessive API usage. You can manually regenerate individual notes if needed.'
            confirmLabel='SAVE INSTRUCTIONS'
            confirmTone='default'
          />
        </ErrorBoundary>
      </Suspense>
      <ConfirmationModal
        isOpen={confirmLogoutOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        title='LOGOUT'
        message='Are you sure you want to log out?'
        confirmLabel='LOGOUT'
        confirmTone='default'
      />
      <ConfirmationModal
        isOpen={isDeleteAllModalOpen}
        onConfirm={handleConfirmDeleteAll}
        onCancel={closeDeleteAllModal}
        title='CONFIRM DELETION'
        message='Are you sure you want to delete all notes? This action cannot be undone.'
        confirmLabel='DELETE ALL'
        confirmTone='destructive'
        isDeleting={isDeleting}
      />
      <ConfirmationModal
        isOpen={isDeleteSelectedModalOpen}
        onConfirm={handleConfirmDeleteSelected}
        onCancel={closeDeleteSelectedModal}
        title='CONFIRM DELETION'
        message={`Are you sure you want to delete ${notesToDelete?.length || 0} selected note${(notesToDelete?.length || 0) > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel='DELETE SELECTED'
        confirmTone='destructive'
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ModalContainer;
