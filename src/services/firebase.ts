// This service uses the Firebase v9+ modular SDK.
// It uses lazy initialization to avoid blocking the main thread during app startup.
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

import { logWarning } from '../utils/logger';

// Your web app's Firebase configuration is now loaded from environment variables
// to prevent exposing sensitive keys in the source code.
// Trim whitespace to handle potential newlines from secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim(),
};

// Validate that all necessary Firebase environment variables are set.
// Only validate when Firebase is actually used (lazy validation)
function validateFirebaseConfig() {
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (key !== 'measurementId' && !value) {
      // Construct the expected .env variable name from the camelCase key
      const envVarName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      throw new Error(
        `Firebase config missing: ${envVarName}. Please check your environment configuration.`
      );
    }
  }
}

// Lazy initialization pattern - initialize on first access
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;
let analyticsInstance: Analytics | null = null;

/**
 * Get or initialize the Firebase app instance.
 * Initializes on first access to avoid blocking module load.
 */
function getAppInstance(): FirebaseApp {
  if (!app) {
    validateFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

/**
 * Get or initialize the Firebase Auth instance.
 * Initializes on first access.
 */
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getAppInstance());
  }
  return authInstance;
}

/**
 * Get or initialize the Google Auth Provider.
 * Initializes on first access with the required Drive API scope.
 */
export function getProviderInstance(): GoogleAuthProvider {
  if (!providerInstance) {
    providerInstance = new GoogleAuthProvider();
    // This scope is required to allow the application to create and manage files
    // in the user's Google Drive.
    providerInstance.addScope('https://www.googleapis.com/auth/drive.file');
  }
  return providerInstance;
}

/**
 * Initialize Firebase Analytics after the initial render.
 * Uses requestIdleCallback to avoid blocking the main thread.
 */
export function initAnalytics(): void {
  if (
    typeof window === 'undefined' ||
    analyticsInstance ||
    !firebaseConfig.measurementId
  ) {
    return;
  }

  // Use requestIdleCallback with a timeout fallback

  const idleCallback =
    (window as any).requestIdleCallback ||
    ((fn: () => void) => setTimeout(fn, 1));

  idleCallback(
    () => {
      try {
        analyticsInstance = getAnalytics(getAppInstance());
      } catch (error) {
        // Analytics initialization can fail in certain environments (e.g., extensions)
        logWarning('Failed to initialize Firebase Analytics:', error);
      }
    },
    { timeout: 2000 }
  );
}

// For backward compatibility, export as lazy-initialized constants
// Note: These use Proxy but should only be used for property access.
// For Firebase function calls, use getAuthInstance()/getProviderInstance() instead.
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuthInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop];
    // If it's a function, bind it to the actual auth instance
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export const provider: GoogleAuthProvider = new Proxy(
  {} as GoogleAuthProvider,
  {
    get(_target, prop) {
      const instance = getProviderInstance();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (instance as any)[prop];
      // If it's a function, bind it to the actual provider instance
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
  }
);

// Analytics is lazy-loaded separately via initAnalytics()
export const analytics = analyticsInstance;
