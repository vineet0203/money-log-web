"use client";

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/queries/auth';
import { resetPasswordSchema } from '@/validations/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const resetPasswordMutation = useResetPassword();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!token) {
      setApiError('Missing reset token. Please request a new password reset link.');
      return;
    }

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
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
    const { password: validPassword } = validation.data;

    resetPasswordMutation.mutate(
      { token, newPassword: validPassword },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.error ||
            err.message ||
            'Failed to reset password. The link may have expired.';
          setApiError(message);
        },
      }
    );
  };

  const handleFieldChange = (field: string, setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
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
            Security & Account Access
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
              Security & Account Access
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
              Create a strong, unique password to safeguard your personal transactions, accounts, and financial records.
            </p>
          </div>

          {/* Right Column / Center: Form Card & Mobile Footer */}
          <div className="w-full max-w-lg mx-auto">
            {/* Fields Container (Form Card) */}
            <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
              {!token ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    This password reset link is invalid or incomplete. Please request a new link from the forgot password screen.
                  </p>
                  <Link href="/forgot-password">
                    <Button className="w-full h-11 text-sm font-semibold rounded-xl">
                      Request New Link
                    </Button>
                  </Link>
                </div>
              ) : !isSuccess ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a new password for your Money Log account
                    </p>
                  </div>

                  {apiError && (
                    <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleReset} noValidate className="space-y-4">
                    <div>
                      <Input
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={handleFieldChange('password', setPassword)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                        error={errors.password}
                        autoComplete="new-password"
                        disabled={resetPasswordMutation.isPending}
                      />
                    </div>

                    <div>
                      <Input
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={handleFieldChange('confirmPassword', setConfirmPassword)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        disabled={resetPasswordMutation.isPending}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold shadow-md rounded-xl mt-4"
                      isLoading={resetPasswordMutation.isPending}
                    >
                      Update Password
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Your password has been securely updated and all previous sessions have been logged out. You can now sign in with your new password.
                  </p>
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 text-base font-semibold shadow-md rounded-xl"
                  >
                    Proceed to Sign In
                  </Button>
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
                Create a strong, unique password to safeguard your personal transactions, accounts, and financial records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#159A1D] text-white font-medium">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
