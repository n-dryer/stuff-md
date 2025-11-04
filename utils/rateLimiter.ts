/**
 * Rate limiter utility for client-side throttling
 * Prevents spam operations by limiting how often functions can be called
 */

interface RateLimiterOptions {
  /**
   * Minimum time (in milliseconds) between function calls
   * @default 1000 (1 second)
   */
  minInterval: number;
  /**
   * Maximum number of calls allowed in a time window
   * @default 10
   */
  maxCalls: number;
  /**
   * Time window (in milliseconds) for maxCalls
   * @default 60000 (1 minute)
   */
  windowMs: number;
}

interface CallRecord {
  timestamp: number;
}

/**
 * Creates a rate-limited version of a function
 * @param fn Function to rate limit
 * @param options Rate limiting options
 * @returns Rate-limited function
 */
export function rateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Partial<RateLimiterOptions> = {}
): T {
  const {
    minInterval = 1000,
    maxCalls = 10,
    windowMs = 60000,
  } = options;

  let lastCallTime = 0;
  const callHistory: CallRecord[] = [];

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    // Remove old entries outside the time window
    const windowStart = now - windowMs;
    while (callHistory.length > 0 && callHistory[0].timestamp < windowStart) {
      callHistory.shift();
    }

    // Check if we've exceeded the maximum number of calls in the window
    if (callHistory.length >= maxCalls) {
      const oldestCall = callHistory[0];
      const waitTime = oldestCall.timestamp + windowMs - now;
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
      );
    }

    // Check minimum interval between calls
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      throw new Error(
        `Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
      );
    }

    // Record this call
    lastCallTime = now;
    callHistory.push({ timestamp: now });

    // Execute the function
    return fn(...args);
  }) as T;
}

