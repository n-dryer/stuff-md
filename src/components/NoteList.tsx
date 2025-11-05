import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useNoteFilters } from '../hooks/useNoteFilters';
import {
  useNoteSorting,
  type SortKey,
  type SortDirection,
} from '../hooks/useNoteSorting';
import { useNoteSelection } from '../hooks/useNoteSelection';
import Button from './Button';
import NoteListEmpty from './NoteListEmpty';
import NoteListFilters from './NoteListFilters';
import NoteListGrid from './NoteListGrid';
import NoteListTable from './NoteListTable';
import NoteListHeader from './NoteListHeader';
import NoteListActiveTags from './NoteListActiveTags';
import BulkActionBar from './BulkActionBar';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  activeCategory: string;
  onDeleteNote: (noteId: string) => void;
  onDeleteNotes: (noteIds: string[]) => void;
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
  onOpenHelp: () => void;
  onResetFilters: () => void;
  onDeleteAll: () => void;
  isDeleting?: boolean;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading,
  activeCategory,
  onDeleteNote,
  onDeleteNotes,
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
  onOpenHelp,
  onResetFilters,
  onDeleteAll,
  isDeleting = false,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    selectedCount,
    hasSelection,
  } = useNoteSelection();

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

  const handleSortModeChange = useCallback(
    (mode: 'recent' | 'oldest' | 'title') => {
      if (mode === 'title') {
        setSortKey('title');
        setSortDirection('asc');
        return;
      }
      setSortKey('date');
      setSortDirection(mode === 'recent' ? 'desc' : 'asc');
    },
    []
  );

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

  // Reset selection when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      deselectAll();
    }
  }, [isEditMode, deselectAll]);

  const handleSelectAll = useCallback(() => {
    const allIds = sortedNotes.map(note => note.id);
    selectAll(allIds);
  }, [sortedNotes, selectAll]);

  const handleDeleteSelected = useCallback(() => {
    if (hasSelection && onDeleteNotes && selectedCount > 0) {
      const idsArray = Array.from(selectedIds);
      if (idsArray.length > 0) {
        onDeleteNotes(idsArray);
        // Don't deselect here - wait for confirmation
      }
    }
  }, [hasSelection, selectedCount, selectedIds, onDeleteNotes]);

  const allSelected = useMemo(() => {
    return sortedNotes.length > 0 && selectedCount === sortedNotes.length;
  }, [sortedNotes.length, selectedCount]);

  if (isLoading) {
    return (
      <div aria-live='polite' className='min-h-[400px]'>
        <div className='space-y-[clamp(1rem,2.5vw,1.5rem)]'>
          {/* Header skeleton */}
          <div className='flex justify-between items-center mb-[clamp(1rem,2.5vw,1.5rem)]'>
            <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(6rem,15vw,7rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
            <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(3.5rem,9vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
          </div>
          {/* Filters skeleton */}
          <div className='mb-[clamp(1.25rem,3vw,1.5rem)]'>
            <div className='h-[clamp(2.5rem,6vw,3rem)] w-full bg-off-black/10 dark:bg-off-white/10 border-2 border-accent-black/20 dark:border-off-white/20 brutalist-pulse' />
            <div className='mt-[clamp(0.75rem,2vw,1rem)] flex gap-[clamp(0.5rem,1.5vw,0.75rem)]'>
              <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
              <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
            </div>
          </div>
          {/* Conditional skeleton based on viewMode */}
          {viewMode === 'grid' ? (
            /* Grid view skeleton */
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-[clamp(2rem,5vw,3rem)] gap-y-[clamp(1rem,2.5vw,1.5rem)]'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className='border-2 border-accent-black dark:border-off-white/20 shadow-brutalist dark:shadow-brutalist-dark p-[clamp(0.75rem,2vw,1rem)] min-h-[clamp(11rem,28vw,13rem)]'
                >
                  {/* Title skeleton */}
                  <div className='h-[clamp(1.125rem,2.8vw,1.25rem)] w-3/4 bg-off-black/10 dark:bg-off-white/10 mb-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
                  {/* Content skeleton */}
                  <div className='h-[clamp(3.5rem,9vw,4rem)] w-full bg-off-black/10 dark:bg-off-white/10 mb-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
                  {/* Tags skeleton */}
                  <div className='flex gap-[clamp(0.5rem,1.5vw,0.75rem)] mt-[clamp(0.75rem,2vw,1rem)]'>
                    <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(4.5rem,11vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(3.5rem,9vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </div>
                  {/* Date skeleton */}
                  <div className='h-[clamp(0.875rem,2.2vw,1rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 mt-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
                </div>
              ))}
            </div>
          ) : (
            /* Table view skeleton */
            <div className='w-full'>
              <table className='w-full text-left table-auto'>
                <thead className='border-b-2 border-accent-black dark:border-off-white/20'>
                  <tr>
                    <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(3rem,8vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </th>
                    <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </th>
                    <th className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(8rem,20vw,10rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </th>
                    <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </th>
                    <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className='border-b border-gray-200 dark:border-off-white/10'>
                      <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                        <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse mx-auto' />
                      </td>
                      <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                        <div className='h-[clamp(1rem,2.5vw,1.25rem)] w-[clamp(6rem,15vw,8rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                      </td>
                      <td className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                        <div className='h-[clamp(3rem,7.5vw,3.5rem)] w-full bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                      </td>
                      <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                        <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                      </td>
                      <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                        <div className='h-[clamp(0.875rem,2.2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <NoteListEmpty
        onFocusNoteInput={onFocusNoteInput}
        onOpenHelp={onOpenHelp}
      />
    );
  }

  return (
    <div>
      <NoteListHeader />

      <NoteListFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSortMenuOpen={isSortMenuOpen}
        setIsSortMenuOpen={setIsSortMenuOpen}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        sortMode={sortMode}
        onSortChange={handleSortModeChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        onDeleteAll={onDeleteAll}
        notesCount={sortedNotes.length}
      />

      <div className='border-t-2 border-accent-black dark:border-off-white/20 pt-4'>
        <NoteListActiveTags activeTags={activeTags} onClearTags={onClearTags} />

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
                isEditMode={isEditMode}
                isSelected={isSelected}
                onToggleSelection={toggleSelection}
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
                isSelected={isSelected}
                onToggleSelection={toggleSelection}
              />
            )}
          </>
        )}
        <BulkActionBar
          selectedCount={selectedCount}
          totalCount={sortedNotes.length}
          onDeleteSelected={handleDeleteSelected}
          onDeleteAll={onDeleteAll}
          onSelectAll={handleSelectAll}
          onDeselectAll={deselectAll}
          allSelected={allSelected}
          isEditMode={isEditMode}
          isDeleting={isDeleting}
          setIsEditMode={setIsEditMode}
        />
      </div>
    </div>
  );
};

export default NoteList;
