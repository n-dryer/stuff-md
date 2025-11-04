import React from 'react';

interface DateFilterProps {
  sortMode: 'recent' | 'oldest' | 'title';
  onSortChange: (mode: 'recent' | 'oldest' | 'title') => void;
  className?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({ sortMode, onSortChange, className = '' }) => {
  const containerClasses = `flex w-full items-center gap-2 flex-nowrap overflow-x-auto whitespace-nowrap ${className}`.trim();

  const toggleButtonClasses = (mode: 'recent' | 'oldest' | 'title') =>
    `flex-shrink-0 whitespace-nowrap px-3 py-1 uppercase text-xs font-bold tracking-widest border-2 border-accent-black dark:border-off-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
      sortMode === mode
        ? 'bg-accent-black text-off-white dark:bg-off-white dark:text-off-black'
        : 'bg-off-white text-off-black dark:bg-off-black dark:text-off-white hover:bg-accent-black hover:text-off-white dark:hover:bg-off-white dark:hover:text-off-black'
    }`;

  return (
    <div className={containerClasses} role='group' aria-label='Sort notes'>
      <button
        type='button'
        onClick={() => onSortChange('recent')}
        className={toggleButtonClasses('recent')}
      >
        Most Recent
      </button>
      <button
        type='button'
        onClick={() => onSortChange('oldest')}
        className={toggleButtonClasses('oldest')}
      >
        Oldest
      </button>
      <button
        type='button'
        onClick={() => onSortChange('title')}
        className={toggleButtonClasses('title')}
      >
        Title
      </button>
    </div>
  );
};

export default DateFilter;
