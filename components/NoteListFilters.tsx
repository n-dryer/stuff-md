import React from 'react';
import { IconSearch } from './Icons';
import DateFilter from './DateFilter';
import BrutalistTooltip from './BrutalistTooltip';

interface NoteListFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSortOptions: boolean;
  setShowSortOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode: 'recent' | 'oldest' | 'title';
  onSortChange: (mode: 'recent' | 'oldest' | 'title') => void;
}

const NoteListFilters: React.FC<NoteListFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  showSortOptions,
  setShowSortOptions,
  isEditMode,
  setIsEditMode,
  sortMode,
  onSortChange,
}) => {
  return (
    <div className='mb-6'>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40 dark:text-off-white/40'>
          {IconSearch}
        </div>
        <input
          id='search-notes'
          name='search'
          type='search'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Search by keyword...'
          className='w-full bg-off-white dark:bg-off-black p-3 pl-12 border-2 border-accent-black dark:border-off-white/50 focus:outline-none focus:border-5 focus:p-[9px] focus:pl-[45px] transition-all duration-100 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-base'
          aria-label='Search notes'
        />
      </div>

      <div className='mt-4 flex flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4 overflow-x-auto whitespace-nowrap min-w-max text-xs sm:text-sm md:text-base'>
        <BrutalistTooltip text='Show/hide filter options' position='top'>
          <button
            type='button'
            onClick={() => setShowSortOptions(prev => !prev)}
            aria-expanded={showSortOptions}
            className={`flex-shrink-0 whitespace-nowrap uppercase font-bold text-xs sm:text-sm md:text-base tracking-widest transition-colors px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
              showSortOptions
                ? 'text-accent-black dark:text-off-white'
                : 'text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white'
            }`}
          >
            {showSortOptions ? '[HIDE SORT]' : '[SORT]'}
          </button>
        </BrutalistTooltip>
        <BrutalistTooltip text='Toggle edit mode' position='top'>
          <button
            type='button'
            onClick={() => setIsEditMode(prev => !prev)}
            aria-pressed={isEditMode}
            className={`flex-shrink-0 whitespace-nowrap text-right uppercase font-bold text-xs sm:text-sm md:text-base transition-colors px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
              isEditMode
                ? 'text-accent-black dark:text-off-white'
                : 'text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white'
            }`}
          >
            {isEditMode ? '[DONE]' : '[EDIT]'}
          </button>
        </BrutalistTooltip>
      </div>
      {showSortOptions && (
        <div className='mt-3'>
          <DateFilter
            sortMode={sortMode}
            onSortChange={onSortChange}
            className='w-full'
          />
        </div>
      )}
    </div>
  );
};

export default NoteListFilters;
