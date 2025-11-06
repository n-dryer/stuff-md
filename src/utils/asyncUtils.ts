import { TimeoutError } from '../services/ai/errors';

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: number | undefined;
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(
        () => reject(new TimeoutError('Request timed out')),
        timeoutMs
      );
    }),
  ]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
};
