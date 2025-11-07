import React, { useMemo } from 'react';
import BrutalistTooltip from './BrutalistTooltip';
import { SYSTEM_INSTRUCTION } from '../services/aiService';

interface InstructionsButtonProps {
  customInstructions: string;
  onOpenInstructions: () => void;
  instructionsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const InstructionsButton: React.FC<InstructionsButtonProps> = ({
  customInstructions,
  onOpenInstructions,
  instructionsButtonRef,
}) => {
  const instructionsStatus = useMemo(() => {
    if (!customInstructions || customInstructions === SYSTEM_INSTRUCTION) {
      return 'DEFAULT';
    }
    return 'CUSTOM';
  }, [customInstructions]);

  const instructionsTooltipText =
    instructionsStatus === 'DEFAULT'
      ? 'Set custom instructions'
      : 'Update custom instructions';

  const buttonTitle = instructionsTooltipText;
  const footerControlButtonClasses =
    'inline-flex items-center justify-center uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-1.5 text-center whitespace-nowrap';

  return (
    <BrutalistTooltip text={instructionsTooltipText} position='top'>
      <button
        ref={instructionsButtonRef}
        type='button'
        onClick={onOpenInstructions}
        className={footerControlButtonClasses}
        title={buttonTitle}
        aria-label={`AI rules ${instructionsStatus}. ${instructionsTooltipText}`}
      >
        <span className='whitespace-nowrap'>
          [AI RULES: {instructionsStatus}]
        </span>
      </button>
    </BrutalistTooltip>
  );
};

export default InstructionsButton;
