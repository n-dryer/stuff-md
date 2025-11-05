import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconSearch } from './Icons';
import BrutalistTooltip from './BrutalistTooltip';
import SortDropdownMenu from './SortDropdownMenu';
import ViewToggle from './ViewToggle';
import { hasOpenModals } from '../utils/modalStack';

interface NoteListFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSortMenuOpen: boolean;
  setIsSortMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode: 'recent' | 'oldest' | 'title';
  onSortChange: (mode: 'recent' | 'oldest' | 'title') => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onDeleteAll: () => void;
  notesCount: number;
}

const NoteListFilters: React.FC<NoteListFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  isSortMenuOpen,
  setIsSortMenuOpen,
  isEditMode,
  setIsEditMode,
  sortMode,
  onSortChange,
  viewMode,
  setViewMode,
  hasActiveFilters,
  onResetFilters,
  onDeleteAll,
  notesCount,
}) => {
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortLabels = useMemo(
    () => ({
      recent: 'Newest First',
      oldest: 'Oldest First',
      title: 'Title A-Z',
    }),
    []
  );
  const currentSortLabel = sortLabels[sortMode];
  const isSortActive = isSortMenuOpen || sortMode !== 'recent';

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const handleSortToggle = useCallback(() => {
    setIsSortMenuOpen(prev => !prev);
  }, [setIsSortMenuOpen]);

  const handleSortMenuClose = useCallback(() => {
    setIsSortMenuOpen(false);
  }, [setIsSortMenuOpen]);

  const handleSortSelect = useCallback(
    (mode: 'recent' | 'oldest' | 'title') => {
      onSortChange(mode);
      setIsSortMenuOpen(false);
    },
    [onSortChange, setIsSortMenuOpen]
  );

  const handleEditToggle = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, [setIsEditMode]);

  const handleViewToggle = useCallback(
    (mode: 'grid' | 'table') => {
      setViewMode(mode);
    },
    [setViewMode]
  );

  useEffect(() => {
    if (!isSortMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        !target ||
        sortMenuRef.current?.contains(target) ||
        sortButtonRef.current?.contains(target)
      ) {
        return;
      }
      if (isSortMenuOpen) setIsSortMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortMenuOpen, setIsSortMenuOpen]);

  useEffect(() => {
    if (!isSortMenuOpen) {
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (hasOpenModals()) {
          return;
        }
        if (isSortMenuOpen) {
          setIsSortMenuOpen(false);
          sortButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isSortMenuOpen, setIsSortMenuOpen]);

  const editModeTooltip = isEditMode ? 'Exit edit mode' : 'Enable edit mode';

  return (
    <div className='mb-6'>
      <div className='flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4'>
        <div className='relative w-full sm:flex-1 min-w-[220px]'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40 dark:text-off-white/40'>
            {IconSearch}
          </div>
          <input
            id='search-notes'
            name='search'
            type='search'
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder='Search by keyword...'
            className='w-full bg-off-white dark:bg-off-black p-3 pl-12 border-2 border-accent-black dark:border-off-white/50 focus:outline-none focus:border-5 focus:p-[9px] focus:pl-[45px] transition-all duration-100 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-base min-h-[44px]'
            aria-label='Search notes'
          />
        </div>

        <div className='flex w-full sm:w-auto flex-wrap items-center justify-between gap-2 sm:gap-3 md:gap-4 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 min-h-[48px]'>
          <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
            <div className='relative flex-shrink-0'>
              <BrutalistTooltip text='Choose sort order' position='top'>
                <button
                  ref={sortButtonRef}
                  type='button'
                  onClick={handleSortToggle}
                  aria-expanded={isSortMenuOpen}
                  aria-haspopup='menu'
                  aria-label={`Sort notes, currently ${currentSortLabel}`}
                  className={`uppercase font-bold text-xs sm:text-sm md:text-base tracking-widest transition-colors px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 min-h-[44px] whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
                    isSortActive
                      ? 'text-accent-black dark:text-off-white'
                      : 'text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white'
                  }`}
                >
                  {`[SORT: ${currentSortLabel.toUpperCase()}]`}
                </button>
              </BrutalistTooltip>
              <SortDropdownMenu
                isOpen={isSortMenuOpen}
                selectedSort={sortMode}
                onSelect={handleSortSelect}
                onRequestClose={handleSortMenuClose}
                menuRef={sortMenuRef}
              />
            </div>

            <div className='flex-shrink-0'>
              <ViewToggle viewMode={viewMode} onToggle={handleViewToggle} />
            </div>
          </div>

          <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
            <div className='relative flex-shrink-0'>
              <BrutalistTooltip text={editModeTooltip} position='top'>
                <button
                  type='button'
                  onClick={handleEditToggle}
                  aria-pressed={isEditMode}
                  className={`flex-shrink-0 whitespace-nowrap uppercase font-bold text-xs sm:text-sm md:text-base transition-colors px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
                    isEditMode
                      ? 'text-accent-black dark:text-off-white'
                      : 'text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white'
                  }`}
                >
                  {isEditMode ? '[DONE]' : '[EDIT]'}
                </button>
              </BrutalistTooltip>
            </div>

            {hasActiveFilters && (
              <button
                type='button'
                onClick={onResetFilters}
                className='flex-shrink-0 whitespace-nowrap uppercase font-bold text-xs sm:text-sm md:text-base transition-colors px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 min-h-[44px] text-destructive-red hover:text-accent-black dark:text-destructive-red/90 dark:hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black'
              >
                [CLEAR FILTERS]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteListFilters;
