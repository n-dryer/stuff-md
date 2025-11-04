import React from 'react';
import NoteItem from './NoteItem';
import { Note } from '../types';

interface NoteListGridProps {
  notes: Note[];
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  showDelete: boolean;
}

const NoteListGrid: React.FC<NoteListGridProps> = ({
  notes,
  onDeleteNote,
  onEditNote,
  activeTags,
  onTagClick,
  showDelete,
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-12'>
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onDeleteNote={onDeleteNote}
          onEditNote={onEditNote}
          activeTags={activeTags}
          onTagClick={onTagClick}
          allowTagClick={false}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
};

export default NoteListGrid;

