'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

export default function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuth(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (user.email !== 'arorariva19@gmail.com') {
          router.push('/');
        }
      }
    }, [user, loading, router]);

    if (loading || !user || user.email !== 'arorariva19@gmail.com') {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4 text-lg">Verifying authorization...</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
