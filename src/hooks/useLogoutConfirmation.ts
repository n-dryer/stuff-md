import { useCallback } from 'react';
import { handleError } from '../utils/errorHandler';

interface UseLogoutConfirmationProps {
  logout: () => Promise<void>;
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
  setConfirmLogoutOpen: (open: boolean) => void;
  onLogoutSuccess?: () => void;
}

export const useLogoutConfirmation = ({
  logout,
  displayFeedback,
  setConfirmLogoutOpen,
  onLogoutSuccess,
}: UseLogoutConfirmationProps) => {
  const requestLogout = useCallback(() => {
    setConfirmLogoutOpen(true);
  }, [setConfirmLogoutOpen]);

  const cancelLogout = useCallback(() => {
    setConfirmLogoutOpen(false);
  }, [setConfirmLogoutOpen]);

  const confirmLogout = useCallback(async () => {
    try {
      await logout();
      // Clear draft and perform any other cleanup on successful logout
      onLogoutSuccess?.();
      displayFeedback('success', 'You have been logged out.');
    } catch (error) {
      handleError(
        error,
        displayFeedback,
        'Logout failed. Please try again.',
        'useLogoutConfirmation:confirmLogout'
      );
    } finally {
      setConfirmLogoutOpen(false);
    }
  }, [logout, displayFeedback, setConfirmLogoutOpen, onLogoutSuccess]);

  return { requestLogout, cancelLogout, confirmLogout };
};
