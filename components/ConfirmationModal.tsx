import React, { useEffect, useRef } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: 'default' | 'destructive';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = React.memo(({
  isOpen,
  onConfirm,
  onCancel,
  title = 'CONFIRM',
  message,
  confirmLabel = 'DELETE',
  cancelLabel = 'CANCEL',
  confirmTone = 'destructive',
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
  const redHoverEffect = 'hover:!bg-destructive-red hover:!border-destructive-red hover:!text-off-white hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 dark:hover:!bg-destructive-red dark:hover:!border-destructive-red dark:hover:!text-off-black dark:hover:shadow-brutalist-dark';
  const confirmButtonToneClass =
    confirmTone === 'destructive' || isLogoutButton
      ? `${responsiveButtonClasses} ${redHoverEffect}`
      : responsiveButtonClasses;
  const cancelButtonClasses = `${responsiveButtonClasses} !bg-off-white !text-off-black dark:!bg-off-black dark:!text-off-white`;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirmation-title"
      tabIndex={-1}
      aria-label="Confirmation dialog backdrop"
    >
      <div
        ref={modalRef}
        className="bg-off-white dark:bg-brutal-gray p-8 border-2 border-accent-black dark:border-off-white/50 w-full max-w-md m-4 relative"
        role="document"
      >
        <button
          onClick={onCancel}
          aria-label='Close dialog'
          className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center bg-off-white text-xl font-bold leading-none text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:bg-brutal-gray dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
        >
          ×
        </button>
        <h2 id="confirmation-title" className="text-2xl font-black uppercase font-mono tracking-wider text-off-black dark:text-off-white pr-8">{title}</h2>
        <p className="text-base text-off-black/80 dark:text-off-white/80 mt-4 mb-8">
          {message}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
          <Button
            onClick={onConfirm}
            variant="fill"
            className={confirmButtonToneClass}
          >
            {confirmLabel}
          </Button>
          <Button
            onClick={onCancel}
            variant="default"
            className={cancelButtonClasses}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;
