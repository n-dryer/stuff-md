import React from 'react';
import BrutalistTooltip from './BrutalistTooltip';
import ThemeToggle from './ThemeToggle';
import ExportButtons from './ExportButtons';
import { useUIStateContext } from '../contexts/UIContext';
import { Note } from '../types';

interface MainLayoutFooterProps {
  isSidebarCollapsed: boolean;
  instructionsControl: React.ReactNode;
  notes: Note[];
}

const MainLayoutFooter: React.FC<MainLayoutFooterProps> = ({
  isSidebarCollapsed,
  instructionsControl,
  notes,
}) => {
  const { theme } = useUIStateContext();
  const isDarkMode = theme === 'dark';
  const themeToggleTooltip = isDarkMode
    ? 'Switch to Light mode'
    : 'Switch to Dark mode';

  return (
    <footer className='flex-shrink-0'>
      <div
        className={`${
          isSidebarCollapsed
            ? '-ml-[80px] w-[calc(100%+80px)]'
            : '-ml-[320px] w-[calc(100%+320px)]'
        } pointer-events-none`}
      >
        <div
          className={`border-t-2 border-accent-black dark:border-off-white/20 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[320px]'} pointer-events-auto`}
        >
          <div className='w-full overflow-x-auto'>
            <div className='flex flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full min-w-max p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-base'>
              <div className='flex flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
                <div className='inline-flex flex-shrink-0 whitespace-nowrap'>
                  {instructionsControl}
                </div>
              </div>

              <div className='flex flex-nowrap items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
                <div className='inline-flex flex-shrink-0 whitespace-nowrap'>
                  <ExportButtons notes={notes} />
                </div>
                <div className='inline-flex flex-shrink-0 whitespace-nowrap'>
                  <BrutalistTooltip text={themeToggleTooltip} position='top'>
                    <div className='flex justify-center flex-shrink-0 whitespace-nowrap'>
                      <ThemeToggle />
                    </div>
                  </BrutalistTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainLayoutFooter;
