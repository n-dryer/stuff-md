export const DANGEROUS_PATTERNS = [
  /(?:ignore|forget|system|assistant|user):/gi,
  /```(?:system|user|assistant)/gi,
  /\[INST\]|\[\/INST\]/gi,
  /<\|im_start\|>|<\|im_end\|>/gi,
  /(?:you are|act as|pretend to be)/gi,
];

export const hasDangerousPatterns = (content: string): boolean => {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(content));
};
