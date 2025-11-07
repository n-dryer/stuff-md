import React from 'react';

import BrutalistTooltip from './BrutalistTooltip';
import { URL_REGEX } from '../utils/textUtils';
import { sanitizeUrl } from '../utils/urlValidation';

interface AutoLinkerProps {
  text: string | null | undefined;
}

const AutoLinker: React.FC<AutoLinkerProps> = ({ text }) => {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (part && part.match(URL_REGEX)) {
          const sanitizedUrl = sanitizeUrl(part);

          // Only render as link if URL is valid and safe
          if (sanitizedUrl) {
            return (
              <BrutalistTooltip key={i} text={sanitizedUrl}>
                <a
                  href={sanitizedUrl}
                  target='_blank'
                  rel='noopener noreferrer nofollow'
                  className='font-bold text-off-black/80 dark:text-off-white/80 hover:text-off-black dark:hover:text-off-white transition-colors no-underline'
                  onClick={e => e.stopPropagation()} // Prevents collapsing the note when clicking a link
                >
                  {part}
                </a>
              </BrutalistTooltip>
            );
          }
          // If URL is invalid/dangerous, render as plain text
          return <span key={i}>{part}</span>;
        }
        return part;
      })}
    </>
  );
};

export default AutoLinker;
