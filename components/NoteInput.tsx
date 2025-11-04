import React, { useEffect, useState, useRef, useCallback } from 'react';

import { useDebounce } from '../hooks/useDebounce';
import BrutalistSpinner from './BrutalistSpinner';
import MarkdownRenderer from './MarkdownRenderer';

interface NoteInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isSaving: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onRequestClearOrBlur: () => void;
  onDraftSaved?: () => void;
}

const NOTE_MAX_LENGTH = 100000;

const NoteInput: React.FC<NoteInputProps> = ({
  value,
  onChange,
  onSave,
  isSaving,
  inputRef,
  onRequestClearOrBlur,
  onDraftSaved,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const debouncedValue = useDebounce(value, 1000);
  const isInitialMount = useRef(true);
  const justSavedRef = useRef(false);

  const handleSave = useCallback(() => {
    if (value.trim() && !isSaving) {
      justSavedRef.current = true;
      onSave();
      setTimeout(() => {
        justSavedRef.current = false;
      }, 2000);
    }
  }, [value, isSaving, onSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Preview toggle: Cmd/Ctrl + Shift + P
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreview(!isPreview);
        return;
      }

      if (!isPreview && !modifierKey && e.key === 'Enter') {
        if (e.shiftKey) {
          return;
        }
        e.preventDefault();
        handleSave();
        return;
      }

      // Save: Cmd/Ctrl + Enter
      if (modifierKey && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Escape: exit preview or blur/clear input
      if (e.key === 'Escape') {
        e.preventDefault();
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
  }, [handleSave, isPreview, inputRef, onRequestClearOrBlur, setIsPreview]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (
      debouncedValue.trim() &&
      !isPreview &&
      !isSaving &&
      !justSavedRef.current
    ) {
      onDraftSaved?.();
    }
  }, [debouncedValue, isPreview, isSaving, onDraftSaved]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea || isPreview) return;

    const hasContent = value.trim() !== '';
    const baseHeight = 48; // in px
    const minExpandedHeight = 96; // in px

    if (isFocused || hasContent) {
      textarea.style.height = `${baseHeight}px`;
      setTimeout(() => {
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.max(scrollHeight, minExpandedHeight)}px`;
      }, 0);
    } else {
      textarea.style.height = `${baseHeight}px`;
    }
  }, [isFocused, value, inputRef, isPreview]);

  const showPrompt = value.trim() === '' && !isSaving && !isPreview;
  const placeholderText =
    'Type your note. Saved to Google Drive, organized by AI. Enter saves.';

  return (
    <div className='relative flex w-full min-w-0 items-start sm:items-center gap-2 sm:gap-3 md:gap-4'>
      <span
        aria-hidden='true'
        className={`absolute top-2 sm:top-3 md:top-4 left-0 font-mono text-xs sm:text-sm md:text-base text-gray-400 dark:text-gray-500 select-none transition-opacity duration-150 pointer-events-none ${
          showPrompt ? 'opacity-100' : 'opacity-0'
        }`}
      >
        &gt;
      </span>
      {isPreview ? (
        <div className='flex-grow min-w-0 bg-transparent text-sm sm:text-base font-mono leading-relaxed break-words whitespace-pre-wrap overflow-y-auto transition-all duration-150 min-h-[48px] py-3 pr-2'>
          <MarkdownRenderer content={value || 'No preview.'} />
        </div>
      ) : (
        <textarea
          id='note-input'
          name='note'
          ref={inputRef}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholderText}
          className={`flex-grow min-w-0 max-w-full w-full bg-transparent focus:outline-none text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm placeholder-gray-400 dark:placeholder-gray-500 font-mono leading-relaxed resize-none overflow-y-hidden transition-all duration-150 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap ${
            showPrompt ? 'pl-6 sm:pl-8 md:pl-10' : ''
          }`}
          disabled={isSaving}
          rows={1}
          maxLength={NOTE_MAX_LENGTH}
        />
      )}

      <div className='flex flex-col items-end flex-shrink-0 sm:ml-2 min-w-0'>
        <div className='h-8 flex items-center justify-end'>
          {isSaving && <BrutalistSpinner />}
        </div>
      </div>
    </div>
  );
};

export default NoteInput;
