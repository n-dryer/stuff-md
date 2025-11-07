import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import { useModalActions } from '../contexts/ModalContext';
import { Note } from '../types';
import Button from './Button';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote: string;
  note: Note;
}

const EditNoteModal = React.forwardRef<HTMLDivElement, EditNoteModalProps>(
  ({ isOpen, onClose, onSave, initialNote, note: noteData }, ref) => {
    const [note, setNote] = useState(initialNote);
    const backdropRef = useRef<HTMLDivElement>(null);
    const { requestDeleteNote } = useModalActions();
    const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
      isOpen,
      onClose,
      modalRef: ref,
    });

    useEffect(() => {
      setNote(initialNote);
    }, [initialNote]);

    useEffect(() => {
      if (isOpen && backdropRef.current) {
        // Focus backdrop to ensure keyboard events work
        const focusTimer = setTimeout(() => {
          backdropRef.current?.focus();
        }, 0);
        return () => clearTimeout(focusTimer);
      }
      return undefined;
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') {
        return;
      }
      const { style } = document.body;
      const previousOverflow = style.overflow;
      const previousPaddingRight = style.paddingRight;
      const scrollbarGap =
        typeof window !== 'undefined'
          ? window.innerWidth - document.documentElement.clientWidth
          : 0;

      style.overflow = 'hidden';
      if (scrollbarGap > 0) {
        style.paddingRight = `${scrollbarGap}px`;
      }

      return () => {
        style.overflow = previousOverflow;
        style.paddingRight = previousPaddingRight;
      };
    }, [isOpen]);

    const handleSave = useCallback(() => {
      onSave(note);
      onClose();
    }, [note, onSave, onClose]);

    const handleDelete = useCallback(() => {
      requestDeleteNote(noteData);
    }, [requestDeleteNote, noteData]);

    const hasChanges = useMemo(() => note !== initialNote, [note, initialNote]);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        ref={backdropRef}
        className='fixed inset-0 z-modal flex items-stretch justify-center bg-off-black/30 backdrop-blur-sm px-0 py-0 dark:bg-off-black/50 sm:items-center sm:px-4'
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role='presentation'
        aria-label='Edit note dialog backdrop'
      >
        <div
          ref={ref}
          className='relative flex h-full max-h-[100svh] w-full flex-col overflow-y-auto border-0 border-accent-black bg-off-white px-6 py-8 font-mono uppercase shadow-lg modal-enter dark:bg-brutal-gray sm:h-auto sm:max-w-2xl sm:rounded-radius-modal sm:border-2 sm:py-10 sm:px-10'
          role='dialog'
          aria-modal='true'
          aria-labelledby='edit-note-title'
        >
          <button
            onClick={onClose}
            aria-label='Close dialog'
            className='absolute top-6 right-6 flex h-8 w-8 items-center justify-center bg-off-white text-xl font-bold leading-none text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:bg-brutal-gray dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
          >
            ×
          </button>
          <div className='flex flex-1 flex-col justify-center'>
            <div className='pr-10'>
              <h2
                id='edit-note-title'
                className='text-2xl font-black tracking-modal-title text-off-black dark:text-off-white sm:text-3xl'
              >
                VIEW/EDIT NOTE
              </h2>
            </div>
            <textarea
              className='w-full flex-1 min-h-[200px] sm:min-h-[400px] bg-transparent text-sm sm:text-base font-mono text-off-black dark:text-off-white border-2 border-accent-black dark:border-off-white/50 resize-none focus:outline-none p-3 sm:p-4 mt-6'
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className='mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'>
              <Button
                onClick={handleSave}
                variant='fill'
                disabled={!hasChanges}
              >
                SAVE
              </Button>
              <Button variant='default' onClick={onClose}>
                CANCEL
              </Button>
              <button
                type='button'
                onClick={handleDelete}
                className='ml-auto uppercase font-mono font-bold text-xs sm:text-sm tracking-wider text-accent-black dark:text-off-white hover:text-destructive-red dark:hover:text-destructive-red transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black min-h-min-touch-target px-3 sm:px-4 py-2'
              >
                [DELETE]
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EditNoteModal.displayName = 'EditNoteModal';

export default EditNoteModal;
