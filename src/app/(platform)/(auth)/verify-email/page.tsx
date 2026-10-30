"use client";

import React, { Suspense, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MailCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyEmailOtp, useResendEmailOtp } from '@/hooks/queries/auth';
import { verifyOtpSchema } from '@/validations/auth';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyOtpMutation = useVerifyEmailOtp();
  const resendOtpMutation = useResendEmailOtp();

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];

    if (cleaned.length > 1) {
      handlePasteString(cleaned);
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError(null);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    handlePasteString(pastedData);
  };

  const handlePasteString = (data: string) => {
    const digits = data.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtp(newOtp);
    setError(null);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('');
    const validation = verifyOtpSchema.safeParse({ otp: fullOtp });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setError('Missing email address. Please return to sign in.');
      return;
    }

    verifyOtpMutation.mutate(
      { email, otp: fullOtp },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.error ||
            err.message ||
            'Verification failed. Please check the code and try again.';
          setError(message);
        },
      }
    );
  };

  const handleResend = () => {
    if (resendCooldown > 0 || resendOtpMutation.isPending) return;
    setError(null);
    setResendSuccess(null);

    resendOtpMutation.mutate(email, {
      onSuccess: () => {
        setResendSuccess('A new 6-digit verification code has been sent to your email.');
        setResendCooldown(60);
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.error ||
          err.message ||
          'Failed to resend code. Please try again.';
        setError(message);
      },
    });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden bg-[#159A1D] py-8 sm:py-12">
      {/* Background Pattern */}
      <div
        className="absolute inset-x-0 bottom-0 top-[15%] pointer-events-none"
        style={{
          backgroundImage: 'url(/auth_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.2,
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Mobile Header (Visible only on small screens < lg) */}
        <div className="flex flex-col items-center text-center lg:hidden mb-6 text-white">
          <Link href="/" className="inline-flex items-center gap-3 mb-3">
            <Image
              src="/logo/logo.png"
              alt="Moneylog Logo"
              width={48}
              height={48}
              className="brightness-0 invert object-contain"
              priority
            />
            <Image
              src="/logo/logo_text.png"
              alt="Moneylog"
              width={140}
              height={36}
              className="brightness-0 invert object-contain"
              priority
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Verify Your Email
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Desktop Left Column: Branding (Hidden on small screens) */}
          <div className="hidden lg:flex flex-col text-white">
            <Link href="/" className="inline-flex items-center gap-4 mb-10 w-fit">
              <Image
                src="/logo/logo.png"
                alt="Moneylog Logo"
                width={64}
                height={64}
                className="brightness-0 invert object-contain"
                priority
              />
              <Image
                src="/logo/logo_text.png"
                alt="Moneylog"
                width={180}
                height={45}
                className="brightness-0 invert object-contain"
                priority
              />
            </Link>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
              Verify Your Email
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-[#FFD700]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-lg">186K+ Ratings</span>
            </div>

            <p className="text-lg text-green-50 max-w-lg leading-relaxed">
              We prioritize your account security. Please verify your email address with the 6-digit code we just sent to your inbox.
            </p>
          </div>

          {/* Right Column / Center: Form Card & Mobile Footer */}
          <div className="w-full max-w-lg mx-auto">
            {/* Fields Container (Form Card) */}
            <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
              {!isSuccess ? (
                <>
                  <div className="mb-6">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </Link>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <MailCheck className="w-6 h-6" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Check Your Inbox</h2>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      We've sent a 6-digit verification code to{' '}
                      <strong className="text-gray-900 font-semibold">{email || 'your email'}</strong>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  {resendSuccess && (
                    <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                      {resendSuccess}
                    </div>
                  )}

                  <form onSubmit={handleVerify} noValidate className="space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-3 text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              inputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            onPaste={idx === 0 ? handlePaste : undefined}
                            className={`w-10 sm:w-13 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-white shadow-xs transition-all focus:outline-none focus:ring-2 ${
                              error
                                ? 'border-rose-500 focus:ring-rose-500/20'
                                : 'border-slate-200 focus:border-[#159A1D] focus:ring-[#159A1D]/20 text-slate-900'
                            }`}
                            disabled={verifyOtpMutation.isPending}
                            autoFocus={idx === 0}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold shadow-md rounded-xl"
                      isLoading={verifyOtpMutation.isPending}
                    >
                      Verify Email
                    </Button>

                    <div className="flex flex-col items-center justify-center gap-3 pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || resendOtpMutation.isPending}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#159A1D] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${resendOtpMutation.isPending ? 'animate-spin' : ''}`} />
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : 'Resend verification code'}
                      </button>

                      <p className="text-xs text-gray-500">
                        Did not receive the code? Please check your Spam or Junk folder.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Your email has been verified successfully. Redirecting you to your dashboard...
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Footer: Ratings and Description Text (Visible only on small screens < lg) */}
            <div className="flex flex-col items-center text-center lg:hidden mt-6 text-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex text-[#FFD700]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold text-sm">186K+ Ratings</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100 max-w-sm leading-relaxed">
                We prioritize your account security. Please verify your email address with the 6-digit code we just sent to your inbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#159A1D] text-white font-medium">
          Loading...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
