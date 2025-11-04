/**
 * URL validation utilities for secure URL handling
 */

/**
 * Allowed URL schemes for safe linking
 */
const ALLOWED_SCHEMES = ['http', 'https'];

/**
 * Dangerous URL schemes that should be rejected
 */
const DANGEROUS_SCHEMES = ['javascript', 'data', 'vbscript', 'file', 'about'];

/**
 * Validates if a URL is safe to use as a link
 * @param url The URL to validate
 * @returns True if the URL is safe, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    // Check for dangerous schemes
    const lowerUrl = url.toLowerCase().trim();
    
    for (const scheme of DANGEROUS_SCHEMES) {
      if (lowerUrl.startsWith(`${scheme}:`)) {
        return false;
      }
    }

    // Try to parse as URL (handles both absolute and relative URLs)
    let parsedUrl: URL;
    
    // If it doesn't start with http/https, try adding https://
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
      parsedUrl = new URL(`https://${url}`);
    } else {
      parsedUrl = new URL(url);
    }

    // Verify the scheme is allowed
    const scheme = parsedUrl.protocol.slice(0, -1).toLowerCase(); // Remove trailing ':'
    if (!ALLOWED_SCHEMES.includes(scheme)) {
      return false;
    }

    // Additional validation: ensure hostname is valid
    if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
      return false;
    }

    // Reject localhost and private IP ranges in production (optional)
    // if (process.env.NODE_ENV === 'production') {
    //   if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
    //     return false;
    //   }
    // }

    return true;
  } catch {
    // URL parsing failed, consider invalid
    return false;
  }
};

/**
 * Sanitizes and normalizes a URL for safe use
 * @param url The URL to sanitize
 * @returns Sanitized URL with https:// prefix if needed, or null if invalid
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!isValidUrl(url)) {
    return null;
  }

  try {
    // Normalize the URL
    let normalizedUrl = url.trim();
    
    // Add https:// if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const parsedUrl = new URL(normalizedUrl);
    
    // Force HTTPS for security
    if (parsedUrl.protocol === 'http:') {
      parsedUrl.protocol = 'https:';
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
};

