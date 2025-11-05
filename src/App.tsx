import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  Suspense,
  lazy,
} from 'react';

import { AuthError } from './services/googleDriveService';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUIState } from './hooks/useUIState';
import { useDebounce } from './hooks/useDebounce';
import { useModalState } from './hooks/useModalState';
import { useToasts } from './hooks/useToasts';
import { useNoteHandlers } from './hooks/useNoteHandlers';
import { useCategories } from './hooks/useCategories';
import { useDraftManagement } from './hooks/useDraftManagement';
import { useLogoutConfirmation } from './hooks/useLogoutConfirmation';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/MainLayout';
import ModalErrorFallback from './components/ModalErrorFallback';
import ToastContainer from './components/ToastContainer';
import ModalContainer from './components/ModalContainer';
import BrutalistSpinner from './components/BrutalistSpinner';
import { Note } from './types';
import { containsURL } from './utils/textUtils';
import { logError } from './utils/logger';

// Lazy load login screen for code splitting
const LoginScreen = lazy(() => import('./components/LoginScreen'));

const App: React.FC = () => {
  const {
    user,
    accessToken,
    isLoading: isAuthLoading,
    error: authError,
    login,
    logout,
  } = useAuth();
  const {
    notes,
    isLoading: isNotesLoading,
    error: notesError,
    saveNote,
    deleteNote,
    deleteNotesByIds,
    regenerateNote,
  } = useNotes(accessToken);
  const {
    feedback,
    displayFeedback,
    clearFeedback,
    activeTags,
    handleTagClick,
    handleClearTags,
    customInstructions,
    lastCustomInstructions,
    saveInstructions,
    showInstructions,
    setShowInstructions,
    showHelp,
    setShowHelp,
    showRegenerateConfirmation,
    confirmRegenerate,
    cancelRegenerate,
  } = useUIState();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>(
    'stuffmd.viewMode.v2',
    'grid'
  );
  const instructionsButtonRef = useRef<HTMLButtonElement>(null);

  const { showNoteSavedToast, setShowNoteSavedToast, handleDraftSavedToast } =
    useToasts();

  const { dynamicCategories } = useCategories(notes);

  const {
    noteToDelete,
    notesToDelete,
    editingNote,
    isClearDraftModalOpen,
    showReauthModal,
    isDeleteAllModalOpen,
    isDeleteSelectedModalOpen,
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
    closeDeleteSelectedModal,
  } = useModalState();

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

  const { confirmLogoutOpen, requestLogout, cancelLogout, confirmLogout } =
    useLogoutConfirmation({
      logout,
      displayFeedback,
    });

  const {
    handleSaveNote: handleSaveNoteBase,
    handleConfirmDelete: handleConfirmDeleteBase,
    handleUpdateAndRecategorizeNote: handleUpdateAndRecategorizeNoteBase,
  } = useNoteHandlers({
    accessToken,
    draft,
    saveNote,
    deleteNote,
    regenerateNote,
    customInstructions,
    displayFeedback,
    noteInputRef,
    setDraft,
    setNoteToDelete,
    setShowNoteSavedToast,
  });

  useEffect(() => {
    if (notesError instanceof AuthError) {
      openReauthModal();
    } else if (notesError) {
      logError('A Google Drive operation failed:', notesError);
    }
  }, [notesError, openReauthModal]);

  const handleSaveNote = useCallback(async () => {
    if (!draft.trim() || !accessToken || isSaving) return;
    setIsSaving(true);
    try {
      await handleSaveNoteBase();
    } finally {
      setIsSaving(false);
    }
  }, [draft, accessToken, isSaving, handleSaveNoteBase]);

  const handleConfirmDelete = useCallback(async () => {
    if (!noteToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await handleConfirmDeleteBase(noteToDelete);
      closeEditModal(); // Close edit modal after successful deletion
    } finally {
      setIsDeleting(false);
    }
  }, [noteToDelete, isDeleting, handleConfirmDeleteBase, closeEditModal]);

  const handleConfirmDeleteAll = useCallback(async () => {
    if (!accessToken || notes.length === 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      const noteIds = notes.map(note => note.id);
      await deleteNotesByIds(noteIds);
      displayFeedback('All notes deleted.', 'success');
      closeDeleteAllModal();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        displayFeedback(error.message, 'error');
      } else {
        logError('Failed to delete all notes:', error);
        displayFeedback('Failed to delete all notes.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [
    accessToken,
    notes,
    deleteNotesByIds,
    displayFeedback,
    closeDeleteAllModal,
    isDeleting,
  ]);

  const handleConfirmDeleteSelected = useCallback(async () => {
    if (!notesToDelete || notesToDelete.length === 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteNotesByIds(notesToDelete);
      displayFeedback(
        `${notesToDelete.length} note${notesToDelete.length > 1 ? 's' : ''} deleted.`,
        'success'
      );
      closeDeleteSelectedModal();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        displayFeedback(error.message, 'error');
      } else {
        logError('Failed to delete notes:', error);
        displayFeedback('Failed to delete notes.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [
    notesToDelete,
    isDeleting,
    deleteNotesByIds,
    displayFeedback,
    closeDeleteSelectedModal,
  ]);

  const handleDeleteNotes = useCallback(
    (noteIds: string[]) => {
      requestDeleteNotes(noteIds);
    },
    [requestDeleteNotes]
  );

  const handleUpdateAndRecategorizeNote = useCallback(
    async (note: Note, newContent: string) => {
      await handleUpdateAndRecategorizeNoteBase(note, newContent);
    },
    [handleUpdateAndRecategorizeNoteBase]
  );

  const handleReconnect = async () => {
    await login();
    closeReauthModal();
  };

  const hasLinks = useMemo(
    () => notes.some(note => containsURL(note.content)),
    [notes]
  );

  if (isAuthLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center font-mono gap-[clamp(1rem,2.5vw,1.5rem)] bg-transparent'>
        <BrutalistSpinner />
        <p
          className='text-[clamp(0.875rem,2vw,1rem)] uppercase tracking-wider text-accent-black dark:text-off-white'
          aria-live='polite'
        >
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense
        fallback={
          <div className='min-h-screen flex flex-col items-center justify-center font-mono gap-[clamp(1rem,2.5vw,1.5rem)] bg-transparent'>
            <BrutalistSpinner />
            <p
              className='text-[clamp(0.875rem,2vw,1rem)] uppercase tracking-wider text-accent-black dark:text-off-white'
              aria-live='polite'
            >
              Loading login screen...
            </p>
          </div>
        }
      >
        <ErrorBoundary fallback={<ModalErrorFallback />}>
          <LoginScreen onLogin={login} error={authError} />
        </ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <>
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
        requestDeleteNote={requestDeleteNote}
        onDeleteNotes={handleDeleteNotes}
        setEditingNote={openEditModal}
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
        noteToDelete={noteToDelete}
        setNoteToDelete={setNoteToDelete}
        handleConfirmDelete={handleConfirmDelete}
        isClearDraftModalOpen={isClearDraftModalOpen}
        handleConfirmClearDraft={handleConfirmClearDraft}
        closeClearDraftModal={closeClearDraftModal}
        editingNote={editingNote}
        closeEditModal={closeEditModal}
        handleUpdateAndRecategorizeNote={handleUpdateAndRecategorizeNote}
        showInstructions={showInstructions}
        setShowInstructions={setShowInstructions}
        saveInstructions={saveInstructions}
        customInstructions={customInstructions}
        lastCustomInstructions={lastCustomInstructions}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        showRegenerateConfirmation={showRegenerateConfirmation}
        confirmRegenerate={confirmRegenerate}
        cancelRegenerate={cancelRegenerate}
        showReauthModal={showReauthModal}
        handleReconnect={handleReconnect}
        logout={logout}
        closeReauthModal={closeReauthModal}
        confirmLogoutOpen={confirmLogoutOpen}
        confirmLogout={confirmLogout}
        cancelLogout={cancelLogout}
        isDeleteAllModalOpen={isDeleteAllModalOpen}
        handleConfirmDeleteAll={handleConfirmDeleteAll}
        closeDeleteAllModal={closeDeleteAllModal}
        isDeleteSelectedModalOpen={isDeleteSelectedModalOpen}
        notesToDelete={notesToDelete}
        handleConfirmDeleteSelected={handleConfirmDeleteSelected}
        closeDeleteSelectedModal={closeDeleteSelectedModal}
        isDeleting={isDeleting}
      />
      <ToastContainer
        showNoteSavedToast={showNoteSavedToast}
        setShowNoteSavedToast={setShowNoteSavedToast}
        feedback={feedback}
        clearFeedback={clearFeedback}
      />
    </>
  );
};

export default App;
