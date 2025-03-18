import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Create a new PocketBase instance for server-side operations
// This ensures each request gets its own instance to prevent auth store contamination
export async function createPocketBaseServer() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
  
  // Load auth store from cookies if available
  const cookieStore = await cookies();
  const pbAuthCookie = cookieStore.get('pb_auth');
  
  if (pbAuthCookie) {
    try {
      const cookieString = pbAuthCookie.name + '=' + pbAuthCookie.value;
      pb.authStore.loadFromCookie(cookieString);
    } catch {
      // If there's an error parsing the cookie, clear the auth store
      pb.authStore.clear();
    }
  }
  
  return pb;
}