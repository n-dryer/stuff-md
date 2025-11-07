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
}) => {
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
          title='Delete Item'
          message='Are you sure you want to delete this item? This action cannot be undone.'
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
          isOpen={!!editingNote}
          onClose={closeEditModal}
          note={editingNote}
          onSave={handleUpdateAndRecategorizeNote}
          onRequestDelete={(noteId: string) => {
            const note = editingNote;
            if (note && note.id === noteId) {
              setNoteToDelete(note);
            }
          }}
          isDeleting={isDeleting}
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
          title='Delete All Items'
          message='Are you sure you want to delete all your items? This action cannot be undone.'
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
          title={`Delete ${notesToDelete.length} Items`}
          message={`Are you sure you want to delete ${notesToDelete.length} items? This action cannot be undone.`}
          confirmLabel='Delete Selected'
          confirmTone='destructive'
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default ModalContainer;
