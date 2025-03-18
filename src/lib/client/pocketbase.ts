'use client';
import PocketBase from 'pocketbase';

// Create a singleton PocketBase client for client-side operations
export const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

// Disable autocancellation for now as it's a bit funky in dev
pb.autoCancellation(false);


// This keeps the cookie in sync with the JWT so we can do things on the Next.Js server such as middleware
pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
})

// Helper to check if a user is authenticated
export const isAuthenticated = () => {
  return pb.authStore.isValid;
};

// Get the current user data
export const getCurrentUser = () => {
  return pb.authStore.isValid ? pb.authStore.record : null;
};