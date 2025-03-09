import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check local storage for authentication status
        const isAuthenticated = localStorage.getItem('isAuthed');
        if (!isAuthenticated) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        // Use our new API route instead of Directus directly
        const response = await fetch('/api/user', {
          credentials: 'same-origin',
        });
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        if (data.user) {
          setUser(data.user as User);
        }
      } catch {
        // User is not authenticated
        setUser(null);
        localStorage.removeItem('isAuthed');
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
      
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      localStorage.setItem('isAuthed', 'true');
    } catch (err: unknown) {
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to login';

      if (err instanceof Error) {
        // For standard Error objects
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle API error response object
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

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use the API route for logout
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('isAuthed');
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