import React from 'react';

interface CharCounterProps {
  valueLength: number;
  max: number;
  className?: string;
}

const CharCounter: React.FC<CharCounterProps> = ({ valueLength, max, className = '' }) => {
  const isOverLimit = max > 0 && valueLength > max;
  const isNearLimit = max > 0 && valueLength / max >= 0.9;

  const statusText = `${valueLength}/${max}`;

  return (
    <span
      className={`text-xs font-mono tracking-widest ${isOverLimit ? 'text-destructive-red' : isNearLimit ? 'text-accent-black dark:text-off-white' : 'text-light-gray dark:text-gray-500'} ${className}`}
      aria-live='polite'
    >
      {statusText}
    </span>
  );
};

export default CharCounter;
