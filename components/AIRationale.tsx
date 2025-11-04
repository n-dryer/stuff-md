import React, { useState } from 'react';
import AIIcon from './AIIcon';

interface AIRationaleProps {
  rationale: string;
  noIconMode?: boolean;
}

const RATIONALE_TRUNCATE_LENGTH = 80;

const AIRationale: React.FC<AIRationaleProps> = ({ rationale, noIconMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isTruncated = rationale.length > RATIONALE_TRUNCATE_LENGTH;

  return (
    <div className="flex items-start font-mono text-sm text-off-black/80 dark:text-off-white/80">
      {noIconMode ? (
        <span className="font-bold mr-2 flex-shrink-0">[AI RATIONALE]:</span>
      ) : (
        <AIIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" aria-label="AI Rationale" />
      )}
      <div>
        <span>
          {isTruncated && !isExpanded ? `${rationale.substring(0, RATIONALE_TRUNCATE_LENGTH)}...` : rationale}
        </span>
        {isTruncated && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="ml-1 uppercase text-light-gray hover:text-off-black focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-black">
            {isExpanded ? '[less]' : '[more]'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIRationale;