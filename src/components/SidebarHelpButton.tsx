import React from 'react';
import BrutalistTooltip from './BrutalistTooltip';
import { IconInfo } from './Icons';

interface SidebarHelpButtonProps {
  isCollapsed: boolean;
  onOpenHelp: () => void;
  isHelpOpen: boolean;
}

const SidebarHelpButton: React.FC<SidebarHelpButtonProps> = ({
  isCollapsed,
  onOpenHelp,
  isHelpOpen,
}) => {
  const ariaLabel = isHelpOpen
    ? 'Help menu (dialog open)'
    : 'Help menu (opens overview modal)';

  const buttonContent = (
    <button
      type='button'
      onClick={onOpenHelp}
      aria-haspopup='dialog'
      aria-expanded={isHelpOpen}
      aria-controls='help-modal'
      title='HELP & INFO'
      className={`
        w-full flex items-center justify-start uppercase font-black text-lg tracking-wider p-4 min-h-[44px] sm:min-h-[48px]
        transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-accent-black dark:focus-visible:ring-off-white
        ${isCollapsed ? 'justify-center rounded-full' : ''}
        ${
          isHelpOpen
            ? 'text-off-black dark:text-off-white'
            : 'text-off-black/60 hover:text-off-black dark:text-off-white/60 dark:hover:text-off-white'
        }
      `}
      aria-label={ariaLabel}
    >
      <span
        className='flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5'
        aria-hidden='true'
      >
        {IconInfo}
      </span>
      <span
        className={`
          overflow-hidden transition-all duration-300 ease-in-out flex items-center text-left
          ${
            isCollapsed
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-xs ml-3 sm:ml-4 opacity-100'
          }
        `}
      >
        <span className='whitespace-nowrap'>HELP & INFO</span>
      </span>
    </button>
  );

  return isCollapsed ? (
    <BrutalistTooltip text='HELP & INFO' position='right'>
      {buttonContent}
    </BrutalistTooltip>
  ) : (
    buttonContent
  );
};

export default SidebarHelpButton;
