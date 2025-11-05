/**
 * Sanitize content to prevent prompt injection attacks
 */
export const sanitizeContent = (content: string): string => {
  const dangerousPatterns = [
    /(?:ignore|forget|system|assistant|user):/gi,
    /```(?:system|user|assistant)/gi,
    /\[INST\]|\[\/INST\]/gi,
    /<\|im_start\|>|<\|im_end\|>/gi,
    /(?:you are|act as|pretend to be)/gi,
  ];

  let sanitized = content;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[removed]');
  });

  return sanitized;
};

/**
 * Detect spam patterns in content
 */
export const detectSpam = (content: string): boolean => {
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    if (word.length > 2) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  for (const count of wordCounts.values()) {
    if (count > 50) return true;
  }

  const specialCharCount = (content.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount / content.length > 0.3) return true;

  return false;
};

/**
 * Simple hash function for content deduplication
 */
export const hashContent = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * Estimate token count (approximate: 1 token ≈ 4 chars for English)
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Optimize content truncation based on available tokens
 */
export const optimizeContentTruncation = (
  content: string,
  systemInstruction: string,
  customInstructions: string,
  schemaDescription: string,
  maxTokens: number = 28000
): string => {
  const systemTokens = estimateTokens(systemInstruction);
  const customTokens = estimateTokens(customInstructions);
  const schemaTokens = estimateTokens(schemaDescription);
  const reservedTokens = systemTokens + customTokens + schemaTokens + 500;
  const availableTokens = maxTokens - reservedTokens;
  const maxContentChars = Math.min(availableTokens * 4, 6000);

  return truncateContent(content, maxContentChars);
};

/**
 * Format schema description for Chrome API prompt
 */
export const formatSchemaDescription = (responseSchema: unknown): string => {
  return JSON.stringify(responseSchema, null, 2);
};

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
