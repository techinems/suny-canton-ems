import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createDirectus, rest, authentication, readMe } from '@directus/sdk';

// Types for our auth context
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: unknown; // For any additional fields from Directus
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a type for API errors
interface ApiError {
  errors?: Array<{ message: string }>;
  message?: string;
  [key: string]: unknown;
}

// Create the Directus client
// Note: In a real app, you'd want to use environment variables for the URL
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://your-directus-url')
  .with(rest())
  .with(authentication());

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Check if we have an access token in localStorage before making the request
        const accessToken = localStorage.getItem('auth_token'); // Directus stores the token with this key
        if (!accessToken) {
          setUser(null);
          return;
        }
        
        const currentUser = await directus.request(readMe());
        if (currentUser) {
          // Cast currentUser to User type to fix assignment issue
          setUser(currentUser as unknown as User);
        }
      } catch {
        // User is not authenticated, clear any stale data
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Authenticate with Directus
      await directus.login(email, password);
      
      // If successful, get the user data
      const userData = await directus.request(readMe());
      setUser(userData as unknown as User);
    } catch (err: unknown) {
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to login';

      if (err instanceof Error) {
        // For standard Error objects
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle Directus API error response object
        const apiError = err as ApiError;
        if (apiError.errors && apiError.errors.length > 0) {
          errorMessage = apiError.errors[0].message || 'Authentication failed';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await directus.logout();
      setUser(null);
    } catch (err: unknown) {
      let errorMessage = 'Failed to logout';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Value provided to consuming components
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
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