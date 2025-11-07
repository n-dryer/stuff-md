import React from 'react';
import BrutalistSpinner from './BrutalistSpinner';

const ModalLoadingFallback: React.FC = () => {
  return (
    <div
      className='fixed inset-0 z-modal flex items-center justify-center bg-off-white/80 dark:bg-off-black/80 backdrop-blur-sm'
      aria-live='polite'
      role='status'
    >
      <div className='bg-off-white dark:bg-brutal-gray p-[clamp(1.5rem,4vw,2rem)] min-w-[clamp(12rem,30vw,16rem)] max-w-[90vw] flex flex-col items-center justify-center gap-[clamp(0.75rem,2vw,1rem)]'>
        <BrutalistSpinner />
        <p className='font-mono uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-wider text-accent-black dark:text-off-white text-center'>
          LOADING...
        </p>
      </div>
    </div>
  );
};

export default ModalLoadingFallback;
