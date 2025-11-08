'use client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authClient, useSession } from '@/lib/auth-client';

// Types for our auth context
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
}

interface AdditionalUserData {
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  dob?: Date;
  cantonEmail?: string;
  position?: string;
  major?: string;
  cantonCardId?: string;
  gpa?: number;
  phoneNumber?: string;
  medicalLevel?: string;
  housingType?: string;
  building?: string;
  roomNumber?: number;
  homeAddress?: string;
  localAddress?: string;
  shirtSize?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string, additionalData?: AdditionalUserData) => Promise<void>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Use Better Auth's useSession hook
  const { data: session, isPending: isLoading } = useSession();
  
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
    isAdmin: Boolean((session.user as { isAdmin?: boolean }).isAdmin),
  } : null;

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      
      const result = await authClient.signIn.email({
        email,
        password,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Navigate to dashboard on successful login
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Failed to login';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string, additionalData?: AdditionalUserData) => {
    try {
      setError(null);
      
      const result = await authClient.signUp.email({
        email,
        password,
        name: name || '',
        ...additionalData,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Navigate to dashboard on successful registration
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Failed to register';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      
      await authClient.signOut();
      
      // Navigate to login page after logout
      router.push('/login');
    } catch (err: unknown) {
      let errorMessage = 'Failed to logout';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  }, [router]);

  // Value provided to consuming components
  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
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