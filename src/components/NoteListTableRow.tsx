import React from 'react';
import DateDisplay from './DateDisplay';
import MarkdownRenderer from './MarkdownRenderer';
import Tag from './Tag';
import { Note } from '../types';

interface NoteListTableRowProps {
  note: Note;
  isEditMode: boolean;
  isSelected?: boolean;
  onToggleSelection?: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
}

const NoteListTableRow: React.FC<NoteListTableRowProps> = ({
  note,
  isEditMode,
  isSelected = false,
  onToggleSelection,
  onEditNote,
  activeTags,
  onTagClick,
}) => {
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
      className={`group border-b border-gray-200 dark:border-off-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
        isEditMode
          ? isSelected
            ? 'cursor-pointer bg-accent-black/5 dark:bg-off-white/10'
            : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
          : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
      }`}
      onClick={handleRowClick}
      role={isEditMode ? 'checkbox' : 'button'}
      tabIndex={0}
      aria-checked={isEditMode ? isSelected : undefined}
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
        isEditMode ? `Select note: ${note.title}` : `Edit note: ${note.title}`
      }
    >
      {isEditMode && (
        <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-center align-top'>
          <input
            type='checkbox'
            checked={isSelected}
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
          isEditMode ? 'max-w-[clamp(7rem,20vw,12rem)] sm:max-w-none' : ''
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
              <div className='absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-off-white dark:from-off-black to-transparent pointer-events-none transition-opacity duration-normal group-hover:opacity-0'></div>
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
      </td>
      <td
        className={`px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] min-w-[clamp(5rem,12vw,7rem)] max-w-[clamp(7rem,18vw,9rem)] sm:max-w-none align-top whitespace-nowrap ${
          isEditMode ? 'max-w-[clamp(4rem,12vw,5.5rem)] sm:max-w-none' : ''
        }`}
      >
        <DateDisplay date={note.date} modifiedTime={note.modifiedTime} />
      </td>
    </tr>
  );
};

export default NoteListTableRow;
