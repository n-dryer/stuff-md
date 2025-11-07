import React from 'react';

interface EditMenuProps {
  isOpen: boolean;
  onSelectDeleteAll: () => void;
  onRequestClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  notesCount: number;
}

const EditMenu: React.FC<EditMenuProps> = ({
  isOpen,
  onSelectDeleteAll,
  onRequestClose,
  menuRef,
  notesCount,
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
      <button
        type='button'
        role='menuitem'
        tabIndex={isOpen ? 0 : -1}
        onClick={() => {
          onSelectDeleteAll();
          onRequestClose();
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onRequestClose();
          }
        }}
        disabled={notesCount === 0}
        className={`font-mono text-sm uppercase w-full text-left px-4 py-2 min-h-min-touch-target transition-colors duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
          notesCount === 0
            ? 'text-light-gray dark:text-gray-500 cursor-not-allowed opacity-50'
            : 'text-destructive-red hover:font-bold hover:bg-off-black/10 dark:hover:bg-off-white/10'
        }`}
      >
        Delete All
      </button>
    </div>
  );
};

export default EditMenu;
