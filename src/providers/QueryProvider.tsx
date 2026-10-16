"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { X } from 'lucide-react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Prevent mouse wheel / trackpad scroll from changing number input values globally
    const handleWheel = (e: WheelEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.type === 'number') {
        if (document.activeElement === target) {
          // Immediately blur the number input so the browser does not step the value,
          // while allowing the wheel event to smoothly scroll the page/container.
          target.blur();
        }
      }
    };

    // 2. Prevent ArrowUp and ArrowDown keys from changing number input values globally
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
        e.target instanceof HTMLInputElement &&
        e.target.type === 'number'
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { capture: true, passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data is fresh for 1 minute
            retry: (failureCount, error: unknown) => {
              // Never retry on 401 Unauthorized or 403 Forbidden
              const axiosError = error as { response?: { status?: number } };
              const status = axiosError?.response?.status;
              if (status === 401 || status === 403) {
                return false;
              }
              // Only retry once on other errors
              return failureCount < 1;
            },
            refetchOnWindowFocus: false, // Don't refetch automatically on window focus to save backend load
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={20000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        action={(snackbarId) => (
          <button onClick={() => closeSnackbar(snackbarId)} className="text-white hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        )}
      >
        {children}
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
