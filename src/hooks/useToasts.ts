import { useState, useCallback } from 'react';

export const useToasts = () => {
  const [showNoteSavedToast, setShowNoteSavedToast] = useState(false);

  const showNoteSavedToast = useCallback(() => {
    displayFeedback('success', 'Your stuff was saved.', 2000);
  }, [displayFeedback]);

  const handleDraftSavedToast = useCallback(() => {
    // Inline indicator in NoteInput handles draft saved feedback
    // No toast needed to avoid duplicate notifications
  }, []);

  return {
    showNoteSavedToast,
    setShowNoteSavedToast,
    handleDraftSavedToast,
  };
};
