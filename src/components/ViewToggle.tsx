import React, { useCallback } from 'react';
import BrutalistTooltip from './BrutalistTooltip';

interface ViewToggleProps {
  viewMode: 'grid' | 'table';
  onToggle: (mode: 'grid' | 'table') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
  const isGrid = viewMode === 'grid';
  const label = isGrid ? 'GRID' : 'LIST';
  const ariaLabel = isGrid ? 'Switch to list view' : 'Switch to grid view';

  const handleClick = useCallback(() => {
    const nextMode: 'grid' | 'table' = isGrid ? 'table' : 'grid';
    onToggle(nextMode);
  }, [isGrid, onToggle]);

  return (
    <BrutalistTooltip text={ariaLabel} position='top'>
      <button
        type='button'
        onClick={handleClick}
        aria-label={ariaLabel}
        role='switch'
        aria-checked={isGrid}
        className='inline-flex items-center justify-center uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 whitespace-nowrap min-h-min-touch-target'
      >
        [{label}]
      </button>
    </BrutalistTooltip>
  );
};

export default ViewToggle;
