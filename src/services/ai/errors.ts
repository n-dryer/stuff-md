/**
 * AI Service Error Classes
 *
 * Custom error classes for AI service operations.
 * Extracted to prevent circular dependencies with validation.ts
 */

export class BrowserAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserAPIError';
  }
}

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
