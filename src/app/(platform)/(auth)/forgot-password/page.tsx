"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForgotPassword } from '@/hooks/queries/auth';
import { forgotPasswordSchema } from '@/validations/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const { email: validEmail } = validation.data;

    forgotPasswordMutation.mutate(validEmail, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.error ||
          err.message ||
          'Failed to send reset link. Please try again.';
        setApiError(message);
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
            Account Recovery
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Desktop Left Column: Branding and Copy (Hidden on small screens) */}
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
              Account Recovery
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
              Don't worry — it happens to the best of us. We'll send you secure instructions to regain access in minutes.
            </p>
          </div>

          {/* Right Column / Center: Form Card & Mobile Footer */}
          <div className="w-full max-w-lg mx-auto">
            {/* Fields Container (Form Card) */}
            <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your registered email and we'll send you a password reset link
                    </p>
                  </div>

                  {apiError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.email;
                              return next;
                            });
                          }
                        }}
                        leftIcon={<Mail className="w-4 h-4" />}
                        error={errors.email}
                        autoComplete="email"
                        disabled={forgotPasswordMutation.isPending}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold shadow-md rounded-xl mt-2"
                      isLoading={forgotPasswordMutation.isPending}
                    >
                      Send Reset Link
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    If an account exists for <strong className="text-gray-900">{email}</strong>, we have sent instructions to reset your password. The link will expire in 15 minutes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full h-11 text-sm font-semibold rounded-xl mb-3"
                  >
                    Try another email
                  </Button>
                  <Link href="/login" className="block text-sm font-bold text-[#159A1D] hover:underline">
                    Return to Sign In
                  </Link>
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
                Don't worry — it happens to the best of us. We'll send you secure instructions to regain access in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
