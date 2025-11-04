/**
 * Truncate content if too long (optimize for Gemini Nano's context window)
 */
export const truncateContent = (
  content: string,
  maxLength: number = 6000
): string => {
  if (content.length <= maxLength) {
    return content;
  }
  // Truncate at word boundary
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
};

/**
 * Retry with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error('Retry failed: unknown error');
};
