/**
 * AI Rate Limiter
 *
 * Singleton class for managing rate limits on AI requests.
 * Prevents too many requests per minute and per hour.
 */

import { MAX_REQUESTS_PER_MINUTE, MAX_REQUESTS_PER_HOUR } from './constants';
import { RateLimiter } from '../../utils/rateLimiter';

class AIRateLimiter {
  private minuteLimiter: RateLimiter;
  private hourLimiter: RateLimiter;

  constructor() {
    this.minuteLimiter = new RateLimiter({
      maxCalls: MAX_REQUESTS_PER_MINUTE,
      windowMs: 60000,
    });
    this.hourLimiter = new RateLimiter({
      maxCalls: MAX_REQUESTS_PER_HOUR,
      windowMs: 3600000,
    });
  }

  /**
   * Checks if the current request is within rate limits.
   * Throws an error if rate limit is exceeded.
   */
  public checkRateLimit(): void {
    this.minuteLimiter.check();
    this.hourLimiter.check();
  }
}

// Export singleton instance
export const aiRateLimiter = new AIRateLimiter();
