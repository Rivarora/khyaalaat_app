'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { createUserDocument, getUserDocument } from '@/lib/users';
import type { User as UserDoc } from '@/lib/definitions';

type AuthContextType = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userDoc: null, 
  loading: true, 
  isAdmin: false 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Try to get existing user document
          let existingUser = await getUserDocument(firebaseUser.uid);
          
          // If no document exists, create one
          if (!existingUser) {
            existingUser = await createUserDocument(
              firebaseUser.uid,
              firebaseUser.email!,
              firebaseUser.displayName || 'Anonymous User'
            );
          }
          
          setUserDoc(existingUser);
        } catch (error) {
          console.error('Error handling user document:', error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userDoc?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
