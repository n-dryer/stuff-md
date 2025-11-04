import React from 'react';
import { AuthError } from 'firebase/auth';

import Button from './Button';

interface LoginScreenProps {
  onLogin: () => void;
  error?: AuthError | null;
}

const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/argument-error':
            return 'Authentication configuration error. Please refresh the page and try again.';
        case 'auth/configuration-not-found':
            return 'Firebase configuration is incorrect or Google Sign-In has not been enabled for this project in the Firebase Console. Please contact the developer.';
        case 'auth/popup-closed-by-user':
            return 'Login process was cancelled. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Login process was cancelled. Please try again.';
        default:
            return 'An unexpected error occurred during login. Please try again later.';
    }
};

const LoginScreen: React.FC<LoginScreenProps> = React.memo(({ onLogin, error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-off-white dark:bg-off-black">
      <h1 className="text-7xl font-black font-mono text-accent-black dark:text-off-white">STUFF.MD</h1>
      <p className="mt-4 text-off-black/80 max-w-md dark:text-off-white/80">
        A minimalist, AI-powered notepad that saves your stuff directly to your Google Drive.
      </p>
      <div className="my-8 h-1 w-24 bg-accent-black dark:bg-off-white" aria-hidden="true"></div>
      <Button onClick={onLogin} variant="fill">
        Login with Google
      </Button>
      {error && (
        <div className="mt-6 p-4 border-2 border-destructive-red max-w-md w-full">
            <h3 className="font-bold font-mono uppercase text-destructive-red">Authentication Error</h3>
            <p className="mt-2 text-sm text-off-black/80 dark:text-off-white/80">
                {getFriendlyErrorMessage(error.code)}
            </p>
            <p className="mt-2 text-xs text-light-gray dark:text-gray-500 font-mono">
                Details: {error.message} (Code: {error.code})
            </p>
        </div>
      )}
    </div>
  );
});

LoginScreen.displayName = 'LoginScreen';

export default LoginScreen;