"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | undefined>();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      router.push('/verify-otp');
    }
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
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Sign-in</h3>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="w-full border-b border-gray-200 focus-within:border-[#159A1D] transition-colors pb-1">
              <PhoneInput
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                defaultCountry="US"
                international
                countryCallingCodeEditable={false}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full shadow-md">
                Login
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
