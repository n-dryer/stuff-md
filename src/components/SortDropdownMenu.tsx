import React from 'react';

type SortMode = 'recent' | 'oldest' | 'title';

interface SortDropdownMenuProps {
  isOpen: boolean;
  selectedSort: SortMode;
  onSelect: (mode: SortMode) => void;
  onRequestClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const SORT_OPTIONS: Array<{ key: SortMode; label: string }> = [
  { key: 'recent', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'title', label: 'Title A-Z' },
];

const SortDropdownMenu: React.FC<SortDropdownMenuProps> = ({
  isOpen,
  selectedSort,
  onSelect,
  onRequestClose,
  menuRef,
}) => {
  return (
    <div
      ref={menuRef}
      role='menu'
      aria-hidden={!isOpen}
      className={`absolute left-0 top-full mt-2 min-w-[160px] sm:min-w-[180px] max-w-xs bg-off-white dark:bg-brutal-gray border-2 border-accent-black dark:border-off-white/40 rounded-sm shadow-lg flex flex-col overflow-hidden font-mono uppercase tracking-widest text-xs sm:text-sm md:text-base z-dropdown transition-all duration-normal ease-out origin-top ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'
      }`}
    >
      {SORT_OPTIONS.map(option => {
        const isActive = option.key === selectedSort;
        return (
          <button
            key={option.key}
            type='button'
            role='menuitemradio'
            aria-checked={isActive}
            tabIndex={isOpen ? 0 : -1}
            onClick={() => onSelect(option.key)}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                onRequestClose();
              }
            }}
            className={`font-mono text-sm uppercase text-accent-black dark:text-off-white w-full text-left px-4 py-2 min-h-min-touch-target transition-colors duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
              isActive
                ? 'font-bold bg-off-black/10 dark:bg-off-white/10'
                : 'hover:font-bold hover:bg-off-black/10 dark:hover:bg-off-white/10'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SortDropdownMenu;
