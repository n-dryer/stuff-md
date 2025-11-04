import React from 'react';

import BrutalistTooltip from './BrutalistTooltip';

interface ErrorDisplayProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Brutalist-styled error display component
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onDismiss,
  onRetry,
  className = '',
}) => (
  <div
    className={`border-2 border-destructive-red bg-off-white dark:bg-off-black p-4 ${className}`}
    role='alert'
    aria-live='assertive'
  >
    <div className='flex items-start justify-between gap-4'>
      <div className='flex-1'>
        <h3 className='font-bold font-mono uppercase text-destructive-red mb-2'>
          Error
        </h3>
        <p className='text-sm text-off-black/80 dark:text-off-white/80'>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className='mt-3 uppercase text-xs font-bold text-destructive-red hover:text-destructive-red/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive-red focus-visible:ring-offset-2 dark:text-destructive-red dark:hover:text-destructive-red/80'
            aria-label='Retry operation'
          >
            [Retry]
          </button>
        )}
      </div>
      {onDismiss && (
        <BrutalistTooltip text='Dismiss' position='left'>
          <button
            onClick={onDismiss}
            aria-label='Dismiss error'
            className='uppercase text-xs font-bold text-light-gray transition-colors hover:text-destructive-red focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive-red focus-visible:ring-offset-2 dark:text-gray-500 dark:hover:text-destructive-red'
          >
            [×]
          </button>
        </BrutalistTooltip>
      )}
    </div>
  </div>
);

export default ErrorDisplay;
