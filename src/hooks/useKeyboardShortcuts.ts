import { useEffect, useCallback } from 'react';

type ShortcutCallback = (e: KeyboardEvent) => void;
interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // For Command key on Mac
  shiftKey?: boolean;
  callback: ShortcutCallback;
  allowInInput?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    for (const shortcut of shortcuts) {
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const modifierMatch = (shortcut.ctrlKey || shortcut.metaKey) ? ctrlOrMeta : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

      if (keyMatch && modifierMatch && shiftMatch) {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

        if (isInput && !shortcut.allowInInput) {
          continue;
        }

        e.preventDefault();
        shortcut.callback(e);
        return; 
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
