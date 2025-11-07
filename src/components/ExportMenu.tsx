import React from 'react';
import { createPortal } from 'react-dom';
import BrutalistSpinner from './BrutalistSpinner';

interface ExportMenuProps {
  isExpanded: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  menuItemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  menuPosition: {
    top?: number;
    bottom?: number;
    right: number;
  };
  exportOptions: Array<{
    label: string;
    fn: () => void | Promise<void>;
    errorMsg: string;
    ariaLabel: string;
  }>;
  onExport: (
    exportFn: () => void | Promise<void>,
    errorMessage: string
  ) => Promise<void>;
  isExporting: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  isExpanded,
  menuRef,
  menuItemRefs,
  menuPosition,
  exportOptions,
  onExport,
  isExporting,
}) => {
  if (!isExpanded) return null;

  return createPortal(
    <div
      ref={menuRef}
      role='menu'
      tabIndex={-1}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      className={`
        bg-off-white dark:bg-brutal-gray
        border-2 border-accent-black dark:border-off-white/40
        rounded-sm
        min-w-[120px]
        flex flex-col
        overflow-y-auto
        shadow-lg
        z-export-menu
      `}
      style={{
        position: 'fixed',
        right: `${menuPosition.right}px`,
        ...(menuPosition.top !== undefined
          ? { top: `${menuPosition.top}px` }
          : { bottom: `${menuPosition.bottom}px` }),
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'min(240px, calc(100vh - 6rem))',
        opacity: 1,
        visibility: 'visible',
      }}
    >
      {exportOptions.map((option, index) => (
        <button
          key={option.label}
          ref={el => {
            menuItemRefs.current[index] = el;
          }}
          role='menuitem'
          aria-label={option.ariaLabel}
          onClick={() => onExport(option.fn, option.errorMsg)}
          disabled={isExporting}
          aria-disabled={isExporting}
          className={`
            font-mono text-sm uppercase
            text-accent-black dark:text-off-white
            w-full text-left px-4 py-2 min-h-min-touch-target
            transition-colors duration-normal
            hover:font-bold hover:bg-off-black/10 dark:hover:bg-off-white/10
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black focus-visible:bg-off-black/10 dark:focus-visible:bg-off-white/10
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-between gap-[clamp(0.5rem,1.5vw,0.75rem)]
          `}
        >
          <span>{option.label}</span>
          {isExporting && <BrutalistSpinner />}
        </button>
      ))}
    </div>,
    document.body
  );
};

export default ExportMenu;
