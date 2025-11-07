import React, { useState } from 'react';
import AIIcon from './AIIcon';

interface AIRationaleProps {
  rationale: string;
  noIconMode?: boolean;
}

const RATIONALE_TRUNCATE_LENGTH_MOBILE = 60;
const RATIONALE_TRUNCATE_LENGTH_DESKTOP = 80;

const AIRationale: React.FC<AIRationaleProps> = ({
  rationale,
  noIconMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const truncateLength = isMobile
    ? RATIONALE_TRUNCATE_LENGTH_MOBILE
    : RATIONALE_TRUNCATE_LENGTH_DESKTOP;
  const isTruncated = rationale.length > truncateLength;

  return (
    <div className='flex items-start font-mono text-sm sm:text-base leading-relaxed text-off-black/80 dark:text-off-white/80'>
      {noIconMode ? (
        <span className='font-bold mr-2 flex-shrink-0'>[AI RATIONALE]:</span>
      ) : (
        <AIIcon
          className='w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0'
          aria-label='AI Rationale'
        />
      )}
      <div className='flex-1 min-w-0'>
        <span>
          {isTruncated && !isExpanded
            ? `${rationale.substring(0, truncateLength)}...`
            : rationale}
        </span>
        {isTruncated && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='ml-1 min-h-min-touch-target min-w-min-touch-target px-2 py-1 uppercase text-light-gray hover:text-off-black dark:hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-2'
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? 'Show less rationale' : 'Show more rationale'
            }
          >
            {isExpanded ? '[less]' : '[more]'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIRationale;
