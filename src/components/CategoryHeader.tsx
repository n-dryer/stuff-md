import React from 'react';
import BrutalistTooltip from './BrutalistTooltip';

interface CategoryHeaderProps {
  category: string;
  isActive: boolean;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  icon: React.ReactNode;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  isActive,
  onSelectCategory,
  isCollapsed,
  icon,
}) => {
  const buttonContent = (
    <button
      onClick={() => onSelectCategory(category)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={category}
      title={category}
      className={`
        w-full flex items-center uppercase font-black text-lg tracking-wider p-4 group
        transition-colors duration-medium 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-accent-black dark:focus-visible:ring-off-white
        ${isCollapsed ? 'justify-center' : ''}
        min-h-min-touch-target sm:min-h-min-button-height
        ${
          isActive
            ? 'text-off-black dark:text-off-white'
            : 'text-off-black/60 hover:text-off-black dark:text-off-white/60 dark:hover:text-off-white'
        }
      `}
    >
      <div
        className='flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5'
        aria-hidden='true'
      >
        {icon}
      </div>
      <div
        className={`
        overflow-hidden transition-all duration-layout ease-in-out flex items-center
        ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-xs ml-3 sm:ml-4 opacity-100'}`}
      >
        <span
          className={`whitespace-nowrap ${isActive ? 'underline' : 'no-underline'} underline-offset-4 decoration-2 group-hover:no-underline`}
        >
          {category}
        </span>
      </div>
    </button>
  );

  return isCollapsed ? (
    <BrutalistTooltip text={category} position='right'>
      {buttonContent}
    </BrutalistTooltip>
  ) : (
    buttonContent
  );
};

export default CategoryHeader;
