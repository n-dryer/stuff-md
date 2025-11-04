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
  } = useUIState();

  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>(
    'stuffmd.viewMode',
    'grid'
  );
  const instructionsButtonRef = useRef<HTMLButtonElement>(null);

  const {
    showNoteSavedToast,
    setShowNoteSavedToast,
    showDraftSavedToast,
    setShowDraftSavedToast,
    draftToastCounter,
    handleDraftSavedToast,
  } = useToasts();

  const { dynamicCategories } = useCategories(notes);

  const {
    noteToDelete,
    editingNote,
    isClearDraftModalOpen,
    showReauthModal,
    setNoteToDelete,
    requestDeleteNote,
    openEditModal,
    closeEditModal,
    openClearDraftModal,
    closeClearDraftModal,
    openReauthModal,
    closeReauthModal,
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
    setShowDraftSavedToast(false);
    try {
      await handleSaveNoteBase();
    } finally {
      setIsSaving(false);
    }
  }, [
    draft,
    accessToken,
    isSaving,
    handleSaveNoteBase,
    setShowDraftSavedToast,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    await handleConfirmDeleteBase(noteToDelete);
  }, [noteToDelete, handleConfirmDeleteBase]);

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
      <div className='min-h-screen flex items-center justify-center font-mono'>
        <p aria-live='polite'>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense
        fallback={
          <div className='min-h-screen flex items-center justify-center font-mono'>
            <p aria-live='polite'>Loading login screen...</p>
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
        setEditingNote={openEditModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        debouncedSearchQuery={debouncedSearchQuery}
        logout={requestLogout}
        customInstructions={customInstructions}
        setShowInstructions={setShowInstructions}
        instructionsButtonRef={instructionsButtonRef}
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
        showReauthModal={showReauthModal}
        handleReconnect={handleReconnect}
        logout={logout}
        confirmLogoutOpen={confirmLogoutOpen}
        confirmLogout={confirmLogout}
        cancelLogout={cancelLogout}
      />
      <ToastContainer
        showNoteSavedToast={showNoteSavedToast}
        setShowNoteSavedToast={setShowNoteSavedToast}
        showDraftSavedToast={showDraftSavedToast}
        setShowDraftSavedToast={setShowDraftSavedToast}
        draftToastCounter={draftToastCounter}
        feedback={feedback}
        clearFeedback={clearFeedback}
      />
    </>
  );
};

export default App;
