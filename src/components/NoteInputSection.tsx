import React, { useRef } from 'react';
import NoteInput from './NoteInput';
import Button from './Button';

interface NoteInputSectionProps {
  isSidebarCollapsed: boolean;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isSaving: boolean;
  isDeleting?: boolean;
  onRequestClearOrBlur: () => void;
  onDraftSaved?: () => void;
  onOpenInstructions: () => void;
}

const NoteInputSection: React.FC<NoteInputSectionProps> = ({
  isSidebarCollapsed,
  noteInputRef,
  value,
  onChange,
  onSave,
  isSaving,
  isDeleting = false,
  onRequestClearOrBlur,
  onDraftSaved,
  onOpenInstructions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`flex-shrink-0 border-t-2 border-accent-black dark:border-off-white/20 relative ${isSaving ? 'pointer-events-none' : ''}`}
    >
      <div
        className={`${
          isSidebarCollapsed
            ? '-ml-[theme(spacing.sidebar-collapsed)] w-[calc(100%+theme(spacing.sidebar-collapsed))]'
            : '-ml-[theme(spacing.sidebar-expanded)] w-[calc(100%+theme(spacing.sidebar-expanded))]'
        } pointer-events-none`}
      >
        <div
          ref={containerRef}
          className={`${isSidebarCollapsed ? 'ml-[theme(spacing.sidebar-collapsed)]' : 'ml-[theme(spacing.sidebar-expanded)]'} pointer-events-auto relative`}
        >
          <div className='w-full px-2 sm:px-3 md:px-4 lg:px-5 py-3 sm:py-4 md:py-5 lg:py-6 relative'>
            <NoteInput
              inputRef={noteInputRef}
              value={value}
              onChange={onChange}
              onSave={onSave}
              isSaving={isSaving}
              isDeleting={isDeleting}
              onRequestClearOrBlur={onRequestClearOrBlur}
              onDraftSaved={onDraftSaved}
              onOpenInstructions={onOpenInstructions}
            />
            <Button
              variant='fill'
              onClick={onSave}
              disabled={!value.trim() || isSaving}
              className='absolute bottom-3 right-2 sm:bottom-4 sm:right-3 md:bottom-5 md:right-4 lg:bottom-6 lg:right-5 flex-shrink-0 z-10 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2'
            >
              Add Stuff
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteInputSection;
