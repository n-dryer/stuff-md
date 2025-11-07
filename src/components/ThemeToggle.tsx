import React from 'react';
import { useUIStateContext, useUIActions } from '../contexts/UIContext';

const ThemeToggle: React.FC = () => {
  const { theme } = useUIStateContext();
  const { toggleTheme } = useUIActions();
  const isDarkMode = theme === 'dark';
  const label = isDarkMode ? 'DARK' : 'LIGHT';
  const ariaLabel = isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode';

  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={ariaLabel}
      role='switch'
      aria-checked={isDarkMode}
      className='inline-flex items-center justify-center uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 whitespace-nowrap'
    >
      [{label}]
    </button>
  );
};

export default ThemeToggle;
