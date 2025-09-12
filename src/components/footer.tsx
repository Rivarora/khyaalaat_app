import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t mt-auto py-6">
      <div className="container mx-auto flex justify-center items-center px-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/upload">Admin</Link>
        </Button>
      </div>
    </footer>
  );
}
