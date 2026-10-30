"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/queries/auth';
import { loginSchema } from '@/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = loginSchema.safeParse({ email, password });
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
    const { email: validEmail, password: validPassword } = validation.data;

    loginMutation.mutate(
      { email: validEmail, password: validPassword },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err: any) => {
          const resData = err.response?.data;
          if (resData?.requiresEmailVerification) {
            router.push(`/verify-email?email=${encodeURIComponent(validEmail)}`);
            return;
          }

          const message =
            resData?.error ||
            err.message ||
            'Invalid email or password. Please try again.';
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
            Track Money, Manage Life, Build Wealth
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
              Track Money, Manage Life, Build Wealth.
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
              All-in-one personal finance to track daily transactions, monitor subscriptions, manage budgets, and run Point-of-Sale registers.
            </p>
          </div>

          {/* Right Column / Center: Form Card & Mobile Footer */}
          <div className="w-full max-w-lg mx-auto">
            {/* Fields Container (Form Card) */}
            <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and password to access your dashboard
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleLogin} noValidate className="space-y-5">
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={handleFieldChange('email', setEmail)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={errors.email}
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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
                    autoComplete="current-password"
                    disabled={loginMutation.isPending}
                  />

                  <div className="flex justify-end mt-2">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#159A1D] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-md rounded-xl mt-2"
                  isLoading={loginMutation.isPending}
                >
                  Sign In
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      href="/signup"
                      className="font-bold text-[#159A1D] hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>
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
                All-in-one personal finance to track daily transactions, monitor subscriptions, manage budgets, and run Point-of-Sale registers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
