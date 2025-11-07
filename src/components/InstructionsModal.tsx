import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import { SYSTEM_INSTRUCTION } from '../services/aiService';
import Button from './Button';
import SegmentedControl from './SegmentedControl';
import InstructionsModalContent from './InstructionsModalContent';
import { useUIActions } from '../contexts/UIContext';

interface InstructionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (instructions: string) => void;
  initialInstructions: string;
  lastCustomInstructions?: string;
}

const InstructionsModal: React.FC<InstructionsModalProps> = React.memo(
  ({
    isVisible,
    onClose,
    onSave,
    initialInstructions,
    lastCustomInstructions = '',
  }) => {
    // Initialize with empty string - useEffect will set correct initial value
    const [instructions, setInstructions] = useState('');
    const [hasChanged, setHasChanged] = useState(false);
    const [mode, setMode] = useState<'default' | 'custom'>('default');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const prevVisibleRef = useRef(false);
    const backdropRef = useRef<HTMLDivElement>(null);
    const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
      isOpen: isVisible,
      onClose,
      modalRef,
    });
    const { displayFeedback } = useUIActions();

    const sanitizedInitialInstructions = useMemo(
      () => initialInstructions.slice(0, 2000),
      [initialInstructions]
    );

    const hasExistingCustom = useMemo(() => {
      const norm = sanitizedInitialInstructions.trim();
      return !!norm && norm !== SYSTEM_INSTRUCTION.trim();
    }, [sanitizedInitialInstructions]);

    // Only reset state when modal FIRST becomes visible, not when props change
    useEffect(() => {
      const justOpened = isVisible && !prevVisibleRef.current;
      if (justOpened) {
        // Set mode based on whether there are existing custom instructions
        // Compare full strings (not sanitized) to properly detect SYSTEM_INSTRUCTION
        const norm = initialInstructions.trim();
        const systemNorm = SYSTEM_INSTRUCTION.trim();

        // Robust comparison: check if empty or exactly matches SYSTEM_INSTRUCTION
        const isDefault = !norm || norm === systemNorm;

        if (isDefault) {
          // Default instructions are active - set to default mode and keep custom textarea empty
          setMode('default');
          setInstructions(''); // Keep custom textarea empty, reserved for custom instructions only
        } else {
          // Custom instructions exist - set to custom mode with those instructions
          setMode('custom');
          setInstructions(sanitizedInitialInstructions);
        }
        setHasChanged(false);
      }
      prevVisibleRef.current = isVisible;
    }, [isVisible, initialInstructions, sanitizedInitialInstructions]);

    useEffect(() => {
      if (isVisible && mode === 'custom') {
        const timer = window.setTimeout(() => textareaRef.current?.focus(), 10);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [isVisible, mode]);

    // Defensive check: prevent default instructions from appearing in custom textarea
    useEffect(() => {
      if (
        mode === 'custom' &&
        instructions.trim() === SYSTEM_INSTRUCTION.trim()
      ) {
        // If somehow default instructions got into custom textarea, clear it
        setInstructions('');
        setHasChanged(true);
      }
    }, [mode, instructions]);

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
      // Close modal first to prevent state reset
      onClose();

      // Then save and show feedback
      if (mode === 'default') {
        onSave(SYSTEM_INSTRUCTION);
        displayFeedback('success', 'AI Rules reset to default.');
      } else {
        // If custom instructions are empty/whitespace, switch back to default
        const trimmedInstructions = instructions.trim();
        if (!trimmedInstructions) {
          onSave(SYSTEM_INSTRUCTION);
          displayFeedback('success', 'AI Rules reset to default.');
        } else {
          onSave(instructions);
          displayFeedback('success', 'Custom instructions saved.');
        }
      }
    };

    const segmentedOptions = useMemo(
      () => [
        { label: 'DEFAULT', value: 'default' },
        { label: 'CUSTOM', value: 'custom' },
      ],
      []
    );

    const shouldEnableSave =
      (mode === 'custom' && hasChanged) ||
      (mode === 'default' && hasExistingCustom);
    const shouldShowActions =
      mode === 'custom' || (mode === 'default' && hasExistingCustom);

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

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={backdropRef}
        className='fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-stretch justify-center px-0 py-0 z-modal sm:items-center sm:px-4'
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role='presentation'
        aria-labelledby='instructions-modal-title'
        aria-describedby='instructions-description'
      >
        <div
          ref={modalRef}
          className='relative flex h-full max-h-[100svh] w-full flex-col overflow-hidden bg-off-white dark:bg-brutal-gray border-0 border-accent-black font-mono uppercase modal-enter sm:h-auto sm:max-w-4xl sm:rounded-radius-modal sm:border-2 sm:px-2 lg:max-w-3xl'
          role='dialog'
          aria-modal='true'
        >
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-accent-black/15 dark:border-off-white/20 px-5 py-4 bg-off-white dark:bg-brutal-gray sm:static sm:px-8 sm:py-6'>
            <h2
              className='text-2xl font-black tracking-wider text-off-black dark:text-off-white'
              id='instructions-modal-title'
            >
              AI RULES
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
                      // When switching to custom tab, only populate if there are actual custom instructions
                      // Use full string comparison (not sanitized) to properly detect default
                      const norm = initialInstructions.trim();
                      const systemNorm = SYSTEM_INSTRUCTION.trim();
                      const isDefault = !norm || norm === systemNorm;

                      if (isDefault && lastCustomInstructions) {
                        // Default is active but we have previous custom instructions - use those
                        setInstructions(lastCustomInstructions.slice(0, 2000));
                      } else if (!isDefault) {
                        // Custom instructions exist - use current custom instructions
                        setInstructions(sanitizedInitialInstructions);
                      } else {
                        // Default is active and no previous custom instructions - keep textarea empty
                        setInstructions('');
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
                  setInstructions={newInstructions => {
                    setInstructions(newInstructions);
                    setHasChanged(true);
                  }}
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
