import React from 'react';

interface TagProps {
  tag: string;
  onClick?: (tag: string) => void;
  isActive?: boolean;
}

const Tag: React.FC<TagProps> = React.memo(({ tag, onClick, isActive }) => {
  const baseClasses =
    'text-xs font-mono uppercase px-2 py-0.5 transition-colors duration-normal ease-in-out';
  const interactiveClasses = onClick ? 'cursor-pointer' : '';

  const colorClasses = isActive
    ? 'bg-accent-black text-off-white dark:bg-off-white dark:text-off-black'
    : 'bg-off-black/5 text-off-black/60 hover:bg-off-black/10 dark:bg-off-white/10 dark:text-off-white dark:hover:bg-off-white/20';

  const focusClasses = onClick
    ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black'
    : '';

  const className = `${baseClasses} ${colorClasses} ${interactiveClasses} ${focusClasses}`;

  if (onClick) {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick(tag);
    };
    return (
      <button type='button' className={className} onClick={handleClick}>
        {tag}
      </button>
    );
  }

  return <div className={className}>{tag}</div>;
});

Tag.displayName = 'Tag';

export default Tag;
