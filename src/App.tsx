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
import { logError } from './utils/logger';
import { useModalActions, useModalStateContext } from './contexts/ModalContext';
import { useUIStateContext, useUIActions } from './contexts/UIContext';

const App: React.FC = () => {
  const { accessToken, login, logout, user, refreshAccessToken } = useAuth();
  const isLoggedIn = !!user;

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

  const {
    showNoteSavedToast,
    setShowNoteSavedToast,
    showNoteEditedToast,
    setShowNoteEditedToast,
    handleDraftSavedToast,
  } = useToasts();

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
    onLogoutSuccess: () => {
      // Clear draft when user logs out
      setDraft('');
    },
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
  }, [notesError, isLoggedIn, openReauthModal, displayFeedback]);

  const handleSaveNote = useCallback(async () => {
    if (!draft.trim() || isSaving) {
      if (!draft.trim()) {
        displayFeedback(
          'error',
          'Cannot save empty note. Please enter some content.'
        );
      }
      return;
    }

    if (!accessToken) {
      if (user) {
        try {
          await refreshAccessToken();
        } catch (error) {
          displayFeedback('error', 'Session expired. Please log in again.');
          openReauthModal();
          return;
        }
      } else {
        displayFeedback('error', 'Not authenticated. Please log in again.');
        openReauthModal();
        return;
      }
    }

    setIsSaving(true);
    try {
      await handleSaveNoteBase();
      // Only clear draft and show toast after successful save
      setDraft('');
      setShowNoteSavedToast(true);
    } catch (error) {
      const normalizedError = normalizeError(error);
      const errorMessage = sanitizeErrorMessage(normalizedError);
      displayFeedback(
        'error',
        errorMessage || 'Failed to save stuff. Please try again.'
      );
      // Don't clear draft on error - user can retry
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
    openReauthModal,
    user,
    refreshAccessToken,
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
          setShowNoteEditedToast={setShowNoteEditedToast}
          displayFeedback={displayFeedback}
        />
        <ToastContainer
          showNoteSavedToast={showNoteSavedToast}
          setShowNoteSavedToast={setShowNoteSavedToast}
          showNoteEditedToast={showNoteEditedToast}
          setShowNoteEditedToast={setShowNoteEditedToast}
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
