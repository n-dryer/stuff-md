import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from 'react';

import { AuthError } from './services/googleDriveService';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { useDebounce } from './hooks/useDebounce';
import { useToasts } from './hooks/useToasts';
import { useNoteHandlers } from './hooks/useNoteHandlers';
import { useCategories } from './hooks/useCategories';
import { useDraftManagement } from './hooks/useDraftManagement';
import { useLogoutConfirmation } from './hooks/useLogoutConfirmation';
import { useDeleteOperations } from './hooks/useDeleteOperations';
import AppShell from './components/app/AppShell';
import AuthGate from './components/app/AuthGate';
import MainLayout from './components/MainLayout';
import ToastContainer from './components/ToastContainer';
import ModalContainer from './components/ModalContainer';
import { Note } from './types';
import { containsURL } from './utils/textUtils';
import {
  handleError,
  normalizeError,
  sanitizeErrorMessage,
} from './utils/errorHandler';
import { useModalActions, useModalStateContext } from './contexts/ModalContext';
import { useUIStateContext, useUIActions } from './contexts/UIContext';

const App: React.FC = () => {
  const { accessToken, login, logout } = useAuth();
  const {
    notes,
    isLoading: isNotesLoading,
    error: notesError,
    saveNote,
    deleteNote,
    deleteNotesByIds,
    regenerateNote,
  } = useNotes(accessToken);
  const { feedback, activeTags, customInstructions, viewMode } =
    useUIStateContext();
  const {
    displayFeedback,
    handleTagClick,
    handleClearTags,
    setViewMode,
    clearFeedback,
  } = useUIActions();

  const { noteToDelete, notesToDelete, showHelp } = useModalStateContext();
  const {
    requestDeleteNote,
    requestDeleteNotes,
    openEditModal,
    closeEditModal,
    openClearDraftModal,
    closeClearDraftModal,
    openReauthModal,
    closeReauthModal,
    openDeleteAllModal,
    setShowInstructions,
    setShowHelp,
    setConfirmLogoutOpen,
  } = useModalActions();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const instructionsButtonRef = useRef<HTMLButtonElement>(null);

  const { showNoteSavedToast, setShowNoteSavedToast, handleDraftSavedToast } =
    useToasts();

  const { dynamicCategories } = useCategories(notes);

  const {
    draft,
    setDraft,
    noteInputRef,
    handleRequestClearOrBlur,
    handleConfirmClearDraft,
  } = useDraftManagement({
    openClearDraftModal,
    closeClearDraftModal,
    displayFeedback,
  });

  const { requestLogout, cancelLogout, confirmLogout } = useLogoutConfirmation({
    logout,
    displayFeedback,
    setConfirmLogoutOpen,
  });

  const {
    handleSaveNote: handleSaveNoteBase,
    handleUpdateAndRecategorizeNote: handleUpdateAndRecategorizeNoteBase,
  } = useNoteHandlers({
    accessToken,
    draft,
    saveNote,
    regenerateNote,
    customInstructions,
    displayFeedback,
    noteInputRef,
  });

  useEffect(() => {
    if (notesError) {
      handleError(
        notesError,
        displayFeedback,
        'A Google Drive operation failed. Please try again.',
        'App:notesError'
      );
      if (notesError instanceof AuthError) {
        openReauthModal();
      }
    }
  }, [notesError, openReauthModal, displayFeedback]);

  const handleSaveNote = useCallback(async () => {
    if (!draft.trim() || !accessToken || isSaving) return;
    setIsSaving(true);
    try {
      await handleSaveNoteBase();
      setDraft('');
      setShowNoteSavedToast(true);
    } catch (error) {
      const normalizedError = normalizeError(error);
      const errorMessage = sanitizeErrorMessage(normalizedError);
      displayFeedback(
        'error',
        errorMessage || 'Failed to save note. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    draft,
    accessToken,
    isSaving,
    handleSaveNoteBase,
    setDraft,
    setShowNoteSavedToast,
    displayFeedback,
  ]);

  const {
    handleConfirmDelete,
    handleConfirmDeleteAll,
    handleConfirmDeleteSelected,
  } = useDeleteOperations({
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
  });

  const handleReconnect = async () => {
    await login();
    closeReauthModal();
  };

  const hasLinks = useMemo(
    () => notes.some(note => containsURL(note.content)),
    [notes]
  );

  const handleRequestDeleteNote = useCallback(
    (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        requestDeleteNote(note);
      }
    },
    [notes, requestDeleteNote]
  );

  const handleSetEditingNote = useCallback(
    (note: Note | null) => {
      if (note) {
        openEditModal(note);
      }
    },
    [openEditModal]
  );

  return (
    <AppShell>
      <AuthGate>
        <MainLayout
          notes={notes}
          isNotesLoading={isNotesLoading}
          dynamicCategories={dynamicCategories}
          hasLinks={hasLinks}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          draft={draft}
          setDraft={setDraft}
          handleSaveNote={handleSaveNote}
          isSaving={isSaving}
          noteInputRef={noteInputRef}
          onRequestClearOrBlur={handleRequestClearOrBlur}
          onDraftSaved={handleDraftSavedToast}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeTags={activeTags}
          handleTagClick={handleTagClick}
          handleClearTags={handleClearTags}
          requestDeleteNote={handleRequestDeleteNote}
          onDeleteNotes={requestDeleteNotes}
          setEditingNote={handleSetEditingNote}
          isDeleting={isDeleting}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          debouncedSearchQuery={debouncedSearchQuery}
          logout={requestLogout}
          onDeleteAll={openDeleteAllModal}
          customInstructions={customInstructions}
          setShowInstructions={setShowInstructions}
          instructionsButtonRef={instructionsButtonRef}
          isHelpOpen={showHelp}
          setShowHelp={setShowHelp}
        />
        <ModalContainer
          handleConfirmDelete={handleConfirmDelete}
          handleConfirmClearDraft={handleConfirmClearDraft}
          handleUpdateAndRecategorizeNote={handleUpdateAndRecategorizeNoteBase}
          handleReconnect={handleReconnect}
          logout={logout}
          confirmLogout={confirmLogout}
          cancelLogout={cancelLogout}
          handleConfirmDeleteAll={handleConfirmDeleteAll}
          handleConfirmDeleteSelected={handleConfirmDeleteSelected}
          isDeleting={isDeleting}
        />
        <ToastContainer
          showNoteSavedToast={showNoteSavedToast}
          setShowNoteSavedToast={setShowNoteSavedToast}
          feedback={
            feedback
              ? {
                  id: `feedback-${Date.now()}`,
                  message: feedback.message,
                  type: feedback.type,
                }
              : null
          }
          clearFeedback={clearFeedback}
        />
      </AuthGate>
    </AppShell>
  );
};

export default App;
