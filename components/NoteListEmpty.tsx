import React from 'react';
import Button from './Button';

interface NoteListEmptyProps {
  onFocusNoteInput: () => void;
  onOpenInstructions: () => void;
}

const renderPatternBackdrop = () => (
  <>
    <div
      aria-hidden='true'
      className='absolute inset-0 pointer-events-none opacity-50 bg-[length:28px_28px] bg-[radial-gradient(circle_at_1px_1px,_rgba(28,28,28,0.08)_1px,_transparent_0)] dark:hidden'
    />
    <div
      aria-hidden='true'
      className='absolute inset-0 hidden pointer-events-none opacity-40 dark:block bg-[length:28px_28px] bg-[radial-gradient(circle_at_1px_1px,_rgba(240,240,240,0.18)_1px,_transparent_0)]'
    />
  </>
);

const NoteListEmpty: React.FC<NoteListEmptyProps> = ({
  onFocusNoteInput,
  onOpenInstructions,
}) => {
  return (
    <section className='relative isolate mx-auto w-full max-w-[min(68rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.75rem] border-2 border-accent-black bg-off-white/90 px-[clamp(1.25rem,2vw+1rem,3.5rem)] py-[clamp(2.75rem,3.5vw+1.75rem,5.5rem)] text-center shadow-sm dark:border-off-white/20 dark:bg-off-black/60'>
      {renderPatternBackdrop()}
      <div className='relative grid gap-[clamp(2rem,3vw+1rem,4rem)] text-center md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-start md:text-left'>
        <div className='flex flex-col items-center gap-[clamp(1.5rem,2vw+1rem,2.75rem)] text-pretty md:items-start'>
          <h3 className='text-balance text-[clamp(1.75rem,3.5vw+0.9rem,3.05rem)] font-black uppercase tracking-[0.12em] text-accent-black dark:text-off-white sm:tracking-[0.18em] xl:tracking-[0.28em]'>
            ADD YOUR FIRST NOTE
          </h3>
          <p className='max-w-[46ch] text-[clamp(0.95rem,1.1vw+0.6rem,1.2rem)] leading-relaxed text-off-black/70 dark:text-off-white/70'>
            Capture ideas, tasks, and inspiration—everything stays organized
            automatically as you type.
          </p>
        </div>
        <div className='flex flex-col items-center gap-[clamp(1.5rem,2vw+1rem,2.5rem)] md:col-start-2 md:items-stretch md:text-left'>
          <div className='grid w-full max-w-md gap-3 sm:grid-cols-2 md:max-w-xs md:grid-cols-1'>
            <Button
              onClick={onFocusNoteInput}
              variant='fill'
              className='w-full'
            >
              Start typing
            </Button>
            <Button
              onClick={onOpenInstructions}
              variant='default'
              className='w-full'
            >
              Open AI Instructions
            </Button>
          </div>
        </div>
        <p className='text-[clamp(0.75rem,0.5vw+0.68rem,0.95rem)] uppercase tracking-[0.2em] text-off-black/55 dark:text-off-white/55 md:col-span-2 md:justify-self-start md:text-left md:text-pretty'>
          ⌘K to search · ⌘S to save
        </p>
      </div>
    </section>
  );
};

export default NoteListEmpty;
