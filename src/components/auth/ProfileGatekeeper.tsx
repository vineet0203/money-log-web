"use client";

import { useEffect } from 'react';
import { useGetProfile } from '@/hooks/queries/user';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/axios';

export function ProfileGatekeeper({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading, isError, error, refetch } = useGetProfile();

  // Immediately logout if unauthenticated (401) or user account no longer exists in database (404)
  useEffect(() => {
    if (isError && error) {
      const axiosError = error as { response?: { status?: number } };
      const status = axiosError.response?.status;
      if (status === 401 || status === 404) {
        logoutUser('Profile verification failed: unauthorized or account not found');
      }
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#159A1D]" />
      </div>
    );
  }

  // If an API error occurred (and not 401/404 which automatically logs out)
  if (isError) {
    const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Unable to connect to the server. Please check your internet connection and try again.';

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">{errorMessage}</p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Button
            variant="outline"
            className="text-white border-slate-700 hover:bg-slate-800"
            onClick={() => logoutUser('User clicked logout from error screen')}
          >
            Log out
          </Button>
        </div>
      </div>
    );
  }

  // Prevent flash of content before the redirect physically happens
  if (profile && !profile.name) {
    return (
      <div className="min-h-screen w-full bg-[#0F172A]" />
    );
  }

  return <>{children}</>;
}
