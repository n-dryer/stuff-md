import React from 'react';
import Button from './Button';

interface NoteListEmptyProps {
  onFocusNoteInput: () => void;
  onOpenHelp: () => void;
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
  onOpenHelp,
}) => {
  return (
    <section className='relative isolate mx-auto w-full max-w-[min(66rem,calc(100vw-1rem))] overflow-hidden rounded-[1.75rem] border-2 border-accent-black bg-off-white/90 px-[clamp(1.15rem,2vw+0.85rem,3.25rem)] py-[clamp(2.5rem,3.2vw+1.5rem,5.25rem)] text-center shadow-sm dark:border-off-white/20 dark:bg-off-black/60 sm:px-[clamp(1.5rem,2.2vw+1.2rem,3.75rem)]'>
      {renderPatternBackdrop()}
      <div className='relative grid gap-[clamp(1.75rem,3.5vw+1rem,3.75rem)] text-center md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] md:items-start md:text-left'>
        <div className='flex flex-col items-center gap-[clamp(1.35rem,2.5vw+0.9rem,2.5rem)] text-pretty md:items-start'>
          <h3 className='text-balance text-[clamp(1.65rem,3.25vw+0.9rem,2.9rem)] font-black uppercase tracking-[0.12em] text-accent-black dark:text-off-white sm:tracking-[0.18em] xl:tracking-[0.26em]'>
            ADD YOUR FIRST NOTE
          </h3>
          <p className='max-w-[52ch] text-[clamp(0.92rem,1.1vw+0.58rem,1.18rem)] leading-relaxed text-off-black/70 dark:text-off-white/70 sm:text-[clamp(0.98rem,1vw+0.65rem,1.25rem)]'>
            Notes organized automatically as you type. Categorized, tagged, and
            searchable. Stored in your Google Drive—your data, always accessible.
          </p>
        </div>
        <div className='flex flex-col items-center gap-[clamp(1.4rem,2vw+0.9rem,2.35rem)] md:col-start-2 md:items-stretch md:text-left'>
          <div className='grid w-full max-w-[min(22rem,100%)] gap-[clamp(0.75rem,1.8vw,1.25rem)] sm:[grid-template-columns:repeat(auto-fit,minmax(9.25rem,1fr))] md:max-w-[19rem]'>
            <Button
              onClick={onFocusNoteInput}
              variant='fill'
              className='w-full min-h-[3rem] text-[clamp(0.85rem,1vw+0.55rem,1rem)]'
            >
              Start typing
            </Button>
            <Button
              onClick={onOpenHelp}
              variant='default'
              className='w-full min-h-[3rem] text-[clamp(0.85rem,1vw+0.55rem,1rem)]'
            >
              Learn More
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
