import { NextRequest } from "next/server"
export function getBaseUrl(req: NextRequest) {
  // Check if the request is forwarded from a proxy
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  // If both headers are present, use them to construct the URL
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.url;
}

/**
 * Validates if a string is in email format
 * @param email The email string to validate
 * @returns boolean indicating if the email is valid
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Returns the plural or singular form of a word based on count
 * @param count The number of items
 * @param singular The singular form of the word
 * @param plural The plural form of the word (optional, defaults to singular + 's')
 * @returns The appropriate form of the word based on the count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}