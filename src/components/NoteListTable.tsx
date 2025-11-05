import React from 'react';
import DateDisplay from './DateDisplay';
import MarkdownRenderer from './MarkdownRenderer';
import Tag from './Tag';
import { Note } from '../types';
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
  onDeleteNote,
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
          {notes.map(note => {
            const selected = isSelected ? isSelected(note.id) : false;
            
            const handleRowClick = (e: React.MouseEvent) => {
              // Don't toggle if clicking on checkbox or other interactive elements
              const target = e.target as HTMLElement;
              if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                return;
              }
              
              if (isEditMode && onToggleSelection) {
                onToggleSelection(note.id);
              } else if (!isEditMode) {
                onEditNote(note);
              }
            };
            
            return (
              <tr
                key={note.id}
                className={`group border-b border-gray-200 dark:border-off-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
                  isEditMode
                    ? selected
                      ? 'cursor-pointer bg-accent-black/5 dark:bg-off-white/10'
                      : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
                    : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
                }`}
                onClick={handleRowClick}
                role={isEditMode ? 'checkbox' : 'button'}
                tabIndex={0}
                aria-checked={isEditMode ? selected : undefined}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (isEditMode && onToggleSelection) {
                      onToggleSelection(note.id);
                    } else {
                      onEditNote(note);
                    }
                  }
                }}
                aria-label={
                  isEditMode
                    ? `Select note: ${note.title}`
                    : `Edit note: ${note.title}`
                }
              >
                {isEditMode && (
                  <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-center align-top'>
                    <input
                      type='checkbox'
                      checked={selected}
                      onChange={e => {
                        e.stopPropagation();
                        if (onToggleSelection) {
                          onToggleSelection(note.id);
                        }
                      }}
                      onClick={e => e.stopPropagation()}
                      className='w-5 h-5 sm:w-6 sm:h-6 cursor-pointer accent-accent-black dark:accent-off-white border-2 border-accent-black dark:border-off-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black'
                      aria-label={`Select note: ${note.title}`}
                    />
                  </td>
                )}
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(5rem,12vw,7rem)] max-w-[clamp(7rem,18vw,9rem)] sm:min-w-[clamp(6rem,14vw,8rem)] sm:max-w-none font-mono text-[clamp(0.75rem,1.5vw,0.875rem)] sm:text-[clamp(0.875rem,1.8vw,1rem)] uppercase tracking-wider text-off-black dark:text-off-white truncate align-top whitespace-nowrap overflow-hidden ${
                    isEditMode
                      ? 'max-w-[clamp(7rem,20vw,12rem)] sm:max-w-none'
                      : ''
                  }`}
                >
                  <span className='block truncate' title={note.title}>
                    {note.title && note.title.length > 50
                      ? note.title.slice(0, 50) + '...'
                      : note.title}
                  </span>
                </td>
                <td className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(12rem,30vw,18rem)] max-w-none align-top overflow-hidden'>
                  <div className='max-h-24 overflow-hidden relative font-mono text-[clamp(0.625rem,1.2vw,0.75rem)] leading-relaxed text-off-black/60 dark:text-off-white/60'>
                    {note.summary &&
                    note.summary.trim() &&
                    note.summary !== 'Summary not available' &&
                    note.summary !== 'Processing...' ? (
                      <>
                        <MarkdownRenderer content={note.summary} />
                        <div className='absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-off-white dark:from-off-black to-transparent pointer-events-none transition-opacity duration-150 group-hover:opacity-0'></div>
                      </>
                    ) : (
                      <span className='text-off-black/40 dark:text-off-white/40 uppercase tracking-wider'>
                        Summary not available
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(6rem,15vw,8rem)] max-w-[clamp(8rem,20vw,12rem)] sm:max-w-none align-top ${
                    isEditMode ? 'hidden sm:table-cell' : ''
                  }`}
                >
                  {note.tags && note.tags.length > 0 ? (
                    <div className='flex flex-wrap gap-1'>
                      {note.tags.slice(0, 3).map(tag => (
                        <Tag
                          key={tag}
                          tag={tag}
                          onClick={onTagClick}
                          isActive={activeTags.includes(tag)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className='font-mono text-[clamp(0.625rem,1.2vw,0.75rem)] text-off-black/40 dark:text-off-white/40 uppercase tracking-wider'>
                      Tags not yet generated
                    </span>
                  )}
                </td>
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(5rem,12vw,7rem)] max-w-[clamp(7rem,18vw,9rem)] sm:max-w-none align-top whitespace-nowrap ${
                    isEditMode
                      ? 'max-w-[clamp(4rem,12vw,5.5rem)] sm:max-w-none'
                      : ''
                  }`}
                >
                  <DateDisplay date={note.date} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NoteListTable;
