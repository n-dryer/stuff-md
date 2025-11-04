/**
 * Error handling utilities for consistent error management across the application
 */

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Creates a standardized error object from various error types
 * @param error - Error instance, string, or unknown value
 * @param code - Optional error code
 * @returns Standardized AppError object
 */
export const normalizeError = (error: unknown, code?: string): AppError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: code || error.name,
      details: error,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code,
    };
  }

  return {
    message: 'An unknown error occurred',
    code,
    details: error,
  };
};

/**
 * Sanitizes error message for user display (removes sensitive information)
 * @param error - Error object
 * @returns Sanitized error message safe for user display
 */
export const sanitizeErrorMessage = (error: AppError): string => {
  let message = error.message;

  // Remove potential sensitive information patterns
  message = message.replace(/api[_-]?key[\s:=]+[^\s,]+/gi, '[API_KEY]');
  message = message.replace(/token[\s:=]+[^\s,]+/gi, '[TOKEN]');
  message = message.replace(/password[\s:=]+[^\s,]+/gi, '[PASSWORD]');
  message = message.replace(/secret[\s:=]+[^\s,]+/gi, '[SECRET]');
  message = message.replace(/bearer\s+[^\s,]+/gi, '[BEARER_TOKEN]');
  message = message.replace(/authorization[\s:=]+[^\s,]+/gi, '[AUTH_HEADER]');

  // Remove URLs that might contain sensitive data
  message = message.replace(/https?:\/\/[^\s,]+/gi, url => {
    try {
      const urlObj = new URL(url);
      // Keep domain but remove paths and query params
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return '[URL]';
    }
  });

  // Remove file paths that might expose system structure
  message = message.replace(/\/[^\s,]+/g, '[PATH]');
  message = message.replace(/[A-Z]:\\[^\s,]+/gi, '[PATH]');

  // Remove email addresses
  message = message.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );

  // Remove long alphanumeric strings that might be IDs or tokens
  message = message.replace(/\b[a-zA-Z0-9]{32,}\b/g, '[ID]');

  return message;
};

/**
 * Determines if an error is a network-related error
 * @param error - Error object
 * @returns true if error appears to be network-related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('offline')
    );
  }
  return false;
};

/**
 * Determines if an error is an authentication-related error
 * @param error - Error object
 * @returns true if error appears to be auth-related
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    return (
      name.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('authentication') ||
      message.includes('token expired')
    );
  }
  return false;
};
