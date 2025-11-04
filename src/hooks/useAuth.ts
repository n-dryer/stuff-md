import { useState, useEffect, useCallback } from 'react';
import type { User, AuthError } from 'firebase/auth';

import {
  signInWithGooglePopup,
  signOutFirebase,
  onAuthStateChanged as onAuthStateChangedLazy,
  loadAnalyticsIfSupported,
} from '../lib/firebaseClient';
import { logError } from '../utils/logger';

export interface UserProfile {
  name: string | null;
  email: string | null;
  picture: string | null;
  sub: string; // Firebase UID
}

const ACCESS_TOKEN_KEY = 'stuffmd.gdrive_access_token';

/**
 * This hook manages the entire authentication flow using Firebase Authentication.
 * Firebase SDK is loaded lazily only on first user interaction (login click).
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  // This state holds the OAuth 2.0 access token required for Google Drive API.
  // It is separate from Firebase's own ID token.
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth state listener only after first interaction or if access token exists
  useEffect(() => {
    // If we have an access token, user was previously logged in - initialize auth check
    if (accessToken && !authInitialized) {
      let unsubscribe: (() => void) | null = null;

      const initAuth = async () => {
        try {
          unsubscribe = await onAuthStateChangedLazy(
            (firebaseUser: User | null) => {
              if (firebaseUser) {
                setUser({
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  picture: firebaseUser.photoURL,
                  sub: firebaseUser.uid,
                });
              } else {
                setUser(null);
                setAccessToken(null);
                sessionStorage.removeItem(ACCESS_TOKEN_KEY);
              }
              setIsLoading(false);
              setAuthInitialized(true);
            }
          );
        } catch (error) {
          logError('Failed to initialize auth state:', error);
          setIsLoading(false);
          setAuthInitialized(true);
        }
      };

      // Delay by one frame to allow first paint
      const timeoutId = setTimeout(initAuth, 0);

      return () => {
        clearTimeout(timeoutId);
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else if (!accessToken) {
      // No access token, so no user is logged in - skip Firebase initialization
      setIsLoading(false);
      setAuthInitialized(true);
    }
  }, [accessToken, authInitialized]);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load analytics after first user interaction (login click)
      await loadAnalyticsIfSupported();

      // Trigger the Google sign-in popup - this will dynamically load Firebase SDK
      const result = await signInWithGooglePopup();

      // Extract the OAuth credential from the sign-in result.
      // Dynamically import GoogleAuthProvider to avoid loading Firebase at module load time
      const { GoogleAuthProvider } = await import('firebase/auth');
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        throw new Error('Could not get credential from result.');
      }
      const token = credential.accessToken;

      if (token && result.user) {
        // The OAuth access token is successfully retrieved. Set it in state and sessionStorage.
        setAccessToken(token);
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);

        // Also update the user profile from the result.
        const firebaseUser = result.user;
        setUser({
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
          sub: firebaseUser.uid,
        });

        // Set up auth state listener now that we're logged in
        setAuthInitialized(false);
      } else {
        // This is a critical error if the token is missing after a successful sign-in.
        throw new Error(
          'Could not retrieve Google OAuth access token from credential.'
        );
      }
    } catch (error) {
      logError('Authentication failed:', error);
      setError(error as AuthError);
      // Ensure a clean state on authentication failure.
      setUser(null);
      setAccessToken(null);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase - this will dynamically load Firebase SDK if not already loaded
      await signOutFirebase();
      // Clear the user state and access token.
      setUser(null);
      setAccessToken(null);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      setAuthInitialized(false);
    } catch (error) {
      logError('Sign out failed:', error);
    }
  }, []);

  return { user, accessToken, isLoading, error, login, logout };
}
