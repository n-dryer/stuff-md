/**
 * Input validation utilities for user inputs
 */

import { hasDangerousPatterns } from './securityPatterns';

const NOTE_MAX_LENGTH = 100000;
const AI_CONTENT_MIN_LENGTH = 10;
const AI_CONTENT_MAX_LENGTH = 50000;

/**
 * Validate note content for saving
 */
export const validateNoteContent = (content: string): string => {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    throw new Error('Note content cannot be empty.');
  }

  if (trimmed.length > NOTE_MAX_LENGTH) {
    throw new Error(
      `Note content cannot exceed ${NOTE_MAX_LENGTH} characters. You have ${trimmed.length} characters.`
    );
  }

  if (hasDangerousPatterns(trimmed)) {
    throw new Error(
      'Note content contains potentially unsafe patterns. Please remove system commands or dangerous content.'
    );
  }

  return trimmed;
};

/**
 * Validate content for AI processing
 */
export const validateContentForAI = (content: string): string => {
  const trimmed = content.trim();

  if (trimmed.length < AI_CONTENT_MIN_LENGTH) {
    throw new Error(
      `Content must be at least ${AI_CONTENT_MIN_LENGTH} characters for AI processing.`
    );
  }

  if (trimmed.length > AI_CONTENT_MAX_LENGTH) {
    throw new Error(
      `Content cannot exceed ${AI_CONTENT_MAX_LENGTH} characters for AI processing.`
    );
  }

  if (hasDangerousPatterns(trimmed)) {
    throw new Error(
      'Content contains potentially unsafe patterns that cannot be processed by AI.'
    );
  }

  return trimmed;
};

export const validateCustomInstructions = (
  instructions: string,
  maxLength: number = 2000
): string => {
  const trimmed = instructions.trim();

  if (trimmed.length === 0) {
    throw new Error('Custom instructions cannot be empty.');
  }

  if (trimmed.length > maxLength) {
    throw new Error(
      `Custom instructions cannot exceed ${maxLength} characters. You have ${trimmed.length} characters.`
    );
  }

  if (hasDangerousPatterns(trimmed)) {
    throw new Error(
      'Custom instructions contain potentially unsafe patterns. Please remove system commands or role-playing instructions.'
    );
  }

  return trimmed;
};
