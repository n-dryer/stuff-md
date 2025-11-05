const isDevelopment =
  import.meta.env.DEV || process.env.NODE_ENV === 'development';

export const logError = (message: string, error?: unknown): void => {
  if (isDevelopment) {
    console.error(message, error);
  }
};

export const logWarning = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
};

export const logInfo = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.info(message, ...args);
  }
};

/**
 * Log debug information (dev-only)
 */
export const logDebug = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};
