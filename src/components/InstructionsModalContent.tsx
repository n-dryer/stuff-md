import React, { useState, useMemo, useEffect } from 'react';
import CharCounter from './CharCounter';
import { SYSTEM_INSTRUCTION } from '../services/aiService';

interface InstructionsModalContentProps {
  mode: 'default' | 'custom';
  instructions: string;
  setInstructions: (instructions: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const PREVIEW_LENGTH = 200;

const InstructionsModalContent: React.FC<InstructionsModalContentProps> = ({
  mode,
  instructions,
  setInstructions,
  textareaRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expansion state when mode changes
  useEffect(() => {
    setIsExpanded(false);
  }, [mode]);

  const contentContainerClasses = `flex-1 bg-off-white dark:bg-brutal-gray rounded-sm p-4 sm:p-6 flex flex-col ${
    mode === 'default'
      ? 'gap-4'
      : 'border-2 border-accent-black dark:border-off-white/50 gap-4'
  }`;

  const shouldTruncate = useMemo(() => {
    return SYSTEM_INSTRUCTION.length > PREVIEW_LENGTH;
  }, []);

  const previewText = useMemo(() => {
    if (!shouldTruncate) return SYSTEM_INSTRUCTION;
    // Find a good break point (end of sentence or line)
    const truncated = SYSTEM_INSTRUCTION.substring(0, PREVIEW_LENGTH);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const breakPoint = Math.max(lastPeriod, lastNewline);
    return breakPoint > PREVIEW_LENGTH * 0.7
      ? SYSTEM_INSTRUCTION.substring(0, breakPoint + 1)
      : truncated + '...';
  }, [shouldTruncate]);

  const displayText = isExpanded ? SYSTEM_INSTRUCTION : previewText;

  return (
    <div className={contentContainerClasses}>
      {mode === 'default' ? (
        <div className='w-full'>
          <p className='text-sm sm:text-base text-off-black dark:text-off-white leading-relaxed tracking-wide normal-case whitespace-pre-wrap text-left transition-all duration-normal'>
            {displayText}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='mt-2 uppercase text-xs font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white transition-colors duration-normal'
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? 'Show less of system instructions'
                  : 'Show more of system instructions'
              }
            >
              {isExpanded ? '[less]' : '[more]'}
            </button>
          )}
        </div>
      ) : (
        <>
          <textarea
            id='custom-instructions'
            name='instructions'
            ref={textareaRef}
            value={instructions}
            onChange={event => setInstructions(event.target.value)}
            placeholder="e.g., 'Always categorize technical notes under a programming parent category.'"
            className='w-full flex-1 min-h-[220px] sm:min-h-[280px] bg-transparent text-sm sm:text-base font-mono text-off-black dark:text-off-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none p-3 sm:p-4'
            rows={6}
            aria-describedby='instructions-description'
            aria-labelledby='instructions-modal-title'
            maxLength={2000}
          />
          <div className='flex justify-end pt-2'>
            <CharCounter
              valueLength={instructions.length}
              max={2000}
              className='normal-case'
            />
          </div>
        </>
      )}
    </div>
  );
};

export default InstructionsModalContent;
