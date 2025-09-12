
'use client';

import { useRouter } from 'next/navigation';
import { getRedirectResult, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/providers/auth-provider';
import { Header } from '@/components/header';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EmailAuthForm } from './email-auth-form';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin/upload');
    }
  }, [user, loading, router]);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User is available in the useAuth hook if redirect was successful
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
        setAuthError(error.message);
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  }, []);

  const onAuthSuccess = (user: User) => {
    router.push('/admin/upload');
  };

  const onAuthError = (error: string) => {
    setAuthError(error);
  };

  if (loading || isSigningIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto px-4 py-8 pt-24"
        >
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-sm">
              <div className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-2">
                  Admin Sign In
                </h1>
                <p className="text-muted-foreground">
                  Sign in to manage your poetry portfolio.
                </p>
              </div>

              <EmailAuthForm
                onSuccess={onAuthSuccess}
                onError={onAuthError}
                setPending={setIsSigningIn}
              />
              
              {authError && (
                <p className="text-destructive text-center text-sm mt-4">{authError}</p>
              )}
            </div>
          </div>
        </motion.main>
      </>
    );
  }
  
  return null;
}
