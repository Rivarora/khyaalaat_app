'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signOut: async () => {},
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
});

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  // Demo mode - no real authentication
  const signOut = async () => {
    console.log('Demo mode: Sign out');
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Demo mode: Sign in with', email);
    return {};
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('Demo mode: Sign up with', email, name);
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user: null,
        profile: null,
        loading: false,
        signOut,
        signInWithEmail,
        signUpWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};