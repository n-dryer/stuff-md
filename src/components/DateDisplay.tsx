import React from 'react';

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  // Validate date parsing
  if (isNaN(date.getTime())) {
    return 'INVALID DATE';
  }
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 3600) { // less than an hour
    const minutes = Math.round(seconds / 60);
    return `${minutes} MINUTE${minutes > 1 ? 'S' : ''} AGO`;
  }
  
  if (seconds < 86400) { // less than a day
      const hours = Math.round(seconds / 3600);
      return `${hours} HOUR${hours > 1 ? 'S' : ''} AGO`;
  }

  const days = Math.round(seconds / 86400);
  return `${days} DAY${days > 1 ? 'S' : ''} AGO`;
};


interface DateDisplayProps {
  date: string;
}

const DateDisplay: React.FC<DateDisplayProps> = React.memo(({ date }) => {
  const dateObj = new Date(date);
  const isValidDate = !isNaN(dateObj.getTime());
  
  return (
    <span className="font-mono text-xs text-off-black/60 dark:text-off-white/60 flex-shrink-0 whitespace-nowrap" title={isValidDate ? dateObj.toLocaleString() : 'Invalid date'}>
      {formatRelativeTime(date)}
    </span>
  );
});

DateDisplay.displayName = 'DateDisplay';

export default DateDisplay;