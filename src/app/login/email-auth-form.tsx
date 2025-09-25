
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface EmailAuthFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
  setPending: (isPending: boolean) => void;
}

const ALLOWED_EMAIL = 'arorariva19@gmail.com';

export function EmailAuthForm({ onSuccess, onError, setPending }: EmailAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPending(true);
    onError(''); // Clear previous errors

    if (email.toLowerCase() !== ALLOWED_EMAIL) {
      onError('Access is restricted. Please use the authorized email address.');
      setLoading(false);
      setPending(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onSuccess(userCredential.user);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </div>
  );
}
