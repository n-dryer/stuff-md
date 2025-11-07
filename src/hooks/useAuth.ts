import { useState, useEffect, useCallback } from 'react';
import type { User, AuthError } from 'firebase/auth';
import {
  signInWithGooglePopup,
  signOutFirebase,
  onAuthStateChanged,
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

function normalizeAuthError(error: unknown): AuthError {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    return error as AuthError;
  }
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    code: errorMessage.includes('Missing required env')
      ? 'config/missing-env'
      : 'auth/unknown-error',
    message: errorMessage,
    name: 'AuthError',
  } as AuthError;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const initAuth = async () => {
      try {
        unsubscribe = await onAuthStateChanged((firebaseUser: User | null) => {
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
        });
      } catch (error) {
        logError('Failed to initialize auth state listener:', error);
        setIsLoading(false);
      }
    };
    initAuth();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadAnalyticsIfSupported();
      const result = await signInWithGooglePopup();
      const { GoogleAuthProvider } = await import('firebase/auth');
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token && result.user) {
        setAccessToken(token);
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        throw new Error(
          'Could not retrieve Google OAuth access token from credential.'
        );
      }
    } catch (error) {
      logError('Authentication failed:', error);
      setError(normalizeAuthError(error));
      setAccessToken(null);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadAnalyticsIfSupported();
      const result = await signInWithGooglePopup();
      const { GoogleAuthProvider } = await import('firebase/auth');
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token && result.user) {
        setAccessToken(token);
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        return token;
      } else {
        throw new Error(
          'Could not retrieve Google OAuth access token from credential.'
        );
      }
    } catch (error) {
      logError('Authentication failed during token refresh:', error);
      setError(normalizeAuthError(error));
      setAccessToken(null);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      // re-throwing the error so the caller can handle it (e.g. show reauth modal)
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOutFirebase();
      setAccessToken(null);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (signOutError) {
      logError('Firebase signOut error:', signOutError);
      setError(normalizeAuthError(signOutError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    accessToken,
    isLoading,
    error,
    login,
    logout,
    refreshAccessToken,
  };
}
