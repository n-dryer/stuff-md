// Lazy Firebase client - loads only on first user interaction
// This module uses dynamic imports to defer Firebase SDK loading until needed

let appPromise: Promise<import('firebase/app').FirebaseApp> | null = null;

function getFirebaseConfig() {
  // Trim whitespace to handle potential newlines from secrets
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim(),
  };

  // Validate required config (measurementId is optional)
  for (const [k, v] of Object.entries(cfg)) {
    if (k !== 'measurementId' && !v) {
      throw new Error(
        `Missing required env: VITE_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`
      );
    }
  }

  return cfg;
}

/**
 * Get or initialize the Firebase app instance.
 * Uses dynamic import to defer loading until first access.
 */
export async function getFirebaseApp(): Promise<
  import('firebase/app').FirebaseApp
> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const cfg = getFirebaseConfig();
      const existing = getApps();
      return existing.length ? existing[0] : initializeApp(cfg);
    })();
  }
  return appPromise;
}

/**
 * Get Firebase Auth instance.
 * Call only after a user action (click/submit) to defer loading.
 */
export async function getAuthClient(): Promise<import('firebase/auth').Auth> {
  const app = await getFirebaseApp();
  const { getAuth, setPersistence, browserLocalPersistence } = await import(
    'firebase/auth'
  );
  const auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);
  return auth;
}

/**
 * Get Google Auth Provider with Drive scope.
 * Call only after a user action.
 */
export async function getProviderInstance(): Promise<
  import('firebase/auth').GoogleAuthProvider
> {
  const { GoogleAuthProvider } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  // This scope is required to allow the application to create and manage files
  // in the user's Google Drive.
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  return provider;
}

/**
 * Sign in with Google popup.
 * This triggers the dynamic import of Firebase Auth.
 */
export async function signInWithGooglePopup(): Promise<
  import('firebase/auth').UserCredential
> {
  const auth = await getAuthClient();
  const { signInWithPopup } = await import('firebase/auth');
  const provider = await getProviderInstance();
  return signInWithPopup(auth, provider);
}

/**
 * Get Firebase Auth instance for state observation.
 * Only call when user is expected to be logged in or checking auth state.
 */
export async function getAuthInstance(): Promise<import('firebase/auth').Auth> {
  return getAuthClient();
}

/**
 * Sign out from Firebase.
 */
export async function signOutFirebase(): Promise<void> {
  const auth = await getAuthClient();
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
}

/**
 * Observe auth state changes.
 * Only call when you need to monitor auth state.
 */
export async function onAuthStateChanged(
  callback: (user: import('firebase/auth').User | null) => void
): Promise<() => void> {
  const auth = await getAuthClient();
  const { onAuthStateChanged: _onAuthStateChanged } = await import(
    'firebase/auth'
  );
  return _onAuthStateChanged(auth, callback);
}

/**
 * Load Google Analytics lazily; safe if no Measurement ID.
 * Call after first user interaction to defer loading.
 */
export async function loadAnalyticsIfSupported(): Promise<
  import('firebase/analytics').Analytics | null
> {
  const app = await getFirebaseApp();
  const { isSupported, getAnalytics } = await import('firebase/analytics');

  try {
    if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && (await isSupported())) {
      return getAnalytics(app);
    }
  } catch {
    // Analytics initialization can fail in certain environments (e.g., extensions)
    // Silently fail - this is expected behavior
  }

  return null;
}
