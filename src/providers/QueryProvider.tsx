"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { X } from 'lucide-react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data is fresh for 1 minute
            retry: 1, // Only retry failed requests once by default
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
