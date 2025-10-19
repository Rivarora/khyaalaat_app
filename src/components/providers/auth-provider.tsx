'use client';


import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';


type AuthContextType = {
  user: any | null;
  loading: boolean;
};


const AuthContext = createContext<AuthContextType>({ user: null, loading: true });


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return; // no-op on server
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting supabase session:', err);
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setUser(session?.user ?? null);
      } catch (e) {
        console.error('Error handling auth state change:', e);
      }
    });

    return () => {
      mounted = false;
      try {
        listener.subscription.unsubscribe();
      } catch (e) {
        // swallow unsubscribe errors
      }
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
