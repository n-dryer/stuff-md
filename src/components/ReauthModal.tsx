import React, { useEffect, useRef } from 'react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import Button from './Button';

interface ReauthModalProps {
  isOpen: boolean;
  onReconnect: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const ReauthModal: React.FC<ReauthModalProps> = React.memo(({
  isOpen,
  onReconnect,
  onLogout,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleBackdropClick, handleBackdropKeyDown } = useModalInteraction({
    isOpen,
    onClose,
    modalRef,
  });

  useEffect(() => {
    if (isOpen) {
      const reconnectButton = modalRef.current?.querySelector('button');
      (reconnectButton as HTMLElement)?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby="reauth-title"
      tabIndex={-1}
      aria-label="Reauth dialog backdrop"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={modalRef}
        className="bg-off-white dark:bg-brutal-gray p-8 border-2 border-accent-black dark:border-off-white/50 w-full max-w-md m-4 relative"
        onClick={event => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label='Close dialog'
          className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center bg-off-white text-xl font-bold leading-none text-accent-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-2 focus-visible:ring-offset-off-white hover:bg-accent-black hover:text-off-white dark:bg-brutal-gray dark:text-off-white dark:focus-visible:ring-off-white dark:hover:bg-off-white dark:hover:text-off-black'
        >
          ×
        </button>
        <h2 id="reauth-title" className="text-2xl font-black uppercase font-mono tracking-wider text-off-black dark:text-off-white pr-8">SESSION EXPIRED</h2>
        <p className="text-base text-off-black/80 dark:text-off-white/80 mt-4 mb-8">
          Your connection to Google Drive has expired. Please reconnect to continue using the application.
        </p>
        <div className="flex items-center gap-x-4">
          <Button
            onClick={onReconnect}
            variant="fill"
          >
            Reconnect
          </Button>
          <Button onClick={onLogout} variant="default">
            [LOGOUT]
          </Button>
        </div>
      </div>
    </div>
  );
});

ReauthModal.displayName = 'ReauthModal';

export default ReauthModal;
