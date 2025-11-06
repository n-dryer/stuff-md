import React, { useEffect, useRef } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import Button from './Button';
import BrutalistSpinner from './BrutalistSpinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: 'default' | 'destructive';
  isDeleting?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = React.memo(
  ({
    isOpen,
    onConfirm,
    onCancel,
    title = 'CONFIRM',
    message,
    confirmLabel = 'DELETE',
    cancelLabel = 'CANCEL',
    confirmTone = 'destructive',
    isDeleting = false,
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
      isOpen,
      onClose: onCancel,
      modalRef,
    });

    useEffect(() => {
      if (isOpen) {
        const confirmButton = modalRef.current?.querySelector('button');
        (confirmButton as HTMLElement)?.focus();
      }
    }, [isOpen]);

    if (!isOpen) {
      return null;
    }

    const responsiveButtonClasses =
      '!text-xs sm:!text-sm md:!text-base !px-3 sm:!px-4 md:!px-6 !py-1.5 sm:!py-2 md:!py-3 whitespace-nowrap';
    const isLogoutButton = title === 'LOGOUT' || confirmLabel === 'LOGOUT';
    const redHoverEffect =
      'hover:!bg-destructive-red hover:!border-destructive-red hover:!text-off-white hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 dark:hover:!bg-destructive-red dark:hover:!border-destructive-red dark:hover:!text-off-black dark:hover:shadow-brutalist-dark';
    const confirmButtonToneClass =
      confirmTone === 'destructive' || isLogoutButton
        ? `${responsiveButtonClasses} ${redHoverEffect}`
        : responsiveButtonClasses;
    const cancelButtonClasses = `${responsiveButtonClasses} !bg-off-white !text-off-black !border-accent-black dark:!bg-off-black dark:!text-off-white dark:!border-off-white/80`;

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        className='fixed inset-0 z-[60] flex items-stretch justify-center bg-off-black/30 backdrop-blur-sm px-0 py-0 dark:bg-off-black/50 sm:items-center sm:px-4'
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-modal='true'
        role='dialog'
        aria-labelledby='confirmation-title'
        tabIndex={-1}
        aria-label='Confirmation dialog backdrop'
      >
        <div
          ref={modalRef}
          className='relative flex h-full max-h-[100svh] w-full flex-col overflow-y-auto border-0 border-accent-black bg-off-white px-6 py-8 font-mono uppercase shadow-lg modal-enter dark:bg-brutal-gray sm:h-auto sm:max-w-lg sm:rounded-[1.5rem] sm:border-2 sm:py-10 sm:px-10'
          role='document'
        >
          <button
            onClick={onCancel}
            aria-label='Close dialog'
            className='absolute top-6 right-6 flex h-8 w-8 items-center justify-center bg-off-white text-xl font-bold leading-none text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:bg-brutal-gray dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
          >
            ×
          </button>
          <div className='flex flex-1 flex-col justify-center'>
            <div className='pr-10'>
              <h2
                id='confirmation-title'
                className='text-2xl font-black tracking-[0.25em] text-off-black dark:text-off-white sm:text-3xl'
              >
                {title}
              </h2>
              <p className='mt-6 text-base leading-relaxed text-off-black/80 dark:text-off-white/80 sm:mt-8'>
                {message}
              </p>
            </div>
            <div className='mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'>
              <div className='flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]'>
                <Button
                  onClick={onConfirm}
                  variant='fill'
                  disabled={isDeleting}
                  aria-disabled={isDeleting}
                  className={`${confirmButtonToneClass} w-full sm:w-auto`}
                >
                  {confirmLabel}
                </Button>
                {isDeleting && <BrutalistSpinner />}
              </div>
              <Button
                onClick={onCancel}
                variant='default'
                disabled={isDeleting}
                className={`${cancelButtonClasses} w-full sm:w-auto`}
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;
