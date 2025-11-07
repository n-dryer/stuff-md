import React from 'react';
import Toast from './Toast';

interface ToastContainerProps {
  showNoteSavedToast: boolean;
  setShowNoteSavedToast: (show: boolean) => void;
  showNoteEditedToast: boolean;
  setShowNoteEditedToast: (show: boolean) => void;
  feedback: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  clearFeedback: () => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  showNoteSavedToast,
  setShowNoteSavedToast,
  showNoteEditedToast,
  setShowNoteEditedToast,
  feedback,
  clearFeedback,
}) => {
  return (
    <>
      {showNoteSavedToast && (
        <Toast
          message='Stuff saved.'
          type='success'
          duration={2500}
          onDismiss={() => setShowNoteSavedToast(false)}
        />
      )}
      {showNoteEditedToast && (
        <Toast
          message='Stuff edited.'
          type='success'
          duration={2500}
          onDismiss={() => setShowNoteEditedToast(false)}
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
