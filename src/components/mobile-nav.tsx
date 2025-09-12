'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, PenSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-2">
        <Button
          variant="ghost"
          asChild
          className={cn(
            'h-full rounded-none text-muted-foreground',
            pathname === '/request' && 'bg-accent text-accent-foreground'
          )}
        >
          <Link href="/request">
            <div className="flex flex-col items-center gap-1">
              <PenSquare />
              <span className="text-xs">Request</span>
            </div>
          </Link>
        </Button>
        <Button
          variant="ghost"
          asChild
          className={cn(
            'h-full rounded-none text-muted-foreground',
            pathname === '/requests' && 'bg-accent text-accent-foreground'
          )}
        >
          <Link href="/requests">
            <div className="flex flex-col items-center gap-1">
              <FileText />
              <span className="text-xs">View Requests</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
