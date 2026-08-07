"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/ui/otp-input';
import { useVerifyOtp, useSendOtp } from '@/hooks/queries/auth';
import { Suspense } from 'react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState<string | null>(null);

  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();

  useEffect(() => {
    if (!phone) {
      router.push('/login');
    }
  }, [phone, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    if (timeLeft === 0 && phone) {
      setError(null);
      sendOtpMutation.mutate(phone, {
        onSuccess: () => setTimeLeft(120),
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to resend code.')
      });
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && phone) {
      setError(null);
      verifyOtpMutation.mutate({ phone, code: otp }, {
        onSuccess: (data: any) => {
          if (data.isProfileComplete) {
            router.push('/dashboard');
          } else {
            router.push('/complete-profile');
          }
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || 'Invalid code. Please try again.');
        }
      });
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
            Secure your<br />account
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="font-semibold text-lg">Trusted Verification</span>
          </div>

          <p className="text-lg md:text-xl text-green-50 max-w-lg leading-relaxed">
            Please enter the 6-digit code sent to your phone to securely access your subscriptions and tracking.
          </p>
        </div>

        {/* Right Side: OTP Form */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl w-full max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h3>
          <p className="text-sm text-gray-500 mb-8">We&apos;ve sent a 6-digit code to your phone number.</p>
          
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="w-full flex justify-center pb-2">
              <OTPInput value={otp} onChange={setOtp} autoFocus length={6} />
            </div>

            <div className="pt-2">
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full shadow-md"
                disabled={otp.length !== 6 || verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            {timeLeft > 0 ? (
              <>
                Resend code in <span className="font-semibold text-[#159A1D]">{timeLeft}s</span>
              </>
            ) : (
              <>
                Didn&apos;t receive code?{' '}
                  <button 
                    onClick={handleResend} 
                    type="button" 
                    disabled={sendOtpMutation.isPending}
                    className="font-semibold text-[#159A1D] hover:underline focus:outline-none disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending ? 'Resending...' : 'Resend'}
                  </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#159A1D]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
