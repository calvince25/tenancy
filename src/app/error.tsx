'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-50">
          <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center text-destructive">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-3xl font-bold text-primary tracking-tight">Critical Application Error</h2>
            <p className="text-muted-foreground font-medium">
              NestSync encountered a critical client-side exception that prevented the page from rendering.
            </p>
            {error.message && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-muted/30 text-xs font-mono text-left overflow-auto max-h-40 shadow-sm">
                <p className="font-bold text-destructive mb-1">Error Details:</p>
                {error.message}
              </div>
            )}
          </div>
          <Button 
            onClick={() => reset()} 
            className="bg-primary text-white px-8 h-12 rounded-xl font-bold"
          >
            Refresh Application
          </Button>
        </div>
      </body>
    </html>
  );
}
