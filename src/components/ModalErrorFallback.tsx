import React from 'react';
import ErrorDisplay from './ErrorDisplay';

const ModalErrorFallback: React.FC = () => {
  return (
    <div className='fixed inset-0 bg-off-black/30 dark:bg-off-black/50 backdrop-blur-sm flex items-center justify-center z-modal'>
      <div className='bg-off-white dark:bg-brutal-gray p-8 border-2 border-accent-black dark:border-off-white w-full max-w-md m-4 flex flex-col'>
        <ErrorDisplay
          message='Failed to load modal. Please refresh the page.'
          onDismiss={() => window.location.reload()}
        />
        <button
          onClick={() => window.location.reload()}
          className='mt-4 uppercase text-sm font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white transition-colors font-mono self-start'
        >
          [RELOAD PAGE]
        </button>
      </div>
    </div>
  );
};

export default ModalErrorFallback;
