import React from 'react';
import NoteItem from './NoteItem';
import { Note } from '../types';

interface NoteListGridProps {
  notes: Note[];
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  isEditMode?: boolean;
  isSelected?: (id: string) => boolean;
  onToggleSelection?: (noteId: string) => void;
}

const NoteListGrid: React.FC<NoteListGridProps> = ({
  notes,
  onDeleteNote,
  onEditNote,
  activeTags,
  onTagClick,
  isEditMode = false,
  isSelected,
  onToggleSelection,
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-12'>
      {notes.map(note => {
        const selected = isSelected ? isSelected(note.id) : false;
        return (
          <NoteItem
            key={note.id}
            note={note}
            onDeleteNote={onDeleteNote}
            onEditNote={onEditNote}
            activeTags={activeTags}
            onTagClick={onTagClick}
            allowTagClick={false}
            isEditMode={isEditMode}
            isSelected={selected}
            onToggleSelection={onToggleSelection}
          />
        );
      })}
    </div>
  );
};

export default NoteListGrid;
