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
}) => {
  return (
    <div className='w-full overflow-x-auto -mx-4 sm:mx-0'>
      <div className='min-w-full inline-block sm:min-w-0'>
        <table
          className={`w-full text-left table-auto ${
            isEditMode ? 'min-w-[min(100%,28rem)]' : 'min-w-full'
          }`}
        >
          <thead className='border-b-2 border-accent-black dark:border-off-white/20 dark:text-off-white'>
            <tr>
              <th
                scope='col'
                onClick={() => onSort('title')}
                className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(8rem,20vw,12rem)] max-w-[clamp(12rem,40vw,20rem)] sm:min-w-[clamp(10rem,25vw,15rem)] sm:max-w-none text-left font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold cursor-pointer transition-colors hover:bg-off-black/5 dark:hover:bg-off-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black focus-visible:bg-off-black/5 dark:focus-visible:bg-off-white/10'
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
                className='hidden md:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(10rem,25vw,15rem)] max-w-[clamp(15rem,40vw,30rem)] lg:max-w-none font-mono uppercase text-[clamp(0.625rem,1.2vw,0.75rem)] tracking-widest font-bold'
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
              <th
                scope='col'
                className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-right whitespace-nowrap ${
                  isEditMode ? 'min-w-[clamp(5rem,15vw,6rem)]' : ''
                }`}
                aria-hidden='true'
              ></th>
            </tr>
          </thead>
          <tbody>
            {notes.map(note => (
              <tr
                key={note.id}
                className='group border-b border-gray-200 dark:border-off-white/10 cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black transition-colors'
                onClick={() => onEditNote(note)}
                role='button'
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onEditNote(note);
                  }
                }}
                aria-label={`Edit note: ${note.title}`}
              >
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(8rem,20vw,12rem)] max-w-[clamp(12rem,40vw,20rem)] sm:min-w-[clamp(10rem,25vw,15rem)] sm:max-w-none font-mono text-[clamp(0.75rem,1.5vw,0.875rem)] sm:text-[clamp(0.875rem,1.8vw,1rem)] uppercase tracking-wider text-off-black dark:text-off-white truncate align-top whitespace-nowrap overflow-hidden ${
                    isEditMode
                      ? 'max-w-[clamp(8rem,25vw,20rem)] sm:max-w-none'
                      : ''
                  }`}
                >
                  <span className='block truncate'>{note.title}</span>
                </td>
                <td className='hidden md:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(10rem,25vw,15rem)] max-w-[clamp(15rem,40vw,30rem)] lg:max-w-none align-top overflow-hidden'>
                  <div className='max-h-24 overflow-hidden relative font-mono text-[clamp(0.625rem,1.2vw,0.75rem)] leading-relaxed text-off-black/60 dark:text-off-white/60'>
                    <MarkdownRenderer content={note.summary} />
                    <div className='absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-off-white dark:from-off-black to-transparent pointer-events-none transition-opacity duration-150 group-hover:opacity-0'></div>
                  </div>
                </td>
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(6rem,15vw,8rem)] max-w-[clamp(8rem,20vw,12rem)] sm:max-w-none align-top ${
                    isEditMode ? 'hidden sm:table-cell' : ''
                  }`}
                >
                  <div className='flex flex-wrap gap-1'>
                    {(note.tags || []).slice(0, 3).map(tag => (
                      <Tag
                        key={tag}
                        tag={tag}
                        onClick={onTagClick}
                        isActive={activeTags.includes(tag)}
                      />
                    ))}
                  </div>
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
                <td
                  className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-right align-top whitespace-nowrap ${
                    isEditMode ? 'min-w-[clamp(5rem,15vw,6rem)]' : ''
                  }`}
                >
                  {isEditMode ? (
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className='inline-flex items-center justify-center px-[clamp(0.625rem,1.2vw,1rem)] py-[clamp(0.375rem,0.8vw,0.5rem)] whitespace-nowrap uppercase font-bold text-[clamp(0.625rem,1.2vw,1rem)] text-light-gray hover:text-destructive-red dark:text-gray-500 dark:hover:text-destructive-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black transition-colors'
                      aria-label={`Delete note: ${note.title}`}
                    >
                      [DELETE]
                    </button>
                  ) : (
                    <span aria-hidden='true'>&nbsp;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoteListTable;

