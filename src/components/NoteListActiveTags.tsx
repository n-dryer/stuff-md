import React from 'react';
import Tag from './Tag';

interface NoteListActiveTagsProps {
  activeTags: string[];
  onClearTags: () => void;
}

const NoteListActiveTags: React.FC<NoteListActiveTagsProps> = ({
  activeTags,
  onClearTags,
}) => {
  if (activeTags.length === 0) return null;

  return (
    <div className='flex items-center flex-wrap gap-2 mb-4'>
      <span className='text-sm font-mono uppercase text-off-black/60 dark:text-off-white/60'>
        Filtering by:
      </span>
      {activeTags.map(tag => (
        <Tag key={tag} tag={tag} isActive={true} />
      ))}
      <button
        onClick={onClearTags}
        className='uppercase text-xs text-light-gray hover:text-destructive-red dark:text-gray-500 dark:hover:text-destructive-red font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black focus-visible:bg-off-black/10 dark:focus-visible:bg-off-white/15'
      >
        [CLEAR]
      </button>
    </div>
  );
};

export default NoteListActiveTags;
