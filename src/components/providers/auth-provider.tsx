'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const mapUser = (u: any): AppUser | null => {
      if (!u) return null;
      const metadata = u.user_metadata ?? {};
      return {
        uid: u.id,
        email: u.email ?? null,
        displayName: metadata.full_name ?? metadata.displayName ?? metadata.name ?? null,
        photoURL: metadata.avatar_url ?? metadata.picture ?? null,
      };
    };

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(mapUser(data.session?.user));
      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
