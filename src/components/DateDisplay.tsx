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
  modifiedTime: string;
}

const DateDisplay: React.FC<DateDisplayProps> = React.memo(
  ({ date, modifiedTime }) => {
    const createdDate = new Date(date);
    const modifiedDate = new Date(modifiedTime);
    const isValidCreated = !isNaN(createdDate.getTime());
    const isValidModified = !isNaN(modifiedDate.getTime());

    const isEdited =
      isValidCreated &&
      isValidModified &&
      modifiedDate.getTime() - createdDate.getTime() > 1000 * 60; // 1 minute threshold

    const displayDate = isEdited ? modifiedTime : date;
    const titleDate = isEdited ? modifiedDate : createdDate;

    return (
      <span
        className='font-mono text-xs text-off-black/60 dark:text-off-white/60 flex-shrink-0 whitespace-nowrap'
        title={isValidCreated ? titleDate.toLocaleString() : 'Invalid date'}
      >
        {isEdited ? 'EDITED ' : ''}
        {formatRelativeTime(displayDate)}
      </span>
    );
  }
);

DateDisplay.displayName = 'DateDisplay';

export default DateDisplay;
