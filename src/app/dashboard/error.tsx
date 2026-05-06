'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center text-destructive">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground font-medium">
          We encountered a client-side exception. This might be due to a hydration mismatch or data inconsistency.
        </p>
        {error.message && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-muted/30 text-xs font-mono text-left overflow-auto max-h-40">
            <p className="font-bold text-destructive mb-1">Error Trace:</p>
            {error.message}
            {error.stack && <div className="mt-2 text-slate-400 whitespace-pre-wrap">{error.stack}</div>}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-primary text-white px-8 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <RefreshCcw className="w-4 h-4" /> Try again
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="px-8 h-12 rounded-xl font-bold"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
