/**
 * URL detection utilities for text processing
 */

export const URL_REGEX =
  /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;

/**
 * Checks if a text string contains a URL
 * @param text - The text to check for URLs
 * @returns true if the text contains a URL, false otherwise
 */
export const containsURL = (text: string): boolean => {
  return new RegExp(URL_REGEX).test(text);
};
