import React from 'react';
import NoteInput from './NoteInput';

interface NoteInputSectionProps {
  isSidebarCollapsed: boolean;
  noteInputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isSaving: boolean;
  onRequestClearOrBlur: () => void;
  onDraftSaved?: () => void;
}

const NoteInputSection: React.FC<NoteInputSectionProps> = ({
  isSidebarCollapsed,
  noteInputRef,
  value,
  onChange,
  onSave,
  isSaving,
  onRequestClearOrBlur,
  onDraftSaved,
}) => {
  return (
    <div className='flex-shrink-0 border-t-2 border-accent-black dark:border-off-white/20'>
      <div
        className={`${
          isSidebarCollapsed
            ? '-ml-[80px] w-[calc(100%+80px)]'
            : '-ml-[320px] w-[calc(100%+320px)]'
        } pointer-events-none`}
      >
        <div
          className={`${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[320px]'} pointer-events-auto`}
        >
          <div className='w-full px-2 sm:px-3 md:px-4 lg:px-5 py-3 sm:py-4 md:py-5 lg:py-6 max-w-full'>
            <NoteInput
              inputRef={noteInputRef}
              value={value}
              onChange={onChange}
              onSave={onSave}
              isSaving={isSaving}
              onRequestClearOrBlur={onRequestClearOrBlur}
              onDraftSaved={onDraftSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteInputSection;
