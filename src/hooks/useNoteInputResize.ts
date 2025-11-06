import React, { useEffect } from 'react';

interface UseNoteInputResizeProps {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isFocused: boolean;
  value: string;
  isPreview: boolean;
}

const COLLAPSED_TEXTAREA_HEIGHT = 136;
const FOCUSED_TEXTAREA_HEIGHT = 192;
const MIN_EXPANDED_TEXTAREA_HEIGHT = 240;

/**
 * Hook for auto-resizing textarea based on content and focus state
 */
export const useNoteInputResize = ({
  inputRef,
  isFocused,
  value,
  isPreview,
}: UseNoteInputResizeProps) => {
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea || isPreview) return;

    const hasContent = value.trim() !== '';
    const baseHeight =
      isFocused || hasContent
        ? FOCUSED_TEXTAREA_HEIGHT
        : COLLAPSED_TEXTAREA_HEIGHT;

    if (isFocused || hasContent) {
      textarea.style.height = `${baseHeight}px`;
      window.requestAnimationFrame(() => {
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.max(scrollHeight, MIN_EXPANDED_TEXTAREA_HEIGHT);
        textarea.style.height = `${newHeight}px`;
      });
    } else {
      textarea.style.height = `${baseHeight}px`;
    }
  }, [isFocused, value, inputRef, isPreview]);
};
