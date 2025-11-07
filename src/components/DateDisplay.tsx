import React from 'react';

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'INVALID DATE';
  }

  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (days > 0) {
    return rtf.format(-days, 'day').toUpperCase();
  }
  if (hours > 0) {
    return rtf.format(-hours, 'hour').toUpperCase();
  }
  if (minutes > 0) {
    return rtf.format(-minutes, 'minute').toUpperCase();
  }
  return 'JUST NOW';
};

interface DateDisplayProps {
  date: string;
}

const DateDisplay: React.FC<DateDisplayProps> = React.memo(({ date }) => {
  const dateObj = new Date(date);
  const isValidDate = !isNaN(dateObj.getTime());

  return (
    <span
      className='font-mono text-xs text-off-black/60 dark:text-off-white/60 flex-shrink-0 whitespace-nowrap'
      title={isValidDate ? dateObj.toLocaleString() : 'Invalid date'}
    >
      {formatRelativeTime(date)}
    </span>
  );
});

DateDisplay.displayName = 'DateDisplay';

export default DateDisplay;
