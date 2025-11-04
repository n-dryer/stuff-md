import React from 'react';

interface ViewToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}

const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  isActive,
  onClick,
  children,
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-1 ${isActive ? 'text-off-black dark:text-off-white' : 'text-light-gray dark:text-gray-600 hover:text-off-black dark:hover:text-off-white'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black`}
  >
    {children}
  </button>
);

export default ViewToggleButton;
