/**
 * Type guard utilities for safe type narrowing
 */

/**
 * Type guard to check if a value is an Error instance
 * @param value - Value to check
 * @returns true if value is an Error
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

/**
 * Type guard to check if a value is a string
 * @param value - Value to check
 * @returns true if value is a string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard to safely extract Error from unknown catch value
 * @param error - Error value from catch block
 * @returns Error instance or null
 */
export const toError = (error: unknown): Error => {
  if (isError(error)) {
    return error;
  }
  if (isString(error)) {
    return new Error(error);
  }
  return new Error(String(error));
};

