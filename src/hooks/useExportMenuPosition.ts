import { useState, useCallback, useEffect } from 'react';

interface UseExportMenuPositionProps {
  isExpanded: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  exportOptionsCount: number;
}

export const useExportMenuPosition = ({
  isExpanded,
  buttonRef,
  menuRef,
  exportOptionsCount,
}: UseExportMenuPositionProps) => {
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0, bottom: 100 });

  const updateMenuPlacement = useCallback(() => {
    if (!buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedMenuHeight =
      menuRef.current?.offsetHeight ?? exportOptionsCount * 52;
    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;

    const right = window.innerWidth - buttonRect.right;

    // Prefer 'up' placement for footer button
    if (spaceAbove >= estimatedMenuHeight + 24) {
      setMenuPosition({
        bottom: viewportHeight - buttonRect.top + 24,
        right: right,
        top: undefined,
      });
      return;
    }

    if (
      spaceBelow >= estimatedMenuHeight + 24 &&
      spaceAbove < estimatedMenuHeight + 24
    ) {
      setMenuPosition({
        top: buttonRect.bottom + 16,
        right: right,
        bottom: undefined,
      });
      return;
    }

    const isInFooter = buttonRect.bottom > viewportHeight * 0.7;
    if (isInFooter || spaceAbove > spaceBelow) {
      setMenuPosition({
        bottom: viewportHeight - buttonRect.top + 24,
        right: right,
        top: undefined,
      });
    } else {
      setMenuPosition({
        top: buttonRect.bottom + 16,
        right: right,
        bottom: undefined,
      });
    }
  }, [exportOptionsCount, buttonRef, menuRef]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    updateMenuPlacement();

    const timeoutId = setTimeout(() => {
      updateMenuPlacement();
    }, 0);

    const handleReposition = () => updateMenuPlacement();

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isExpanded, updateMenuPlacement]);

  return { menuPosition };
};
