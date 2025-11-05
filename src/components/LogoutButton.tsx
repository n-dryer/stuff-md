import React from 'react';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const footerControlButtonClasses =
    'inline-flex items-center justify-center uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-destructive-red dark:text-gray-500 dark:hover:text-destructive-red hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-1.5 text-center whitespace-nowrap';

  return (
    <button
      onClick={onLogout}
      type='button'
      className={footerControlButtonClasses}
      aria-label='Logout'
      title='Logout'
    >
      [LOGOUT]
    </button>
  );
};

export default LogoutButton;
