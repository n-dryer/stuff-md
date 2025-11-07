interface RateLimiterOptions {
  maxCalls: number;
  windowMs: number;
}

interface CallRecord {
  timestamp: number;
}

export class RateLimiter {
  private readonly options: RateLimiterOptions;
  private callHistory: CallRecord[] = [];

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.options = {
      maxCalls: options.maxCalls ?? 10,
      windowMs: options.windowMs ?? 60000,
    };
  }

  public check(): void {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    this.callHistory = this.callHistory.filter(
      record => record.timestamp >= windowStart
    );

    if (this.callHistory.length >= this.options.maxCalls) {
      const oldestCall = this.callHistory[0];
      const waitTime = oldestCall.timestamp + this.options.windowMs - now;
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(
          waitTime / 1000
        )} seconds.`
      );
    }

    this.callHistory.push({ timestamp: now });
  }
}
