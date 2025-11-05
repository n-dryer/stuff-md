/**
 * Input validation utilities for user inputs
 */

/**
 * Validates and sanitizes note content
 * @param content The content to validate
 * @param maxLength Maximum allowed length (default: 1MB in characters)
 * @returns Validated and trimmed content, or throws error if invalid
 */
export const validateNoteContent = (
  content: string,
  maxLength: number = 1_000_000
): string => {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    throw new Error('Content cannot be empty');
  }

  if (trimmed.length > maxLength) {
    throw new Error(
      `Content exceeds maximum length of ${maxLength} characters`
    );
  }

  return trimmed;
};

/**
 * Validates and sanitizes title
 * @param title The title to validate
 * @param maxLength Maximum allowed length (default: 200)
 * @returns Validated and trimmed title, or throws error if invalid
 */
export const validateTitle = (
  title: string,
  maxLength: number = 200
): string => {
  if (typeof title !== 'string') {
    throw new Error('Title must be a string');
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    throw new Error('Title cannot be empty');
  }

  if (trimmed.length > maxLength) {
    throw new Error(`Title exceeds maximum length of ${maxLength} characters`);
  }

  return trimmed;
};

/**
 * Validates and sanitizes custom instructions
 * @param instructions The instructions to validate
 * @param maxLength Maximum allowed length (default: 2000)
 * @returns Validated and trimmed instructions, or throws error if invalid
 */
export const validateCustomInstructions = (
  instructions: string,
  maxLength: number = 2000
): string => {
  if (typeof instructions !== 'string') {
    throw new Error('Instructions must be a string');
  }

  const trimmed = instructions.trim();

  if (trimmed.length > maxLength) {
    throw new Error(
      `Instructions exceed maximum length of ${maxLength} characters`
    );
  }

  const dangerousPatterns = [
    /(?:ignore|forget|system|assistant|user):/gi,
    /```(?:system|user|assistant)/gi,
    /\[INST\]|\[\/INST\]/gi,
    /<\|im_start\|>|<\|im_end\|>/gi,
    /(?:you are|act as|pretend to be)/gi,
  ];

  const hasInjection = dangerousPatterns.some(pattern => pattern.test(trimmed));
  if (hasInjection) {
    throw new Error(
      'Custom instructions contain potentially unsafe patterns. Please remove system commands or role-playing instructions.'
    );
  }

  return trimmed;
};

/**
 * Detect spam patterns in content
 */
const detectSpam = (content: string): boolean => {
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
 * Validates content for AI processing (stricter limits than storage)
 * @param content The content to validate
 * @param maxLength Maximum allowed length (default: 50KB)
 * @returns Validated content, or throws error if invalid
 */
export const validateContentForAI = (
  content: string,
  maxLength: number = 50_000
): string => {
  const validated = validateNoteContent(content, maxLength);

  if (detectSpam(validated)) {
    throw new Error(
      'Content appears to be spam or contains excessive repetition'
    );
  }

  return validated;
};

/**
 * Validates search query
 * @param query The search query to validate
 * @param maxLength Maximum allowed length (default: 500)
 * @returns Validated and trimmed query
 */
export const validateSearchQuery = (
  query: string,
  maxLength: number = 500
): string => {
  if (typeof query !== 'string') {
    return '';
  }

  const trimmed = query.trim();

  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
};

/**
 * Validates tag name
 * @param tag The tag to validate
 * @param maxLength Maximum allowed length (default: 50)
 * @returns Validated and trimmed tag, or throws error if invalid
 */
export const validateTag = (tag: string, maxLength: number = 50): string => {
  if (typeof tag !== 'string') {
    throw new Error('Tag must be a string');
  }

  const trimmed = tag.trim().toLowerCase();

  if (trimmed.length === 0) {
    throw new Error('Tag cannot be empty');
  }

  if (trimmed.length > maxLength) {
    throw new Error(`Tag exceeds maximum length of ${maxLength} characters`);
  }

  // Sanitize tag: only alphanumeric, spaces, hyphens, underscores
  const sanitized = trimmed.replace(/[^a-z0-9\s\-_]/g, '');

  if (sanitized.length === 0) {
    throw new Error('Tag contains only invalid characters');
  }

  return sanitized;
};
