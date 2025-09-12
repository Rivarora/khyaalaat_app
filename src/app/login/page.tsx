'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-8h-8.047C7.353,36.871,15.183,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.846,44,30.344,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(true);

  useEffect(() => {
    // If the user is already authenticated, redirect them away from the login page.
    if (!loading && user) {
      router.push('/admin/upload');
      return;
    }

    // When the page loads, check if it's the result of a redirect from Google.
    // This should only run once, and only if we aren't already loading a user.
    if (!loading && !user) {
        getRedirectResult(auth)
          .then((result) => {
            if (result) {
              // User has just signed in. The `onAuthStateChanged` listener in AuthProvider
              // will detect the new user and this component will re-render.
              // We'll be redirected by the effect hook above.
              // No need to set state here, as a redirect is imminent.
            } else {
              // No redirect result was found. This means the user has landed on the
              // login page without coming from Google. We can allow them to click the button.
              setIsSigningIn(false);
            }
          })
          .catch((error) => {
            // Handle errors from getRedirectResult, e.g., auth/unauthorized-domain
            console.error('Error during sign-in redirect:', error);
            // Allow user to try again.
            setIsSigningIn(false);
          });
    }
  }, [user, loading, router]);


  const handleSignIn = async () => {
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      // This will navigate away from the current page.
      await signInWithRedirect(auth, provider);
    } catch (error) {
      // This catch block might not even be reached if the redirect is successful,
      // but it's good practice to have it.
      console.error('Error starting sign-in with redirect:', error);
      setIsSigningIn(false);
    }
  };

  // Show a loading indicator while checking auth status or during the sign-in process.
  if (loading || isSigningIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Signing in...</p>
      </div>
    );
  }

  // If not loading and not signing in, show the login button.
  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-4">
              Admin Sign In
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Please sign in to manage your poetry portfolio.
            </p>
            <Button onClick={handleSignIn} size="lg" disabled={isSigningIn}>
              <GoogleIcon />
              Sign in with Google
            </Button>
          </div>
        </div>
      </motion.main>
    </>
  );
}
