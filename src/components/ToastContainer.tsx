import React from 'react';
import Toast from './Toast';

interface ToastContainerProps {
  showNoteSavedToast: boolean;
  setShowNoteSavedToast: (show: boolean) => void;
  showDraftSavedToast: boolean;
  setShowDraftSavedToast: (show: boolean) => void;
  draftToastCounter: number;
  feedback: { id: string; message: string; type: 'success' | 'error' | 'info' } | null;
  clearFeedback: () => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  showNoteSavedToast,
  setShowNoteSavedToast,
  showDraftSavedToast,
  setShowDraftSavedToast,
  draftToastCounter,
  feedback,
  clearFeedback,
}) => {
  return (
    <>
      {showNoteSavedToast && (
        <Toast
          message='Note added.'
          type='success'
          duration={2500}
          onDismiss={() => setShowNoteSavedToast(false)}
        />
      )}
      {showDraftSavedToast && (
        <Toast
          key={draftToastCounter}
          message='Draft saved.'
          type='success'
          duration={2500}
          onDismiss={() => setShowDraftSavedToast(false)}
        />
      )}
      {feedback && (
        <Toast
          key={feedback.id}
          message={feedback.message}
          type={feedback.type}
          onDismiss={clearFeedback}
        />
      )}
    </>
  );
};

export default ToastContainer;

