'use client'
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabaseClient';

import { useRouter } from 'next/navigation';

function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />;

  if (user) {
    return (
      <Button onClick={handleLogout} variant="ghost">
        Logout
      </Button>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-headline font-bold">Khyaalaat</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/request">Request a Poem</Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/requests">View Requests</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-4">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
