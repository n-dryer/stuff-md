import React from 'react';
import Button from './Button';
import BrutalistSpinner from './BrutalistSpinner';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
  isEditMode: boolean;
  isDeleting?: boolean;
  setIsEditMode: (value: boolean) => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onDeleteAll,
  onSelectAll,
  onDeselectAll,
  allSelected,
  isEditMode,
  isDeleting = false,
  setIsEditMode,
}) => {
  if (!isEditMode) {
    return null;
  }

  return (
    <div className='sticky bottom-0 left-0 right-0 z-bulk-action bg-off-white dark:bg-brutal-gray border-t-2 border-accent-black dark:border-off-white/40 shadow-bulk-action dark:shadow-bulk-action-dark'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
          <div className='flex items-center gap-3 sm:gap-4 flex-wrap'>
            <div className='font-mono uppercase text-xs sm:text-sm tracking-wider text-off-black dark:text-off-white'>
              {selectedCount > 0 ? (
                <span>
                  {selectedCount} of {totalCount} selected
                </span>
              ) : (
                <span>No items selected</span>
              )}
            </div>
            {totalCount > 0 && (
              <button
                type='button'
                onClick={allSelected ? onDeselectAll : onSelectAll}
                className='uppercase font-mono font-bold text-xs sm:text-sm tracking-wider text-accent-black dark:text-off-white hover:text-destructive-red dark:hover:text-destructive-red transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black min-h-min-touch-target px-3 sm:px-4 py-2'
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? '[DESELECT ALL]' : '[SELECT ALL]'}
              </button>
            )}
            <button
              type='button'
              onClick={() => setIsEditMode(false)}
              className='uppercase font-mono font-bold text-xs sm:text-sm tracking-wider text-off-black/70 hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black min-h-min-touch-target px-3 sm:px-4 py-2'
              aria-label='Cancel edit mode'
            >
              [CANCEL]
            </button>
          </div>
          <div className='flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto'>
            {selectedCount > 0 && (
              <Button
                type='button'
                onClick={onDeleteSelected}
                variant='fill'
                disabled={isDeleting}
                aria-disabled={isDeleting}
                className='!text-xs sm:!text-sm md:!text-base !px-3 sm:!px-4 md:!px-6 !py-1.5 sm:!py-2 md:!py-3 whitespace-nowrap w-full sm:w-auto !bg-accent-black !text-off-white dark:!bg-off-white dark:!text-off-black hover:!bg-destructive-red hover:!border-destructive-red hover:!text-off-white hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 dark:hover:!bg-destructive-red dark:hover:!border-destructive-red dark:hover:!text-off-black dark:hover:shadow-brutalist-dark'
              >
                Delete Selected ({selectedCount})
              </Button>
            )}
            {totalCount > 0 && (
              <button
                type='button'
                onClick={onDeleteAll}
                disabled={isDeleting}
                aria-disabled={isDeleting}
                className='uppercase font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider text-destructive-red hover:text-accent-black dark:text-destructive-red/90 dark:hover:text-off-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black min-h-min-touch-target px-3 sm:px-4 md:px-6 py-2 whitespace-nowrap w-full sm:w-auto border-2 border-destructive-red bg-off-white dark:bg-brutal-gray hover:border-5 dark:border-destructive-red/90 dark:hover:border-destructive-red disabled:opacity-60 disabled:cursor-not-allowed'
              >
                Delete All
              </button>
            )}
            {isDeleting && (
              <div className='flex items-center'>
                <BrutalistSpinner />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
