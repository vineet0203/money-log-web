"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetProfile } from '@/hooks/queries/user';
import { Loader2 } from 'lucide-react';

export function ProfileGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profile, isLoading } = useGetProfile();

  useEffect(() => {
    // If the query finishes and there's no name, redirect to complete-profile
    if (!isLoading && profile && !profile.name) {
      router.replace('/complete-profile');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#159A1D]" />
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
