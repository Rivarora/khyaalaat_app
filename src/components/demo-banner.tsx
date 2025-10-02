'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function DemoBanner() {
  // Check if we're in demo mode
  const isDemoMode = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo') ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('demo');

  if (!isDemoMode) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800 mb-6">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode:</strong> This app is running with sample data. 
        To enable full functionality, please set up your Supabase credentials. 
        Check the <code>SUPABASE_MIGRATION.md</code> file for setup instructions.
      </AlertDescription>
    </Alert>
  );
}