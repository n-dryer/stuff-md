import { useState, useCallback } from 'react';
import { useUIActions } from '../contexts/UIContext';

export const useToasts = () => {
  const [showNoteSavedToast, setShowNoteSavedToast] = useState(false);
  const [showNoteEditedToast, setShowNoteEditedToast] = useState(false);
  const { displayFeedback } = useUIActions();

  const showNoteSavedToastCallback = useCallback(() => {
    displayFeedback('success', 'Your stuff was saved.', 2000);
  }, [displayFeedback]);

  const handleDraftSavedToast = useCallback(() => {
    setShowNoteSavedToast(true);
  }, []);

  return {
    showNoteSavedToast,
    setShowNoteSavedToast,
    showNoteEditedToast,
    setShowNoteEditedToast,
    handleDraftSavedToast,
    showNoteSavedToastCallback,
  };
};
