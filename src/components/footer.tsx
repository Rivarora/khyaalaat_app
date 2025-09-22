'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from './providers/auth-provider';
import { Github } from 'lucide-react';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t mt-auto py-6">
      <div className="container mx-auto flex justify-center items-center px-4 gap-4">
        {user && (
          <Button variant="ghost" asChild>
            <Link href="/admin/upload">Admin</Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" asChild>
          <Link href="https://github.com/" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </Button>
      </div>
    </footer>
  );
}
