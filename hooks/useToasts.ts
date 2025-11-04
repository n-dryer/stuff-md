import { useState, useCallback } from 'react';

export const useToasts = () => {
  const [showNoteSavedToast, setShowNoteSavedToast] = useState(false);
  const [showDraftSavedToast, setShowDraftSavedToast] = useState(false);
  const [draftToastCounter, setDraftToastCounter] = useState(0);

  const handleDraftSavedToast = useCallback(() => {
    setDraftToastCounter(prev => prev + 1);
    setShowDraftSavedToast(true);
  }, []);

  return {
    showNoteSavedToast,
    setShowNoteSavedToast,
    showDraftSavedToast,
    setShowDraftSavedToast,
    draftToastCounter,
    handleDraftSavedToast,
  };
};

