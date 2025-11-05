import { useState, useCallback } from 'react';

export const useToasts = () => {
  const [showNoteSavedToast, setShowNoteSavedToast] = useState(false);

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

