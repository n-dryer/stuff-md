import React, { useState, useRef, useEffect } from 'react';
import NoteInput from './NoteInput';
import NoteInputCoachmark from './NoteInputCoachmark';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasShownCoachmark, setHasShownCoachmark] = useLocalStorage<boolean>(
    'stuffmd.coachmark.noteInput.dismissed',
    false
  );
  const [showCoachmark, setShowCoachmark] = useState(false);

  useEffect(() => {
    if (!hasShownCoachmark && containerRef.current && noteInputRef.current) {
      // Small delay to ensure layout is complete
      const timer = setTimeout(() => {
        setShowCoachmark(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasShownCoachmark, noteInputRef]);

  const handleCoachmarkDismiss = () => {
    setShowCoachmark(false);
    setHasShownCoachmark(true);
  };

  return (
    <div className={`flex-shrink-0 border-t-2 border-accent-black dark:border-off-white/20 relative ${isSaving ? 'pointer-events-none' : ''}`}>
      <div
        className={`${
          isSidebarCollapsed
            ? '-ml-[80px] w-[calc(100%+80px)]'
            : '-ml-[320px] w-[calc(100%+320px)]'
        } pointer-events-none`}
      >
        <div
          ref={containerRef}
          className={`${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[320px]'} pointer-events-auto`}
        >
          <div className='w-full px-2 sm:px-3 md:px-4 lg:px-5 py-3 sm:py-4 md:py-5 lg:py-6 flex justify-start'>
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
          {showCoachmark && (
            <NoteInputCoachmark
              inputRef={noteInputRef}
              containerRef={containerRef}
              onDismiss={handleCoachmarkDismiss}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteInputSection;
