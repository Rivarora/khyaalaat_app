'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Header } from '@/components/header';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { EmailAuthForm } from './email-auth-form';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.email === 'arorariva19@gmail.com') {
        router.push('/admin/upload');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

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
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-2">
                Welcome
              </h1>
              <p className="text-muted-foreground">
                Sign in or create an account to get started.
              </p>
            </div>

            <EmailAuthForm />
          </div>
        </div>
      </motion.main>
    </>
  );
}