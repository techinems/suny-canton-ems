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