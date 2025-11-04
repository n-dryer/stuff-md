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

interface ModalContainerProps {
  noteToDelete: string | null;
  setNoteToDelete: (noteId: string | null) => void;
  handleConfirmDelete: () => Promise<void>;
  isClearDraftModalOpen: boolean;
  handleConfirmClearDraft: () => void;
  closeClearDraftModal: () => void;
  editingNote: Note | null;
  closeEditModal: () => void;
  handleUpdateAndRecategorizeNote: (note: Note, newContent: string) => Promise<void>;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
  saveInstructions: (instructions: string) => void;
  customInstructions: string;
  lastCustomInstructions?: string;
  showReauthModal: boolean;
  handleReconnect: () => Promise<void>;
  logout: () => Promise<void>;
  confirmLogoutOpen: boolean;
  confirmLogout: () => Promise<void>;
  cancelLogout: () => void;
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
  showReauthModal,
  handleReconnect,
  logout,
  confirmLogoutOpen,
  confirmLogout,
  cancelLogout,
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
    </>
  );
};

export default ModalContainer;

