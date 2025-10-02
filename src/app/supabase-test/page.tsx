'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { motion } from 'framer-motion';
import { User, LogOut, Loader2 } from 'lucide-react';

export default function SupabaseTestPage() {
  const { user, session, loading, signInAnonymously, signOut } = useSupabaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignInAnonymously = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signInAnonymously();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setError(null);
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-4">
              Supabase Auth Test
            </h1>
            <p className="text-lg text-muted-foreground">
              Test anonymous authentication with Supabase
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={user ? 'default' : 'secondary'}>
                  {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
              </div>

              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {user.id}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Anonymous:</span>
                    <Badge variant={user.is_anonymous ? 'outline' : 'default'}>
                      {user.is_anonymous ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {user.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {session && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Session Expires:</span>
                      <span className="text-sm">
                        {new Date(session.expires_at! * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Button
                onClick={handleSignInAnonymously}
                disabled={isSigningIn || loading}
                size="lg"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Sign In Anonymously
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut || loading}
                variant="outline"
                size="lg"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Anonymous Authentication:</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Anonymous users can access your app without providing personal information</li>
              <li>They get a unique user ID and can store data associated with their session</li>
              <li>Anonymous sessions can be converted to permanent accounts later</li>
              <li>This is useful for temporary access or guest functionality</li>
            </ul>
          </div>
        </div>
      </motion.main>
    </>
  );
}