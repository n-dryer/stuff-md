import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import Button from './Button';
import BrutalistSpinner from './BrutalistSpinner';
import { Note } from '../types';
import { logError } from '../utils/logger';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note, newContent: string) => Promise<void>;
  note: Note | null;
  onRequestDelete?: (noteId: string) => void;
  isDeleting?: boolean;
}

const EditNoteModal: React.FC<EditNoteModalProps> = React.memo(
  ({ isOpen, onClose, onSave, note, onRequestDelete, isDeleting = false }) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [originalContent, setOriginalContent] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
      isOpen,
      onClose,
      modalRef,
    });

    useEffect(() => {
      if (note) {
        setContent(note.content);
        setOriginalContent(note.content);
      }
    }, [note]);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    }, [isOpen]);

    const handleSave = useCallback(async () => {
      if (!note || !content.trim() || isSaving || content === originalContent)
        return;
      setIsSaving(true);
      try {
        await onSave(note, content);
        onClose();
      } catch (error) {
        logError('Failed to save note:', error);
      } finally {
        setIsSaving(false);
      }
    }, [note, content, originalContent, isSaving, onSave, onClose]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (content.trim() && content !== originalContent && !isSaving) {
            handleSave();
          }
        }
      };
      if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, handleSave, content, originalContent, isSaving]);

    if (!isOpen || !note) {
      return null;
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        className='fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4'
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-modal='true'
        role='dialog'
        aria-labelledby='edit-note-title'
        aria-describedby='edit-note-description'
        tabIndex={-1}
        aria-label='Edit note dialog backdrop'
      >
        <div
          ref={modalRef}
          className='bg-off-white dark:bg-brutal-gray p-4 sm:p-6 md:p-8 border-2 border-accent-black dark:border-off-white/50 w-full max-w-5xl m-0 sm:m-4 flex flex-col h-full sm:h-auto sm:max-h-[90vh] relative'
          role='document'
        >
          <button
            onClick={onClose}
            aria-label='Close dialog'
            className='absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center bg-off-white text-xl font-bold leading-none text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:bg-brutal-gray dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
          >
            ×
          </button>
          <div className='mb-2'>
            <h2
              id='edit-note-title'
              className='text-xl md:text-2xl font-black uppercase font-mono tracking-wider truncate text-off-black dark:text-off-white pr-8'
            >
              VIEW/EDIT: {note.title}
            </h2>
          </div>
          <p
            id='edit-note-description'
            className='text-base text-off-black/80 dark:text-off-white/80 mb-6 leading-relaxed tracking-wide'
          >
            Edit the content of this note. Changes will be saved to Google
            Drive.
          </p>

          <div className='relative flex-grow'>
            <textarea
              id='edit-note-content'
              name='noteContent'
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isSaving || isDeleting}
              className='w-full flex-grow bg-off-white dark:bg-brutal-gray text-base font-mono text-off-black dark:text-off-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none p-3 border-2 border-accent-black dark:border-off-white/50 min-h-[30vh] disabled:opacity-60 disabled:cursor-not-allowed'
            />
            {isSaving && (
              <div
                className='absolute inset-0 pointer-events-auto cursor-not-allowed z-10'
                aria-label='Saving note, please wait'
                role='status'
              />
            )}
          </div>
          <p className='text-xs text-off-black/60 dark:text-off-white/60 mt-2'>
            Cmd/Ctrl + Enter to save. ESC to close.
          </p>

          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-x-4 mt-6 flex-shrink-0'>
            <div className='flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]'>
              <Button
                onClick={handleSave}
                variant='fill'
                disabled={
                  isSaving ||
                  isDeleting ||
                  !content.trim() ||
                  content === originalContent
                }
                aria-disabled={
                  isSaving ||
                  isDeleting ||
                  !content.trim() ||
                  content === originalContent
                }
                className='w-full sm:w-auto'
              >
                {isSaving ? 'SAVING...' : 'SAVE'}
              </Button>
              {isSaving && <BrutalistSpinner />}
              <Button
                onClick={onClose}
                variant='default'
                disabled={isSaving || isDeleting}
                className='w-full sm:w-auto'
              >
                CANCEL
              </Button>
            </div>
            <div className='flex items-center gap-3 sm:gap-x-4 flex-wrap'>
              {onRequestDelete && note && (
                <button
                  onClick={() => onRequestDelete(note.id)}
                  disabled={isSaving || isDeleting}
                  className='inline-flex items-center justify-center uppercase font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider text-light-gray hover:text-destructive-red dark:text-gray-500 dark:hover:text-destructive-red hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 text-center whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto'
                  aria-label='Delete note'
                  title='Delete note'
                >
                  [DELETE]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EditNoteModal.displayName = 'EditNoteModal';

export default EditNoteModal;
