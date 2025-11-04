import React from 'react';
import { Note } from '../types';
import Tag from './Tag';
import DateDisplay from './DateDisplay';
import MarkdownRenderer from './MarkdownRenderer';

interface NoteItemProps {
  note: Note;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  allowTagClick?: boolean;
  showDelete?: boolean;
}

const NoteItem: React.FC<NoteItemProps> = React.memo(
  ({
    note,
    onDeleteNote,
    onEditNote,
    activeTags,
    onTagClick,
    allowTagClick = true,
    showDelete = false,
  }) => {
    const uniqueTags = Array.from(new Set(note.tags || []));
    const titleId = `note-${note.id}-title`;
    const summaryId = note.summary ? `note-${note.id}-summary` : undefined;

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteNote(note.id);
    };

    const contentPadding = showDelete ? 'pr-20' : '';

    const handleEnterSpace = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onEditNote(note);
      }
    };

    return (
      <article
        className='relative py-3 sm:py-4 px-3 sm:px-4 border-b border-gray-200 dark:border-off-white/10 break-inside-avoid cursor-pointer transition-colors duration-150 hover:bg-off-black/5 dark:hover:bg-off-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black group'
        role='button'
        tabIndex={0}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        onClick={() => onEditNote(note)}
        onMouseDown={e => (e.currentTarget as HTMLElement).blur()}
        onKeyDown={handleEnterSpace}
      >
        <div className={`flex flex-col gap-2 sm:gap-3 ${contentPadding}`}>
          <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4'>
            <h3
              id={titleId}
              className='font-mono uppercase tracking-wider text-off-black dark:text-off-white px-2 py-1 sm:-mx-2 rounded text-[clamp(1rem,2.6vw,1.1rem)] sm:text-[clamp(1.05rem,2vw,1.2rem)] leading-tight break-words hyphens-auto line-clamp-2'
            >
              {note.title || 'Untitled note'}
            </h3>
            <div className='flex items-center gap-x-2 flex-shrink-0 px-2 py-1 sm:-mx-2 text-xs uppercase text-off-black/60 dark:text-off-white/60 rounded'>
              <DateDisplay date={note.date} />
            </div>
          </div>
          {note.summary && (
            <div
              id={summaryId}
              className='hidden md:block font-mono text-xs leading-relaxed text-off-black/60 dark:text-off-white/60'
            >
              <MarkdownRenderer content={note.summary} />
            </div>
          )}
          {uniqueTags.length > 0 && (
            <div className='flex flex-wrap gap-2 items-center mt-2 sm:mt-0' role='list' aria-label='Note tags'>
              {uniqueTags.map(tag => (
                <Tag
                  key={tag}
                  tag={tag}
                  onClick={allowTagClick ? onTagClick : undefined}
                  isActive={activeTags.includes(tag)}
                />
              ))}
            </div>
          )}
        </div>
        {showDelete && (
          <div className='absolute top-3 right-3 z-10 pointer-events-none'>
            <button
              onClick={handleDeleteClick}
              className='inline-flex items-center justify-center px-3 py-1.5 whitespace-nowrap uppercase text-xs text-light-gray hover:text-destructive-red dark:text-gray-500 dark:hover:text-destructive-red font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black'
              style={{ pointerEvents: 'auto' }}
              aria-label={`Delete note: ${note.title || 'Untitled note'}`}
            >
              [DELETE]
            </button>
          </div>
        )}
      </article>
    );
  }
);

NoteItem.displayName = 'NoteItem';

export default NoteItem;
