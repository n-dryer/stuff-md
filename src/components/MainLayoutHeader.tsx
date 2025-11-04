import React from 'react';
import BrutalistTooltip from './BrutalistTooltip';

interface MainLayoutHeaderProps {
  isSidebarCollapsed: boolean;
  logoutButton: React.ReactNode;
}

const MainLayoutHeader: React.FC<MainLayoutHeaderProps> = ({
  isSidebarCollapsed,
  logoutButton,
}) => {
  return (
    <header className='flex-shrink-0'>
      <div
        className={`${
          isSidebarCollapsed
            ? '-ml-[80px] w-[calc(100%+80px)]'
            : '-ml-[320px] w-[calc(100%+320px)]'
        } pointer-events-none`}
      >
        <div
          className={`border-b-2 border-accent-black dark:border-off-white/20 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[320px]'} pointer-events-auto`}
        >
          <div className='w-full overflow-x-auto'>
            <div className='flex flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full min-w-max p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-base'>
              <div className='flex flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
                <div className='inline-flex flex-shrink-0 whitespace-nowrap'>
                  <span className='text-2xl sm:text-3xl md:text-4xl font-black text-accent-black dark:text-off-white select-none leading-none'>
                    STUFF.md
                  </span>
                </div>
              </div>
              <div className='flex flex-nowrap items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
                <BrutalistTooltip text='Sign out' position='top'>
                  <div className='flex justify-center flex-shrink-0 whitespace-nowrap'>
                    {logoutButton}
                  </div>
                </BrutalistTooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainLayoutHeader;
