import React, { useEffect, useState, useRef, useCallback } from 'react';

import { useDebounce } from '../hooks/useDebounce';
import { useNoteInputKeyboard } from '../hooks/useNoteInputKeyboard';
import { useNoteInputResize } from '../hooks/useNoteInputResize';
import BrutalistSpinner from './BrutalistSpinner';
import MarkdownRenderer from './MarkdownRenderer';

interface NoteInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isSaving: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onRequestClearOrBlur: () => void;
  onDraftSaved?: () => void;
  onOpenInstructions: () => void;
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
  onOpenInstructions,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const debouncedValue = useDebounce(value, 500);
  const isInitialMount = useRef(true);
  const justSavedRef = useRef(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const hasFocusedInitially = useRef(false);

  const handleSave = useCallback(() => {
    if (value.trim() && !isSaving) {
      justSavedRef.current = true;
      onSave();
      setTimeout(() => {
        justSavedRef.current = false;
      }, 2000);
    }
  }, [value, isSaving, onSave]);

  useNoteInputKeyboard({
    inputRef,
    isPreview,
    setIsPreview,
    onSave: handleSave,
    onRequestClearOrBlur,
    onOpenInstructions,
  });

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
      setShowDraftSaved(true);
      onDraftSaved?.();

      const timer = setTimeout(() => {
        setShowDraftSaved(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setShowDraftSaved(false);
      return undefined;
    }
  }, [debouncedValue, isPreview, isSaving, onDraftSaved]);

  useEffect(() => {
    if (!hasFocusedInitially.current && inputRef.current && !isPreview) {
      inputRef.current.focus();
      setIsFocused(true);
      hasFocusedInitially.current = true;
    }
  }, [inputRef, isPreview]);

  useNoteInputResize({
    inputRef,
    isFocused,
    value,
    isPreview,
  });

  const placeholderText = 'Type to add stuff...';

  const containerWidthClasses = isFocused
    ? 'max-w-[calc(100%_-_1rem)] sm:max-w-[calc(100%_-_1.25rem)] md:max-w-[min(100%,70ch)] lg:max-w-[min(100%,78ch)] xl:max-w-[min(100%,84ch)]'
    : 'max-w-[calc(100%_-_1.5rem)] sm:max-w-[calc(100%_-_2rem)] md:max-w-[min(100%,64ch)] lg:max-w-[min(100%,72ch)] xl:max-w-[min(100%,80ch)]';

  const containerScaleClasses =
    isFocused && !isPreview
      ? 'md:scale-[1.01] sm:scale-[1.008] scale-[1.004]'
      : 'scale-100';

  const handleContainerMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isPreview) {
        return;
      }

      const textarea = inputRef.current;
      if (!textarea) {
        return;
      }

      if (event.target === textarea) {
        return;
      }

      event.preventDefault();
      textarea.focus();
    },
    [inputRef, isPreview]
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onMouseDown={handleContainerMouseDown}
      className={`relative flex w-full min-w-0 items-start gap-2 sm:gap-3 md:gap-4 transition-all duration-300 ease-in-out origin-left will-change-transform ${containerWidthClasses} ${containerScaleClasses} ${
        isPreview ? '' : 'cursor-text'
      }`}
    >
      {isPreview ? (
        <div className='flex-grow min-w-0 bg-transparent text-sm sm:text-base font-mono leading-relaxed break-words whitespace-pre-wrap overflow-y-auto transition-all duration-150 min-h-[48px] py-3 pr-2'>
          <MarkdownRenderer
            content={
              value || '**SHORTCUTS**\n\n* ⏎ - New Line\n* ⌘ + ↩ - Add Stuff'
            }
          />
        </div>
      ) : (
        <div className='relative flex-grow min-w-0 max-w-full w-full'>
          <textarea
            id='note-input'
            name='note'
            ref={inputRef}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholderText}
            className='w-full bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base placeholder-light-gray dark:placeholder-light-gray font-mono leading-relaxed resize-none overflow-y-hidden transition-[height,padding,background-color,color] duration-250 ease-in-out px-4 sm:px-5 md:px-6 py-3.5 sm:py-5 md:py-6'
            disabled={isSaving}
            rows={1}
            maxLength={NOTE_MAX_LENGTH}
          />
        </div>
      )}
      {isSaving && (
        <div className='absolute top-3.5 sm:top-5 md:top-6 left-0 right-0 flex justify-center z-20 pointer-events-none transition-opacity duration-200 ease-in-out'>
          <BrutalistSpinner />
        </div>
      )}
      {showDraftSaved && !isSaving && (
        <div className='absolute -top-8 left-0 right-0 flex justify-center z-10 pointer-events-none'>
          <div className='inline-flex items-center gap-1.5 px-2 py-1 bg-off-white dark:bg-brutal-gray border border-accent-black/30 dark:border-off-white/30 text-xs font-mono font-bold text-accent-black/60 dark:text-off-white/60 uppercase tracking-wider'>
            <svg
              width='12'
              height='12'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='flex-shrink-0'
              aria-hidden='true'
            >
              <path
                d='M13.3333 4L6 11.3333L2.66667 8'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>Draft saved</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteInput;
