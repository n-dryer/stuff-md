import React from 'react';
import { AuthError } from 'firebase/auth';

import GoogleSignInButton from './GoogleSignInButton';

interface LoginScreenProps {
  onLogin: () => void;
  error?: AuthError | null;
}

const getFriendlyErrorMessage = (errorCode: string, errorMessage?: string): string => {
    // Check for missing environment variable errors
    if (errorMessage && errorMessage.includes('Missing required env')) {
        return 'Firebase configuration is missing. Please create a .env.local file with your Firebase credentials. See the README for setup instructions.';
    }

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
      <GoogleSignInButton onClick={onLogin} />
      {error && (
        <div className="mt-6 p-4 border-2 border-destructive-red max-w-md w-full">
            <h3 className="font-bold font-mono uppercase text-destructive-red">Authentication Error</h3>
            <p className="mt-2 text-sm text-off-black/80 dark:text-off-white/80">
                {getFriendlyErrorMessage(error.code || '', error.message)}
            </p>
            {error.message && error.message.includes('Missing required env') && (
              <div className="mt-3 text-xs text-off-black/70 dark:text-off-white/70">
                <p className="font-semibold mb-1">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Copy <code className="bg-light-gray dark:bg-gray-800 px-1 rounded">.env.example</code> to <code className="bg-light-gray dark:bg-gray-800 px-1 rounded">.env.local</code></li>
                  <li>Get your Firebase config from <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-accent-black dark:text-accent-white">Firebase Console</a></li>
                  <li>Replace the placeholder values in <code className="bg-light-gray dark:bg-gray-800 px-1 rounded">.env.local</code></li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            )}
            <p className="mt-2 text-xs text-light-gray dark:text-gray-500 font-mono">
                Details: {error.message} {error.code && `(Code: ${error.code})`}
            </p>
        </div>
      )}
    </div>
  );
});

LoginScreen.displayName = 'LoginScreen';

export default LoginScreen;
