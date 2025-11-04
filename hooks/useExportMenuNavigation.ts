import { useEffect, useRef } from 'react';

interface UseExportMenuNavigationProps {
  isExpanded: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  menuItemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  exportOptionsCount: number;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}

export const useExportMenuNavigation = ({
  isExpanded,
  menuRef,
  menuItemRefs,
  exportOptionsCount,
  buttonRef,
  onClose,
}: UseExportMenuNavigationProps) => {
  const focusedIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        onClose();
        focusedIndexRef.current = null;
        buttonRef.current?.focus();
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, onClose, buttonRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = focusedIndexRef.current;
        const nextIndex =
          currentIndex === null
            ? 0
            : Math.min(currentIndex + 1, exportOptionsCount - 1);
        focusedIndexRef.current = nextIndex;
        menuItemRefs.current[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = focusedIndexRef.current;
        const nextIndex =
          currentIndex === null
            ? exportOptionsCount - 1
            : Math.max(currentIndex - 1, 0);
        focusedIndexRef.current = nextIndex;
        menuItemRefs.current[nextIndex]?.focus();
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, exportOptionsCount, menuItemRefs]);

  useEffect(() => {
    if (isExpanded && menuItemRefs.current[0]) {
      menuItemRefs.current[0].focus();
      focusedIndexRef.current = 0;
    }
  }, [isExpanded, menuItemRefs]);

  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      if (e.key === 'Tab') {
        const menuItems = menuRef.current
          ? Array.from(
              menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
            )
          : [];
        if (menuItems.length === 0) return;

        const firstItem = menuItems[0];
        const lastItem = menuItems[menuItems.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstItem) {
            e.preventDefault();
            lastItem.focus();
          }
        } else {
          if (document.activeElement === lastItem) {
            e.preventDefault();
            firstItem.focus();
          }
        }
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleTab);
      return () => window.removeEventListener('keydown', handleTab);
    }
  }, [isExpanded, menuRef]);

  return { focusedIndexRef };
};
