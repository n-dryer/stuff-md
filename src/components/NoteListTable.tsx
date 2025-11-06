import React from 'react';
import { Note } from '../types';
import NoteListTableRow from './NoteListTableRow';
import type { SortKey, SortDirection } from '../hooks/useNoteSorting';

interface NoteListTableProps {
  notes: Note[];
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  isEditMode: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  isSelected?: (id: string) => boolean;
  onToggleSelection?: (noteId: string) => void;
}

const NoteListTable: React.FC<NoteListTableProps> = ({
  notes,
  onDeleteNote: _onDeleteNote,
  onEditNote,
  activeTags,
  onTagClick,
  isEditMode,
  sortKey,
  sortDirection,
  onSort,
  isSelected,
  onToggleSelection,
}) => {
  return (
    <div className='w-full'>
      <table className='w-full text-left table-auto'>
        <thead className='border-b-2 border-accent-black dark:border-off-white/20 dark:text-off-white'>
          <tr>
            {isEditMode && (
              <th
                scope='col'
                className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] w-[clamp(3rem,8vw,4rem)] text-center font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold'
                aria-label='Select'
              >
                <span className='sr-only'>Select</span>
              </th>
            )}
            <th
              scope='col'
              onClick={() => onSort('title')}
              className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(5rem,12vw,7rem)] max-w-[clamp(7rem,18vw,9rem)] sm:min-w-[clamp(6rem,14vw,8rem)] sm:max-w-none text-left font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold cursor-pointer transition-colors hover:bg-off-black/5 dark:hover:bg-off-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black focus-visible:bg-off-black/5 dark:focus-visible:bg-off-white/10'
              role='columnheader'
              aria-sort={
                sortKey === 'title'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSort('title');
                }
              }}
            >
              <span className='flex items-center gap-1'>
                Title
                {sortKey === 'title' && (
                  <>
                    <span aria-hidden='true'>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                    <span className='sr-only'>
                      Sorted{' '}
                      {sortDirection === 'asc' ? 'ascending' : 'descending'}
                    </span>
                  </>
                )}
              </span>
            </th>
            <th
              scope='col'
              className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(12rem,30vw,18rem)] max-w-none font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold'
            >
              Summary
            </th>
            <th
              scope='col'
              className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(6rem,15vw,8rem)] max-w-[clamp(8rem,20vw,12rem)] sm:max-w-none font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold ${
                isEditMode ? 'hidden sm:table-cell' : ''
              }`}
            >
              Tags
            </th>
            <th
              scope='col'
              onClick={() => onSort('date')}
              className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(5rem,12vw,7rem)] max-w-[clamp(7rem,18vw,9rem)] sm:max-w-none text-left font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold whitespace-nowrap cursor-pointer transition-colors hover:bg-off-black/5 dark:hover:bg-off-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black focus-visible:bg-off-black/5 dark:focus-visible:bg-off-white/10'
              role='columnheader'
              aria-sort={
                sortKey === 'date'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSort('date');
                }
              }}
            >
              <span className='flex items-center gap-1'>
                Date
                {sortKey === 'date' && (
                  <>
                    <span aria-hidden='true'>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                    <span className='sr-only'>
                      Sorted{' '}
                      {sortDirection === 'asc' ? 'ascending' : 'descending'}
                    </span>
                  </>
                )}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {notes.map(note => (
            <NoteListTableRow
              key={note.id}
              note={note}
              isEditMode={isEditMode}
              isSelected={isSelected ? isSelected(note.id) : false}
              onToggleSelection={onToggleSelection}
              onEditNote={onEditNote}
              activeTags={activeTags}
              onTagClick={onTagClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NoteListTable;
