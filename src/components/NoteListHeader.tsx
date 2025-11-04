import React from 'react';
import { IconGrid, IconList } from './Icons';
import ViewToggleButton from './ViewToggleButton';
import BrutalistTooltip from './BrutalistTooltip';

interface NoteListHeaderProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

const NoteListHeader: React.FC<NoteListHeaderProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <div className='flex justify-between items-center mb-4'>
      <h2 className='uppercase font-bold text-base tracking-widest'>
        ALL NOTES
      </h2>
      <div className='flex items-center gap-x-2'>
        <BrutalistTooltip text='Grid view' position='top'>
          <ViewToggleButton
            isActive={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
            ariaLabel='Grid view'
          >
            {IconGrid}
          </ViewToggleButton>
        </BrutalistTooltip>
        <BrutalistTooltip text='Table view' position='top'>
          <ViewToggleButton
            isActive={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            ariaLabel='Table view'
          >
            {IconList}
          </ViewToggleButton>
        </BrutalistTooltip>
      </div>
    </div>
  );
};

export default NoteListHeader;

