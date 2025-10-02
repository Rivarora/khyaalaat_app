
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { AppUser } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface EmailAuthFormProps {
  isSignUp: boolean;
  onSuccess: (user: AppUser) => void;
  onError: (error: string) => void;
  setPending: (isPending: boolean) => void;
}

export function EmailAuthForm({
  isSignUp,
  onSuccess,
  onError,
  setPending,
}: EmailAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPending(true);
    onError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName } },
        });
        if (error) throw error;
        if (data.user) {
          onSuccess({
            uid: data.user.id,
            email: data.user.email ?? null,
            displayName: data.user.user_metadata?.full_name ?? null,
            photoURL: data.user.user_metadata?.avatar_url ?? null,
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          onSuccess({
            uid: data.user.id,
            email: data.user.email ?? null,
            displayName: data.user.user_metadata?.full_name ?? null,
            photoURL: data.user.user_metadata?.avatar_url ?? null,
          });
        }
      }
    } catch (error: any) {
      onError(error.message ?? 'Authentication error');
    } finally {
      setLoading(false);
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              required
              disabled={loading}
            />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
