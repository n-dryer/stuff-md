import React, { useEffect, useRef } from 'react';
import { useModalInteraction } from '../hooks/useModalInteraction';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstructions: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onOpenInstructions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
    isOpen,
    onClose,
    modalRef,
  });

  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return undefined;
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

    // Focus backdrop to ensure keyboard events work
    const focusTimer = setTimeout(() => {
      backdropRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(focusTimer);
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={backdropRef}
      className='fixed inset-0 z-50 flex items-stretch justify-center bg-off-black/30 backdrop-blur-sm px-0 py-0 dark:bg-off-black/50 sm:items-center sm:px-4'
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role='dialog'
      aria-modal='true'
      aria-labelledby='help-modal-title'
      aria-describedby='help-modal-description'
      id='help-modal'
      tabIndex={-1}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        ref={modalRef}
        className='relative flex h-full max-h-[100svh] w-full flex-col overflow-hidden border-0 border-accent-black bg-off-white font-mono uppercase shadow-lg modal-enter dark:border-off-white/40 dark:bg-brutal-gray sm:h-auto sm:max-w-4xl sm:border-2 sm:rounded-[1.5rem]'
        onClick={event => event.stopPropagation()}
      >
        <header className='flex items-center justify-between border-b border-accent-black/15 px-5 py-4 dark:border-off-white/20 dark:bg-brutal-gray sm:px-8 sm:py-6'>
          <h2
            id='help-modal-title'
            className='text-2xl font-black tracking-[0.22em] text-accent-black dark:text-off-white sm:text-[1.75rem]'
          >
            HELP &amp; INFO
          </h2>
          <button
            onClick={onClose}
            aria-label='Close dialog'
            className='flex h-8 w-8 items-center justify-center rounded-sm text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
          >
            ×
          </button>
        </header>

        <div className='flex-1 overflow-y-auto px-5 py-6 text-left normal-case sm:px-8 sm:py-8'>
          <div className='grid gap-6 sm:gap-8'>
            <p
              id='help-modal-description'
              className='max-w-2xl text-sm leading-relaxed tracking-wide text-off-black/80 dark:text-off-white/80 sm:text-base'
            >
              Lost? Here are the basics in one shot.
            </p>

            <section className='grid gap-6 sm:grid-cols-2 sm:gap-10'>
              <div className='space-y-4'>
                <h3 className='text-xs font-black tracking-[0.35em] text-accent-black/80 dark:text-off-white/80'>
                  CAPTURE
                </h3>
                <p className='text-sm leading-relaxed text-off-black/75 dark:text-off-white/75'>
                  Compose at the bottom; every item lands in Drive
                  automatically.
                </p>
                <ul className='space-y-2 text-sm leading-relaxed text-off-black/70 dark:text-off-white/70 list-disc list-inside'>
                  <li>
                    Save with the button or{' '}
                    <span className='font-semibold'>⌘↩</span>.
                  </li>
                  <li>AI tags and categorizes on save.</li>
                  <li>Empty drafts show a warning before saving.</li>
                </ul>
              </div>
              <div className='space-y-4'>
                <h3 className='text-xs font-black tracking-[0.35em] text-accent-black/80 dark:text-off-white/80'>
                  FIND STUFF
                </h3>
                <p className='text-sm leading-relaxed text-off-black/75 dark:text-off-white/75'>
                  Everything is searchable and filterable.
                </p>
                <ul className='space-y-2 text-sm leading-relaxed text-off-black/70 dark:text-off-white/70 list-disc list-inside'>
                  <li>
                    Jump to search with{' '}
                    <span className='font-semibold'>⌘K</span>.
                  </li>
                  <li>Click tags to toggle filters.</li>
                  <li>Clear filters from the stuff list toolbar.</li>
                </ul>
              </div>
            </section>

            <section className='grid gap-6 sm:grid-cols-2 sm:gap-10'>
              <div className='space-y-4'>
                <h3 className='text-xs font-black tracking-[0.35em] text-accent-black/80 dark:text-off-white/80'>
                  LAYOUT
                </h3>
                <p className='text-sm leading-relaxed text-off-black/75 dark:text-off-white/75'>
                  The layout flexes for mobile or desktop.
                </p>
                <ul className='space-y-2 text-sm leading-relaxed text-off-black/70 dark:text-off-white/70 list-disc list-inside'>
                  <li>Toggle the sidebar chevron for space or labels.</li>
                  <li>Switch themes from the footer control.</li>
                  <li>All controls support keyboard navigation.</li>
                </ul>
              </div>
              <div className='space-y-4'>
                <h3 className='text-xs font-black tracking-[0.35em] text-accent-black/80 dark:text-off-white/80'>
                  AI CONTROLS
                </h3>
                <p className='text-sm leading-relaxed text-off-black/75 dark:text-off-white/75'>
                  Tune how stuff gets classified. Need more control?{' '}
                  <button
                    type='button'
                    onClick={() => {
                      onClose();
                      onOpenInstructions();
                    }}
                    className='inline font-semibold text-accent-black underline decoration-2 underline-offset-4 transition-colors hover:text-off-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black focus-visible:ring-offset-off-white dark:text-off-white dark:hover:text-off-white/80 dark:focus-visible:ring-off-white dark:focus-visible:ring-offset-off-black'
                  >
                    AI Rules
                  </button>
                </p>
                <ul className='space-y-2 text-sm leading-relaxed text-off-black/70 dark:text-off-white/70 list-disc list-inside'>
                  <li>
                    Use the footer toggle marked{' '}
                    <span className='font-semibold'>[DEFAULT]</span>.
                  </li>
                  <li>Saved changes apply to new stuff immediately.</li>
                  <li>
                    Revert to the built-in instructions whenever you like.
                  </li>
                </ul>
              </div>
            </section>

            <div className='rounded-xl border border-accent-black/20 bg-off-white/80 px-5 py-4 text-sm font-bold uppercase tracking-[0.24em] text-off-black/70 shadow-sm dark:border-off-white/15 dark:bg-off-black/50 dark:text-off-white/70 sm:text-base sm:px-6 sm:py-5'>
              <div className='flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center'>
                <span className='whitespace-nowrap'>SHORTCUTS</span>
                <span className='whitespace-nowrap font-normal tracking-[0.08em] text-off-black/65 dark:text-off-white/65'>
                  <kbd className='px-3 py-2 text-base font-semibold text-off-white bg-off-black rounded-lg dark:bg-off-white dark:text-off-black'>
                    ⏎
                  </kbd>{' '}
                  - New Line
                </span>
                <span className='whitespace-nowrap font-normal tracking-[0.08em] text-off-black/65 dark:text-off-white/65'>
                  <kbd className='px-3 py-2 text-base font-semibold text-off-white bg-off-black rounded-lg dark:bg-off-white dark:text-off-black'>
                    ⌘
                  </kbd>{' '}
                  +{' '}
                  <kbd className='px-3 py-2 text-base font-semibold text-off-white bg-off-black rounded-lg dark:bg-off-white dark:text-off-black'>
                    ↩
                  </kbd>{' '}
                  - Add Stuff
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
