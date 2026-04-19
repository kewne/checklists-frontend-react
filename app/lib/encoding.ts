/**
 * Encodes a URL to base64 for use in route parameters
 */
export function encodeApiUrl(url: string): string {
  return btoa(url);
}

/**
 * Decodes a base64-encoded URL from route parameters
 */
export function decodeApiUrl(encoded: string): string {
  try {
    return atob(encoded);
  } catch (error) {
    throw new Error(`Invalid encoded API URL: ${encoded}`, { cause: error });
  }
}
