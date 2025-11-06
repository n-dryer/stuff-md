import { logError } from './logger';

// A centralized error handler that logs the full error and displays a friendly message.
export const handleError = (
  error: unknown,
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void,
  userMessage: string = 'An unexpected error occurred. Please try again.',
  context?: string
) => {
  const logMessage = context ? `${context}:` : 'An error occurred:';
  logError(logMessage, error);
  displayFeedback('error', userMessage);
};

/**
 * Normalize an error to an Error object
 */
export const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  return new Error('An unknown error occurred');
};

/**
 * Sanitize error message for display to users
 */
export const sanitizeErrorMessage = (error: Error): string => {
  const message = error.message || 'An unexpected error occurred';
  // Remove technical details that users don't need to see
  return message
    .replace(/^Error:\s*/i, '')
    .replace(/at\s+.*/g, '')
    .trim()
    .slice(0, 200); // Limit length
};
