import React from 'react';
import BrutalistTooltip from './BrutalistTooltip';
import { IconCaret } from './Icons';

interface SidebarToggleProps {
  isSidebarCollapsed: boolean;
  onToggle: () => void;
  sidebarId: string;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isSidebarCollapsed,
  onToggle,
  sidebarId,
}) => {
  const toggleTooltip = isSidebarCollapsed
    ? 'Expand sidebar'
    : 'Collapse sidebar';

  const cursorLeft = 'w-resize';
  const cursorRight = 'e-resize';
  const sidebarCursor = isSidebarCollapsed ? cursorRight : cursorLeft;

  const sidebarChevronBaseClasses =
    'w-8 h-8 flex items-center justify-center text-current transition-transform duration-200 ease-out motion-reduce:transition-none';

  const sidebarToggleButtonClasses = `group text-accent-black dark:text-off-white hover:text-accent-black/80 dark:hover:text-off-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
    isSidebarCollapsed
      ? 'flex h-12 w-12 items-center justify-center rounded-full'
      : 'inline-flex items-center justify-center px-4 py-3 rounded-sm'
  }`;

  const sidebarToggleIconClasses = `${
    isSidebarCollapsed
      ? `${sidebarChevronBaseClasses} rotate-180 -translate-x-[1px] group-hover:scale-110 motion-reduce:transform-none`
      : `${sidebarChevronBaseClasses} rotate-0 group-hover:scale-110 motion-reduce:transform-none`
  }`;

  return (
    <BrutalistTooltip
      text={toggleTooltip}
      position={isSidebarCollapsed ? 'right' : 'top'}
    >
      <button
        type='button'
        onClick={onToggle}
        className={sidebarToggleButtonClasses}
        aria-label={toggleTooltip}
        aria-expanded={!isSidebarCollapsed}
        aria-controls={sidebarId}
        style={{ cursor: sidebarCursor }}
      >
        <span className='sr-only'>{toggleTooltip}</span>
        <span className={sidebarToggleIconClasses} aria-hidden='true'>
          {IconCaret}
        </span>
      </button>
    </BrutalistTooltip>
  );
};

export default SidebarToggle;
