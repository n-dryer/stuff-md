import React from 'react';
import CategoryHeader from './CategoryHeader';
import { categoryIcons } from './Icons';

interface SidebarProps {
  dynamicCategories: string[];
  hasLinks: boolean;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  dynamicCategories,
  hasLinks,
  activeCategory,
  onSelectCategory,
  isCollapsed,
}) => {
  return (
    <nav
      className={`${isCollapsed ? 'flex flex-col items-center' : ''} pt-4 sm:pt-5 md:pt-6`}
    >
      <ul>
        {dynamicCategories.map(category => (
          <li key={category}>
            <CategoryHeader
              category={category}
              isActive={activeCategory === category}
              onSelectCategory={onSelectCategory}
              isCollapsed={isCollapsed}
              icon={
                categoryIcons[category as keyof typeof categoryIcons] ||
                categoryIcons.DEFAULT
              }
            />
          </li>
        ))}
      </ul>
      {hasLinks && (
        <div className='pt-4'>
          <hr
            className={`mx-4 border-t-2 border-accent-black/20 dark:border-off-white/10 transition-opacity duration-layout ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
          />
          <ul className='pt-4'>
            <li>
              <CategoryHeader
                category='LINKS'
                isActive={activeCategory === 'LINKS'}
                onSelectCategory={onSelectCategory}
                isCollapsed={isCollapsed}
                icon={categoryIcons.LINKS}
              />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
