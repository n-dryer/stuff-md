import React, { useEffect } from 'react';
import { hasOpenModals } from '../utils/modalStack';

interface UseNoteInputKeyboardProps {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isPreview: boolean;
  setIsPreview: (preview: boolean) => void;
  onSave: () => void;
  onRequestClearOrBlur: () => void;
  onOpenInstructions: () => void;
}

/**
 * Hook for handling keyboard shortcuts in note input
 */
export const useNoteInputKeyboard = ({
  inputRef,
  isPreview,
  setIsPreview,
  onSave,
  onRequestClearOrBlur,
  onOpenInstructions,
}: UseNoteInputKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreview(!isPreview);
        return;
      }

      if (modifierKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        onOpenInstructions();
        return;
      }

      if (modifierKey && e.key === 'Enter') {
        e.preventDefault();
        onSave();
        return;
      }

      if (e.key === 'Escape') {
        if (hasOpenModals()) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (isPreview) {
          setIsPreview(false);
        } else {
          onRequestClearOrBlur();
        }
      }
    };

    const input = inputRef.current;
    if (isPreview) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      input?.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (isPreview) {
        window.removeEventListener('keydown', handleKeyDown);
      } else {
        input?.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [
    onSave,
    isPreview,
    inputRef,
    onRequestClearOrBlur,
    setIsPreview,
    onOpenInstructions,
  ]);
};
