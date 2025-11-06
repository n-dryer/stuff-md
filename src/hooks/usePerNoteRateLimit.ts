import { useRef, useCallback } from 'react';

const MAX_REGENERATIONS_PER_NOTE = 10; // Max regenerations per note per hour
const REGENERATION_WINDOW_MS = 3600000; // 1 hour

interface RateLimitInfo {
  count: number;
  lastAttempt: number;
}

/**
 * Hook for managing per-note regeneration rate limiting
 * Tracks regeneration attempts per note ID to prevent abuse
 */
export const usePerNoteRateLimit = () => {
  const regenerationAttempts = useRef<Map<string, RateLimitInfo>>(new Map());

  /**
   * Checks if regeneration is allowed for the given note ID
   * Throws an error if rate limit is exceeded
   */
  const checkRateLimit = useCallback((noteId: string): void => {
    const now = Date.now();
    const noteAttempts = regenerationAttempts.current.get(noteId);

    if (noteAttempts) {
      // Reset if window has passed
      if (now - noteAttempts.lastAttempt > REGENERATION_WINDOW_MS) {
        noteAttempts.count = 0;
      }

      // Check if limit exceeded
      if (noteAttempts.count >= MAX_REGENERATIONS_PER_NOTE) {
        throw new Error(
          `Rate limit exceeded: Maximum ${MAX_REGENERATIONS_PER_NOTE} regenerations per hour for this note. Please wait before trying again.`
        );
      }

      noteAttempts.count += 1;
      noteAttempts.lastAttempt = now;
    } else {
      regenerationAttempts.current.set(noteId, {
        count: 1,
        lastAttempt: now,
      });
    }
  }, []);

  return { checkRateLimit };
};
