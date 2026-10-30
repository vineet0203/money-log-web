"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignup } from '@/hooks/queries/auth';
import { signupSchema } from '@/validations/auth';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const signupMutation = useSignup();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

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
    const validData = validation.data;

    signupMutation.mutate(
      {
        name: validData.name,
        email: validData.email,
        phone: validData.phone,
        password: validData.password,
      },
      {
        onSuccess: (data: any) => {
          const targetEmail = data?.email || validData.email;
          router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.error ||
            err.message ||
            'Failed to create account. Please try again.';
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
            Take Full Control of Your Financial Life
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
              Take Full Control of Your Financial Life.
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
              Create your account in seconds to manage subscriptions, analyze cash flows, and build lasting wealth.
            </p>
          </div>

          {/* Right Column / Center: Form Card & Mobile Footer */}
          <div className="w-full max-w-lg mx-auto">
            {/* Fields Container (Form Card) */}
            <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Start your journey with Money Log today
                </p>
              </div>

              {apiError && (
                <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSignup} noValidate className="space-y-4">
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={handleFieldChange('name', setName)}
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.name}
                    autoComplete="name"
                    disabled={signupMutation.isPending}
                  />
                </div>

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
                    disabled={signupMutation.isPending}
                  />
                </div>

                {/* Mobile Phone Number with Country Code Validation */}
                <div className="w-full space-y-1">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className={`flex items-center w-full rounded-xl border bg-white px-3.5 text-sm transition-all shadow-xs focus-within:ring-2 [&_.PhoneInputInput]:py-2.5 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:font-medium [&_.PhoneInputInput]:text-slate-900 [&_.PhoneInputInput]:placeholder:text-slate-400 [&_.PhoneInputCountry]:mr-2.5 ${
                      errors.phone
                        ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-500/20'
                        : 'border-slate-200 focus-within:border-[#159A1D] focus-within:ring-[#159A1D]/20'
                    }`}
                  >
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={phone}
                      onChange={(val) => {
                        setPhone(val);
                        if (errors.phone) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.phone;
                            return next;
                          });
                        }
                      }}
                      className="w-full text-sm font-medium"
                      placeholder="Enter mobile number"
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Password"
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
                    disabled={signupMutation.isPending}
                  />
                </div>

                <div>
                  <Input
                    label="Confirm Password"
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
                    disabled={signupMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-md rounded-xl mt-4"
                  isLoading={signupMutation.isPending}
                >
                  Create Account
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-bold text-[#159A1D] hover:underline"
                    >
                      Sign in
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
                Create your account in seconds to manage subscriptions, analyze cash flows, and build lasting wealth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
