"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCompleteProfile } from '@/hooks/queries/auth';
import { useGetProfile } from '@/hooks/queries/user';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const completeProfileMutation = useCompleteProfile();

  useEffect(() => {
    // If the user already has a name set, their profile is complete
    if (profile?.name) {
      router.push('/dashboard');
    }
  }, [profile, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Full Name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    completeProfileMutation.mutate({ name: trimmedName, email: trimmedEmail }, {
        onSuccess: () => router.push('/dashboard'),
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to complete profile. Please try again.')
      });
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#159A1D]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#159A1D]">
      {/* Background Image */}
      <div 
        className="absolute inset-x-0 bottom-0 top-[15%] pointer-events-none"
        style={{
          backgroundImage: 'url(/auth_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.2
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Branding and Copy */}
        <div className="flex flex-col text-white">
          <div className="flex items-center gap-4 mb-12">
            <Image 
              src="/logo/logo.png" 
              alt="Moneylog Logo" 
              width={64} 
              height={64} 
              className="brightness-0 invert object-contain"
            />
            <Image 
              src="/logo/logo_text.png" 
              alt="Moneylog" 
              width={180} 
              height={45} 
              className="brightness-0 invert object-contain"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Welcome to Moneylog!<br />Let's get started.
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="font-semibold text-lg">186K+ Ratings</span>
          </div>

          <p className="text-lg md:text-xl text-green-50 max-w-lg leading-relaxed">
            Please complete your profile to unlock all features, including tracking your net worth and managing your subscriptions.
          </p>
        </div>

        {/* Right Side: Setup Form */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete Profile</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-gray-200 focus:border-[#159A1D] outline-none transition-colors pb-2 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-200 focus:border-[#159A1D] outline-none transition-colors pb-2 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full shadow-md" disabled={completeProfileMutation.isPending || !name.trim() || !email.trim()}>
                {completeProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Dashboard'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
