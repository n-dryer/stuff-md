import React from 'react';

interface DateFilterProps {
  sortMode: 'recent' | 'oldest' | 'title';
  onSortChange: (mode: 'recent' | 'oldest' | 'title') => void;
  className?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  sortMode,
  onSortChange,
  className = '',
}) => {
  const options = [
    { label: 'MOST RECENT', value: 'recent' as const },
    { label: 'OLDEST', value: 'oldest' as const },
    { label: 'TITLE', value: 'title' as const },
  ];

  return (
    <div
      role='radiogroup'
      aria-label='Sort notes'
      className={`inline-flex w-full border-2 border-accent-black dark:border-off-white overflow-hidden ${className}`.trim()}
    >
      {options.map((option, index) => {
        const isActive = sortMode === option.value;
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={isActive}
            onClick={() => onSortChange(option.value)}
            className={`flex-1 px-2 sm:px-3 md:px-4 py-2 min-h-min-touch-target font-mono text-xs sm:text-sm uppercase tracking-widest cursor-pointer transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
              index !== options.length - 1
                ? 'border-r-2 border-accent-black dark:border-off-white'
                : ''
            } ${
              isActive
                ? 'bg-accent-black text-off-white dark:bg-off-white dark:text-off-black hover:bg-accent-black/90 dark:hover:bg-off-white/90'
                : 'bg-off-white text-off-black dark:bg-brutal-gray dark:text-off-white hover:bg-accent-black/10 hover:text-accent-black dark:hover:bg-off-white/10 dark:hover:text-off-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DateFilter;
