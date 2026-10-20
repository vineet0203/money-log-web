"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { useRouter } from 'next/navigation';
import { useSendOtp } from '@/hooks/queries/auth';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const sendOtpMutation = useSendOtp();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError('Please enter a phone number');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setError('Please enter a valid phone number for the selected country');
      return;
    }

    sendOtpMutation.mutate(phone, {
      onSuccess: () => {
        router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
      }
    });
  };

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
            Easily cancel unwanted<br />subscriptions
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
            Subscription cancellation and tracking are just part of why we have over 186K 5-star ratings!
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl w-full max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Sign-in</h3>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="w-full max-w-4xl mx-auto flex justify-center border-b border-gray-200 focus-within:border-[#159A1D] transition-colors pb-1">
              <PhoneInput
                className="w-full flex justify-center"
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                defaultCountry="US"
                countries={['US', 'IN']}
                labels={{
                  US: '🇺🇸 United States (+1)',
                  IN: '🇮🇳 India (+91)',
                  ZZ: 'International'
                }}
                international
                countryCallingCodeEditable={false}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full shadow-md" disabled={sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
