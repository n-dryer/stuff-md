import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useSidebarCollapse() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>(
    'stuffmd.sidebarCollapsed',
    false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const collapseForMobile = (matches: boolean) => {
      if (matches) {
        setIsSidebarCollapsed(true);
      }
    };

    collapseForMobile(mediaQuery.matches);

    const handleViewportChange = (event: MediaQueryListEvent) => {
      collapseForMobile(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () =>
        mediaQuery.removeEventListener('change', handleViewportChange);
    }

    const legacyListener = (event: MediaQueryListEvent) =>
      handleViewportChange(event);
    mediaQuery.addListener(legacyListener);
    return () => mediaQuery.removeListener(legacyListener);
  }, [setIsSidebarCollapsed]);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
  };
}
