import React, { createContext, useContext, useCallback, ReactNode } from 'react';

import { authClient } from '@/lib/auth-client';
import { uiLogger } from '@/lib/loggers';

interface AuthContextType {
  user: { id: string; email: string; name: string; image?: string | null } | null;
  isAuthenticated: boolean;
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  const user = (session.data?.user as AuthContextType['user']) ?? null;
  const isAuthenticated = !!user;
  const isPending = session.isPending;

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        uiLogger.error('Sign in failed:', result.error.message);
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (error) {
      uiLogger.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) {
        uiLogger.error('Sign up failed:', result.error.message);
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (error) {
      uiLogger.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      uiLogger.error('Sign out error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isPending, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
