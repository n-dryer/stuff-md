import { useState, useCallback } from 'react';

interface UseLogoutConfirmationProps {
  logout: () => Promise<void>;
  displayFeedback: (
    message: string,
    type: 'success' | 'error' | 'info'
  ) => void;
}

export function useLogoutConfirmation({
  logout,
  displayFeedback,
}: UseLogoutConfirmationProps) {
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const requestLogout = useCallback(() => {
    setConfirmLogoutOpen(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setConfirmLogoutOpen(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    setConfirmLogoutOpen(false);
    await logout();
    displayFeedback('Logged out.', 'success');
  }, [logout, displayFeedback]);

  return {
    confirmLogoutOpen,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
