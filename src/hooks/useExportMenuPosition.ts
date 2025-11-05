import { useState, useCallback, useEffect, type RefObject } from 'react';

interface UseExportMenuPositionProps {
  isExpanded: boolean;
  buttonRef: RefObject<HTMLButtonElement>;
  menuRef: RefObject<HTMLDivElement>;
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
  }>({ right: 0, top: 0 });

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
    const margin = 16;

    const right = window.innerWidth - buttonRect.right;

    if (spaceBelow >= estimatedMenuHeight + margin) {
      setMenuPosition({
        top: buttonRect.bottom + margin,
        right,
        bottom: undefined,
      });
      return;
    }

    if (spaceAbove >= estimatedMenuHeight + margin) {
      setMenuPosition({
        bottom: viewportHeight - buttonRect.top + margin,
        right,
        top: undefined,
      });
      return;
    }

    setMenuPosition({
      top: Math.min(
        Math.max(8, buttonRect.bottom + margin),
        viewportHeight - estimatedMenuHeight - 8
      ),
      right,
      bottom: undefined,
    });
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
