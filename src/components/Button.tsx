import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'fill';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', disabled, ...props }) => {
  const baseClasses = `
    uppercase px-6 py-3 text-base font-mono font-normal border-2 border-accent-black cursor-pointer
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-accent-black focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black
    active:shadow-none active:translate-x-0 active:translate-y-0
    transition-all duration-150
  `;

  const disabledClasses = `
    text-off-black/40 dark:text-off-white/40
    border-accent-black/40 dark:border-off-white/40
    cursor-not-allowed pointer-events-none
    opacity-60
  `;

  if (variant === 'fill') {
    return (
      <button
        className={`
          ${baseClasses}
          bg-accent-black text-off-white
          hover:shadow-brutalist hover:-translate-x-1 hover:-translate-y-1
          dark:bg-off-white dark:text-off-black dark:border-off-white dark:hover:shadow-brutalist-dark
          ${disabled ? `${disabledClasses} bg-off-black/40 dark:bg-off-white/40 hover:shadow-none hover:translate-x-0 hover:translate-y-0` : ''}
          ${className}
        `}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`
        ${baseClasses}
        bg-off-white text-off-black
        dark:bg-off-black dark:text-off-white dark:border-off-white/80
        hover:border-5 dark:hover:border-5 dark:hover:border-off-white
        ${disabled ? `${disabledClasses} hover:border-2 dark:hover:border-off-white/40` : ''}
        ${className}
      `}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
