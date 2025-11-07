import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import EditNoteModal from './EditNoteModal';
import InstructionsModal from './InstructionsModal';
import HelpModal from './HelpModal';
import ReauthModal from './ReauthModal';
import {
  useModalStateContext,
  useModalActions,
} from '../contexts/ModalContext';
import { useUIStateContext, useUIActions } from '../contexts/UIContext';
import { Note } from '../types';
import { normalizeError } from '../utils/errorHandler';
import { logError } from '../utils/logger';

interface ModalContainerProps {
  handleConfirmDelete: () => void;
  handleConfirmClearDraft: () => void;
  handleUpdateAndRecategorizeNote: (
    note: Note,
    newContent: string
  ) => Promise<void>;
  handleReconnect: () => Promise<void>;
  logout: () => Promise<void>;
  confirmLogout: () => Promise<void>;
  cancelLogout: () => void;
  handleConfirmDeleteAll: () => void;
  handleConfirmDeleteSelected: () => void;
  isDeleting: boolean;
  setShowNoteEditedToast: (show: boolean) => void;
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  handleConfirmDelete,
  handleConfirmClearDraft,
  handleUpdateAndRecategorizeNote,
  handleReconnect,
  logout,
  confirmLogout,
  cancelLogout,
  handleConfirmDeleteAll,
  handleConfirmDeleteSelected,
  isDeleting,
  setShowNoteEditedToast,
  displayFeedback,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const {
    noteToDelete,
    notesToDelete,
    editingNote,
    isClearDraftModalOpen,
    showReauthModal,
    isDeleteAllModalOpen,
    isDeleteSelectedModalOpen,
    showInstructions,
    showHelp,
    showRegenerateConfirmation,
    confirmLogoutOpen,
  } = useModalStateContext();
  const {
    setNoteToDelete,
    closeEditModal,
    closeClearDraftModal,
    setShowInstructions,
    setShowHelp,
    closeReauthModal,
    closeDeleteAllModal,
    closeDeleteSelectedModal,
  } = useModalActions();
  const { customInstructions, lastCustomInstructions } = useUIStateContext();
  const { saveInstructions } = useUIActions();

  return (
    <>
      {noteToDelete && (
        <ConfirmationModal
          isOpen={!!noteToDelete}
          onCancel={() => setNoteToDelete(null)}
          onConfirm={handleConfirmDelete}
          title='Delete Stuff'
          message='Are you sure you want to delete this stuff? This action cannot be undone.'
          confirmLabel='Delete'
          confirmTone='destructive'
          isDeleting={isDeleting}
        />
      )}
      {isClearDraftModalOpen && (
        <ConfirmationModal
          isOpen={isClearDraftModalOpen}
          onCancel={closeClearDraftModal}
          onConfirm={handleConfirmClearDraft}
          title='Clear Draft'
          message='Are you sure you want to clear the draft? The content will be permanently lost.'
          confirmLabel='Clear'
          confirmTone='destructive'
        />
      )}
      {editingNote && (
        <EditNoteModal
          ref={modalRef}
          isOpen={!!editingNote}
          onClose={closeEditModal}
          initialNote={editingNote.content}
          note={editingNote}
          onSave={async (newContent: string) => {
            try {
              await handleUpdateAndRecategorizeNote(editingNote, newContent);
              setShowNoteEditedToast(true);
            } catch (error) {
              const normalizedError = normalizeError(error);
              let errorMessage = 'Failed to save edit. ';

              // Provide more specific error messages based on error type
              if (normalizedError.message.includes('Google Drive API')) {
                errorMessage += normalizedError.message;
              } else if (normalizedError.message.includes('Network error')) {
                errorMessage +=
                  'Network connection issue. Please check your internet connection and try again.';
              } else if (normalizedError.message.includes('rate limit')) {
                errorMessage +=
                  'Too many requests. Please wait a moment and try again.';
              } else if (
                normalizedError.message.includes('access token') ||
                normalizedError.message.includes('invalid') ||
                normalizedError.message.includes('expired')
              ) {
                errorMessage +=
                  'Authentication expired. Please try logging in again.';
              } else {
                errorMessage += normalizedError.message || 'Please try again.';
              }

              displayFeedback('error', errorMessage);
              logError('Failed to update note:', error);
            }
          }}
        />
      )}
      {showInstructions && (
        <InstructionsModal
          isVisible={showInstructions}
          onClose={() => setShowInstructions(false)}
          onSave={saveInstructions}
          initialInstructions={customInstructions}
          lastCustomInstructions={lastCustomInstructions}
        />
      )}
      {showHelp && (
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          onOpenInstructions={() => setShowInstructions(true)}
        />
      )}
      {showRegenerateConfirmation && (
        <ConfirmationModal
          isOpen={showRegenerateConfirmation}
          onCancel={() => {}}
          onConfirm={() => {}}
          title='Confirm Regeneration'
          message='AI regeneration is experimental. Results may not be perfect. Proceed?'
          confirmLabel='Regenerate'
        />
      )}
      {showReauthModal && (
        <ReauthModal
          isOpen={showReauthModal}
          onClose={closeReauthModal}
          onReconnect={handleReconnect}
          onLogout={logout}
        />
      )}
      {confirmLogoutOpen && (
        <ConfirmationModal
          isOpen={confirmLogoutOpen}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
          title='Confirm Logout'
          message='Are you sure you want to log out?'
          confirmLabel='Logout'
          confirmTone='destructive'
        />
      )}
      {isDeleteAllModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteAllModalOpen}
          onCancel={closeDeleteAllModal}
          onConfirm={handleConfirmDeleteAll}
          title='Delete All Stuff'
          message='Are you sure you want to delete all your stuff? This action cannot be undone.'
          confirmLabel='Delete All'
          confirmTone='destructive'
          isDeleting={isDeleting}
        />
      )}
      {isDeleteSelectedModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteSelectedModalOpen}
          onCancel={closeDeleteSelectedModal}
          onConfirm={handleConfirmDeleteSelected}
          title={`Delete ${notesToDelete.length} Stuff`}
          message={`Are you sure you want to delete ${notesToDelete.length} stuff? This action cannot be undone.`}
          confirmLabel='Delete Selected'
          confirmTone='destructive'
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default ModalContainer;
