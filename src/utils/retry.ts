/**
 * Retry utilities with exponential backoff
 */

/**
 * Options to configure retry behavior with exponential backoff.
 * - maxRetries: maximum number of retries after the initial attempt
 * - initialDelay: base delay in ms before the first retry
 * - maxDelay: cap for the computed backoff delay in ms
 * - backoffMultiplier: factor used for exponential growth of delay
 * - retryableStatuses: HTTP statuses considered retryable when present on errors
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatuses: [429, 500, 502, 503, 504], // Rate limit and server errors
};

/**
 * Calculates delay with exponential backoff
 * @param attempt Current attempt number (0-indexed)
 * @param options Retry options
 * @returns Delay in milliseconds
 */
const calculateDelay = (
  attempt: number,
  options: Required<RetryOptions>
): number => {
  const delay =
    options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
};

/**
 * Checks if an error response is retryable
 * @param status HTTP status code
 * @param options Retry options
 * @returns True if the status is retryable
 */
const isRetryable = (
  status: number,
  options: Required<RetryOptions>
): boolean => {
  return options.retryableStatuses.includes(status);
};

/**
 * Sleeps for the specified number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retries a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise that resolves with the function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Check if error is retryable (for errors with status property)
      if (lastError && typeof lastError === 'object' && 'status' in lastError) {
        const status = (lastError as { status: number }).status;
        if (!isRetryable(status, opts)) {
          throw lastError;
        }
      }

      // Wait before retrying (exponential backoff)
      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed with unknown error');
};
