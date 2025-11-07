import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import { SYSTEM_INSTRUCTION } from '../services/aiService';
import Button from './Button';
import SegmentedControl from './SegmentedControl';
import InstructionsModalContent from './InstructionsModalContent';

interface InstructionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (instructions: string) => void;
  initialInstructions: string;
  initialMode?: 'default' | 'custom';
  lastCustomInstructions?: string;
}

const InstructionsModal: React.FC<InstructionsModalProps> = React.memo(
  ({
    isVisible,
    onClose,
    onSave,
    initialInstructions,
    initialMode = 'custom',
    lastCustomInstructions = '',
  }) => {
    const [instructions, setInstructions] = useState(initialInstructions);
    const [mode, setMode] = useState<'default' | 'custom'>('custom');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
      isOpen: isVisible,
      onClose,
      modalRef,
    });

    const sanitizedInitialInstructions = useMemo(
      () => initialInstructions.slice(0, 2000),
      [initialInstructions]
    );

    const hasExistingCustom = useMemo(() => {
      const norm = sanitizedInitialInstructions.trim();
      return !!norm && norm !== SYSTEM_INSTRUCTION.trim();
    }, [sanitizedInitialInstructions]);

    useEffect(() => {
      if (!isVisible) {
        return;
      }
      setInstructions(sanitizedInitialInstructions);
      setMode('default');
    }, [isVisible, sanitizedInitialInstructions]);

    useEffect(() => {
      if (isVisible && mode === 'custom') {
        const timer = window.setTimeout(() => textareaRef.current?.focus(), 10);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [isVisible, mode]);

    useEffect(() => {
      if (!isVisible || typeof document === 'undefined') {
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
    }, [isVisible]);

    const handleSave = () => {
      if (mode === 'default') {
        onSave(SYSTEM_INSTRUCTION);
        return;
      }
      onSave(instructions);
    };

    const hasChanges = useMemo(
      () => instructions !== sanitizedInitialInstructions,
      [instructions, sanitizedInitialInstructions]
    );

    const segmentedOptions = useMemo(
      () => [
        { label: 'DEFAULT', value: 'default' },
        { label: 'CUSTOM', value: 'custom' },
      ],
      []
    );

    const shouldEnableSave =
      mode === 'custom' ? hasChanges : hasExistingCustom && mode === 'default';
    const shouldShowActions =
      mode === 'custom' || (mode === 'default' && hasExistingCustom);

    if (!isVisible) {
      return null;
    }

    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isVisible && backdropRef.current) {
        // Focus backdrop to ensure keyboard events work
        const focusTimer = setTimeout(() => {
          backdropRef.current?.focus();
        }, 0);
        return () => clearTimeout(focusTimer);
      }
      return undefined;
    }, [isVisible]);

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        ref={backdropRef}
        className='fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-stretch justify-center px-0 py-0 z-50 sm:items-center sm:px-4'
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-modal='true'
        role='dialog'
        tabIndex={-1}
        aria-labelledby='instructions-modal-title'
        aria-describedby='instructions-description'
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          ref={modalRef}
          className='relative flex h-full max-h-[100svh] w-full flex-col overflow-hidden bg-off-white dark:bg-brutal-gray border-0 border-accent-black font-mono uppercase modal-enter sm:h-auto sm:max-w-4xl sm:rounded-[1.5rem] sm:border-2 sm:px-2 lg:max-w-3xl'
          onClick={event => event.stopPropagation()}
        >
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-accent-black/15 dark:border-off-white/20 px-5 py-4 bg-off-white dark:bg-brutal-gray sm:static sm:px-8 sm:py-6'>
            <h2
              className='text-2xl font-black tracking-wider text-off-black dark:text-off-white'
              id='instructions-modal-title'
            >
              AI INSTRUCTIONS
            </h2>
            <button
              onClick={onClose}
              aria-label='Close dialog'
              className='flex h-8 w-8 items-center justify-center rounded-sm text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
            >
              ×
            </button>
          </header>

          <div className='flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-8'>
            <div className='flex h-full flex-col gap-6 sm:gap-8'>
              <p
                id='instructions-description'
                className='text-sm sm:text-base text-off-black/80 dark:text-off-white/80 leading-relaxed tracking-wide normal-case'
              >
                These instructions guide how the AI categorizes every new item.
              </p>
              <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <SegmentedControl
                  options={segmentedOptions}
                  value={mode}
                  onChange={value => {
                    const next = value as 'default' | 'custom';
                    setMode(next);
                    if (next === 'custom') {
                      const norm = sanitizedInitialInstructions.trim();
                      if (
                        norm === SYSTEM_INSTRUCTION.trim() &&
                        lastCustomInstructions
                      ) {
                        setInstructions(lastCustomInstructions.slice(0, 2000));
                      }
                    }
                  }}
                  ariaLabel='Instruction mode selector'
                  className='w-full'
                  autoFocusActive={isVisible && mode === 'default'}
                />
                <InstructionsModalContent
                  mode={mode}
                  instructions={instructions}
                  setInstructions={setInstructions}
                  textareaRef={textareaRef}
                />
              </div>
            </div>
          </div>

          {shouldShowActions && (
            <footer className='sticky bottom-0 z-10 flex items-center gap-x-4 px-5 py-4 bg-off-white dark:bg-brutal-gray sm:static sm:px-8 sm:py-6'>
              <Button
                onClick={handleSave}
                variant='fill'
                disabled={!shouldEnableSave}
              >
                SAVE
              </Button>
              <Button onClick={onClose} variant='default'>
                CANCEL
              </Button>
            </footer>
          )}
        </div>
      </div>
    );
  }
);

InstructionsModal.displayName = 'InstructionsModal';

export default InstructionsModal;
