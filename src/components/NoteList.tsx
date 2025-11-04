import React, { useMemo, useState } from 'react';

import { useNoteFilters } from '../hooks/useNoteFilters';
import {
  useNoteSorting,
  type SortKey,
  type SortDirection,
} from '../hooks/useNoteSorting';
import Button from './Button';
import NoteListEmpty from './NoteListEmpty';
import NoteListFilters from './NoteListFilters';
import NoteListGrid from './NoteListGrid';
import NoteListTable from './NoteListTable';
import NoteListHeader from './NoteListHeader';
import NoteListActiveTags from './NoteListActiveTags';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  activeCategory: string;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  onClearTags: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearchQuery: string;
  onFocusNoteInput: () => void;
  onOpenInstructions: () => void;
  onResetFilters: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading,
  activeCategory,
  onDeleteNote,
  onEditNote,
  viewMode,
  setViewMode,
  activeTags,
  onTagClick,
  onClearTags,
  searchQuery,
  setSearchQuery,
  debouncedSearchQuery,
  onFocusNoteInput,
  onOpenInstructions,
  onResetFilters,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const sortMode = useMemo<'recent' | 'oldest' | 'title'>(() => {
    if (sortKey === 'title') {
      return 'title';
    }
    return sortDirection === 'asc' ? 'oldest' : 'recent';
  }, [sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'title' ? 'asc' : 'desc');
    }
  };

  const filteredNotes = useNoteFilters({
    notes,
    activeCategory,
    activeTags,
    debouncedSearchQuery,
    startDate: '',
    endDate: '',
  });

  const sortedNotes = useNoteSorting({
    filteredNotes,
    sortKey,
    sortDirection,
  });
  const hasActiveFilters =
    activeCategory !== 'ALL' ||
    activeTags.length > 0 ||
    debouncedSearchQuery.trim().length > 0;

  if (isLoading) {
    return (
      <div aria-live='polite' className='min-h-[400px]'>
        <div className='animate-pulse space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <div className='h-6 w-28 bg-off-black/10 dark:bg-off-white/10 rounded' />
            <div className='h-8 w-16 bg-off-black/10 dark:bg-off-white/10 rounded' />
          </div>
          <div className='mb-6'>
            <div className='h-12 w-full bg-off-black/10 dark:bg-off-white/10 rounded border-2 border-accent-black/20 dark:border-off-white/20' />
            <div className='mt-4 flex gap-2'>
              <div className='h-8 w-24 bg-off-black/10 dark:bg-off-white/10 rounded' />
              <div className='h-8 w-20 bg-off-black/10 dark:bg-off-white/10 rounded' />
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className='border-2 border-accent-black dark:border-off-white/20 p-4 min-h-[180px]'
              >
                <div className='h-5 w-3/4 bg-off-black/10 dark:bg-off-white/10 mb-3 rounded' />
                <div className='h-16 w-full bg-off-black/10 dark:bg-off-white/10 mb-3 rounded' />
                <div className='flex gap-2 mt-4'>
                  <div className='h-6 w-20 bg-off-black/10 dark:bg-off-white/10 rounded' />
                  <div className='h-6 w-16 bg-off-black/10 dark:bg-off-white/10 rounded' />
                </div>
                <div className='h-4 w-24 bg-off-black/10 dark:bg-off-white/10 mt-3 rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <NoteListEmpty
        onFocusNoteInput={onFocusNoteInput}
        onOpenInstructions={onOpenInstructions}
      />
    );
  }

  return (
    <div>
      <NoteListHeader viewMode={viewMode} setViewMode={setViewMode} />

      <NoteListFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSortOptions={showSortOptions}
        setShowSortOptions={setShowSortOptions}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
              sortMode={sortMode}
              onSortChange={mode => {
                if (mode === 'title') {
                  setSortKey('title');
                  setSortDirection('asc');
                } else {
                  setSortKey('date');
                  setSortDirection(mode === 'recent' ? 'desc' : 'asc');
                }
              }}
            />

      <div className='border-t-2 border-accent-black dark:border-off-white/20 pt-4'>
        <NoteListActiveTags
          activeTags={activeTags}
          onClearTags={onClearTags}
        />

        {sortedNotes.length === 0 ? (
          <section className='relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg border-2 border-accent-black dark:border-off-white/20 bg-off-white/80 p-8 text-center dark:bg-off-black/60 sm:p-10'>
            <div
              aria-hidden='true'
              className='absolute inset-0 pointer-events-none opacity-50 bg-[length:28px_28px] bg-[radial-gradient(circle_at_1px_1px,_rgba(28,28,28,0.08)_1px,_transparent_0)] dark:hidden'
            />
            <div
              aria-hidden='true'
              className='absolute inset-0 hidden pointer-events-none opacity-40 dark:block bg-[length:28px_28px] bg-[radial-gradient(circle_at_1px_1px,_rgba(240,240,240,0.18)_1px,_transparent_0)]'
            />
            <div className='relative mx-auto flex w-full max-w-2xl flex-col items-center gap-4 sm:gap-6'>
              <h3 className='text-xl font-black uppercase tracking-[0.35em] text-accent-black dark:text-off-white sm:text-2xl'>
                No Matches Yet
              </h3>
              <p className='text-sm sm:text-base normal-case tracking-wide text-off-black/70 dark:text-off-white/70'>
                {hasActiveFilters
                  ? 'Nothing fits those filters right now. Clear them to bring all of your notes back into view.'
                  : 'No notes are available just yet. Start typing above to create your first entry.'}
              </p>
              {hasActiveFilters && (
                <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center'>
                  <Button
                    type='button'
                    onClick={onResetFilters}
                    className='w-full sm:w-auto'
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {viewMode === 'grid' && (
              <NoteListGrid
                notes={sortedNotes}
                    onDeleteNote={onDeleteNote}
                    onEditNote={onEditNote}
                    activeTags={activeTags}
                    onTagClick={onTagClick}
                    showDelete={isEditMode}
                  />
            )}

            {viewMode === 'table' && (
              <NoteListTable
                notes={sortedNotes}
                onDeleteNote={onDeleteNote}
                onEditNote={onEditNote}
                activeTags={activeTags}
                onTagClick={onTagClick}
                isEditMode={isEditMode}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NoteList;
