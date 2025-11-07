import { DANGEROUS_PATTERNS } from '../../utils/securityPatterns';

export const sanitizeContent = (content: string): string => {
  let sanitized = content;
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[removed]');
  });

  return sanitized;
};

export const hashContent = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = content.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash.toString();
};

/**
 * Truncate content to a reasonable length for AI processing
 */
export const truncateContent = (
  content: string,
  maxLength: number = 5000
): string => {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to truncate at a sentence boundary
  const truncated = content.slice(0, maxLength - 3);
  const lastPunct = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('\n')
  );

  if (lastPunct > maxLength * 0.8) {
    return truncated.slice(0, lastPunct + 1);
  }

  return truncated + '...';
};

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Format a JSON schema object into a readable description string
 */
export const formatSchemaDescription = (schema: unknown): string => {
  try {
    return JSON.stringify(schema, null, 2);
  } catch {
    return String(schema);
  }
};
