import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { pb, isAuthenticated, getCurrentUser } from '../../lib/client/pocketbase';

// Types for our auth context
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Use PocketBase's authStore to check authentication status
        if (!isAuthenticated()) {
          setUser(null);
          return;
        }
        
        // Get user data from PocketBase auth store
        const pbUser = getCurrentUser();
        if (pbUser) {
          // Transform PocketBase user to match our User interface
          // Avoid duplicate properties by using spread for additional fields
          setUser({
            id: pbUser.id,
            email: pbUser.email,
            first_name: pbUser.first_name,
            last_name: pbUser.last_name,
            role: pbUser.role,
          });
        } else {
          setUser(null);
        }
      } catch {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use PocketBase authentication
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      if (authData && authData.record) {
        // Transform PocketBase user to match our User interface
        const pbUser = authData.record;
        setUser({
          id: pbUser.id,
          email: pbUser.email,
          first_name: pbUser.first_name,
          last_name: pbUser.last_name,
          role: pbUser.role
        });
        
        // Navigate to dashboard on successful login
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to login';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle PocketBase error response
        const pbError = err as { message?: string; data?: { message?: string } };
        if (pbError.message) {
          errorMessage = pbError.message;
        } else if (pbError.data?.message) {
          errorMessage = pbError.data.message;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use PocketBase logout
      pb.authStore.clear();
      setUser(null);
      
      // Navigate to login page after logout
      router.push('/login');
    } catch (err: unknown) {
      let errorMessage = 'Failed to logout';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Value provided to consuming components
  const value = {
    user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook that shorthands the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}