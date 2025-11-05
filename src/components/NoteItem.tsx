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
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (noteId: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
    note,
    onDeleteNote: _onDeleteNote,
    onEditNote,
    activeTags,
    onTagClick,
    allowTagClick = true,
    isEditMode = false,
    isSelected = false,
    onToggleSelection,
  }) => {
    const uniqueTags = Array.from(new Set(note.tags || []));
    const titleId = `note-${note.id}-title`;
    const isProcessing = note.summary === 'Processing...';
    const hasSummary =
      note.summary &&
      note.summary.trim() &&
      note.summary !== 'Summary not available' &&
      !isProcessing;
    const summaryId =
      hasSummary || note.content ? `note-${note.id}-summary` : undefined;

    const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (onToggleSelection) {
        onToggleSelection(note.id);
      }
    };

    const handleEnterSpace = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isEditMode && onToggleSelection) {
          onToggleSelection(note.id);
        } else {
          onEditNote(note);
        }
      }
    };

    const handleNoteClick = (e: React.MouseEvent) => {
      // Don't toggle if clicking on checkbox or other interactive elements
      const target = e.target as HTMLElement;
      if (
        target.closest('input[type="checkbox"]') ||
        target.closest('button')
      ) {
        return;
      }

      if (isEditMode && onToggleSelection) {
        onToggleSelection(note.id);
      } else if (!isEditMode) {
        onEditNote(note);
      }
    };

    const contentPadding = isEditMode ? 'pl-12' : '';

    return (
      <div
        className={`relative py-3 sm:py-4 px-3 sm:px-4 border-b border-gray-200 dark:border-off-white/10 break-inside-avoid transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black group ${
          isEditMode
            ? isSelected
              ? 'cursor-pointer bg-accent-black/5 dark:bg-off-white/10'
              : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
            : 'cursor-pointer hover:bg-off-black/5 dark:hover:bg-off-white/10'
        }`}
        role={isEditMode ? 'checkbox' : 'button'}
        tabIndex={0}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        aria-checked={isEditMode ? isSelected : undefined}
        onClick={handleNoteClick}
        onMouseDown={e => {
          if (!isEditMode) {
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        onKeyDown={handleEnterSpace}
      >
        {isEditMode && (
          <div className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none'>
            <input
              type='checkbox'
              checked={isSelected}
              onChange={handleCheckboxClick}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              className='w-5 h-5 sm:w-6 sm:h-6 cursor-pointer accent-accent-black dark:accent-off-white border-2 border-accent-black dark:border-off-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black pointer-events-auto'
              aria-label={`Select note: ${note.title || 'Untitled note'}`}
              aria-describedby={titleId}
            />
          </div>
        )}
        <div className={`flex flex-col gap-2 sm:gap-3 ${contentPadding}`}>
          <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <h3
                id={titleId}
                className='font-mono uppercase tracking-wider text-off-black dark:text-off-white px-2 py-1 sm:-mx-2 rounded text-[clamp(1rem,2.6vw,1.1rem)] sm:text-[clamp(1.05rem,2vw,1.2rem)] leading-tight break-words hyphens-auto line-clamp-2'
                title={note.title || 'Untitled note'}
              >
                {(() => {
                  const title = note.title || 'Untitled note';
                  return title.length > 50 ? title.slice(0, 50) + '...' : title;
                })()}
              </h3>
            </div>
            <div className='flex items-center gap-x-2 flex-shrink-0 px-2 py-1 sm:-mx-2 text-xs uppercase text-off-black/60 dark:text-off-white/60 rounded'>
              <DateDisplay date={note.date} />
            </div>
          </div>
          {hasSummary ? (
            <div
              id={summaryId}
              className='hidden md:block font-mono text-xs leading-relaxed text-off-black/60 dark:text-off-white/60'
            >
              <MarkdownRenderer content={note.summary} />
            </div>
          ) : (
            <div
              id={summaryId}
              className='hidden md:block font-mono text-xs leading-relaxed text-off-black/60 dark:text-off-white/60 line-clamp-4'
            >
              <MarkdownRenderer
                content={
                  note.content.length > 300
                    ? note.content.slice(0, 300).trim() + '...'
                    : note.content
                }
              />
            </div>
          )}
          {uniqueTags.length > 0 && (
            <div
              className='flex flex-wrap gap-2 items-center mt-2 sm:mt-0'
              role='list'
              aria-label='Note tags'
            >
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
      </div>
    );
  };

NoteItem.displayName = 'NoteItem';

export default React.memo(NoteItem);
