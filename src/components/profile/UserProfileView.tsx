'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useGetProfile, useUpdateProfile, UserProfile } from '@/hooks/queries/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, GMT+05:30)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time, GMT+00:00)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time, GMT-05:00)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time, GMT-06:00)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time, GMT-07:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time, GMT-08:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT / BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET, GMT+01:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET, GMT+01:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, GMT+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, GMT+08:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, GMT+09:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST, GMT+10:00)' },
  { value: 'America/Toronto', label: 'America/Toronto (Eastern Time, GMT-05:00)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT, GMT-03:00)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST, GMT+02:00)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (HKT, GMT+08:00)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT, GMT+07:00)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST, GMT+12:00)' },
];

function ProfileForm({ profile }: { profile: UserProfile }) {
  const updateProfileMutation = useUpdateProfile();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized directly from profile
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getInitials = (nameStr?: string | null) => {
    if (!nameStr || !nameStr.trim()) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image size exceeds 5MB limit.', { variant: 'warning' });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      enqueueSnackbar('Please select a valid image (JPEG, PNG, or WebP).', { variant: 'warning' });
      return;
    }

    setSelectedFile(file);
    setIsPhotoRemoved(false);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPhotoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setTimezone(profile.timezone || 'UTC');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPhotoRemoved(false);
    setEmailError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDirty = Boolean(
    name !== (profile.name || '') ||
      email !== (profile.email || '') ||
      timezone !== (profile.timezone || 'UTC') ||
      selectedFile !== null ||
      (isPhotoRemoved && profile.profile_image_url)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address');
        return;
      }
    }

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_image', selectedFile);
        formData.append('name', name.trim());
        formData.append('email', email.trim());
        formData.append('timezone', timezone);

        await updateProfileMutation.mutateAsync(formData);
      } else {
        const payload: {
          name: string;
          email: string;
          timezone: string;
          remove_profile_image?: boolean;
        } = {
          name: name.trim(),
          email: email.trim(),
          timezone,
        };

        if (isPhotoRemoved) {
          payload.remove_profile_image = true;
        }

        await updateProfileMutation.mutateAsync(payload);
      }

      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      const errorObj = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const serverMsg = errorObj.response?.data?.error || errorObj.message || 'Failed to update profile';
      if (errorObj.response?.status === 409 || serverMsg.toLowerCase().includes('email')) {
        setEmailError(serverMsg);
        enqueueSnackbar(serverMsg, { variant: 'error' });
      } else {
        enqueueSnackbar(serverMsg, { variant: 'error' });
      }
    }
  };

  const displayImageUrl = !isPhotoRemoved ? previewUrl || profile.profile_image_url : null;

  const timezoneOptions = [...COMMON_TIMEZONES];
  if (timezone && !timezoneOptions.some((tz) => tz.value === timezone)) {
    timezoneOptions.unshift({ value: timezone, label: `${timezone} (Current)` });
  }

  const memberSinceDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* Top Identity Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            {/* Avatar with Upload Action */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#159A1D] flex items-center justify-center text-white text-3xl font-extrabold tracking-wider overflow-hidden shadow-inner border-2 border-white ring-2 ring-slate-100">
                {displayImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayImageUrl}
                    alt={profile.name || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(name || profile.name)}</span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                title="Change Photo"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-semibold">Change</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* User Title & Badges */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {name || profile.name || 'Personal Account'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {email || profile.email || 'No email registered'} · {profile.phone_number}
              </p>
              {memberSinceDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {memberSinceDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Photo Actions on Desktop */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Change Photo</span>
            </Button>

            {(displayImageUrl || selectedFile) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </Button>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Full Name */}
            <div>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={16} />}
                sizeVariant="md"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                Your name as displayed across your reports and invoices.
              </p>
            </div>

            {/* Email Address */}
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                leftIcon={<Mail size={16} />}
                error={emailError || undefined}
                sizeVariant="md"
              />
              <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                Used for notification summaries, renewal reminders, and receipts.
              </p>
            </div>

            {/* Phone Number (Verified Identity - Locked) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> OTP Primary ID
                </span>
              </div>
              <div className="relative">
                <Input
                  value={profile.phone_number}
                  disabled
                  readOnly
                  leftIcon={<Phone size={16} />}
                  sizeVariant="md"
                  className="bg-slate-50 text-slate-500 font-mono cursor-not-allowed border-slate-200"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                Your phone number is your secure login credential.
              </p>
            </div>

            {/* Timezone Preference */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe size={14} className="text-slate-400" />
                <span>Timezone</span>
              </label>
              <Select
                options={timezoneOptions}
                value={timezone}
                onChange={(val) => setTimezone(val)}
                searchable
                searchPlaceholder="Search timezone or city..."
                size="md"
              />
              <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                Used to evaluate midnight bill schedules and recurring reminders.
              </p>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
            <div className="flex items-center gap-2">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Unsaved changes
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">
                  All personal details are up to date.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleReset}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 sm:flex-initial gap-1.5"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Reset</span>
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!isDirty || updateProfileMutation.isPending}
                loading={updateProfileMutation.isPending}
                className="flex-1 sm:flex-initial gap-2 min-w-[140px]"
              >
                {!updateProfileMutation.isPending && <Save className="w-4 h-4" />}
                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Account Security & Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
          Account Security & Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Account Type</span>
            <p className="text-sm font-bold text-slate-800">Single-Tenant Owner</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Authentication</span>
            <p className="text-sm font-bold text-slate-800">Two-Factor SMS OTP</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Account ID</span>
            <p className="text-sm font-bold font-mono text-slate-800">USR-{profile.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserProfileView() {
  const { data: profile, isLoading, isError } = useGetProfile();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton variant="circular" width={96} height={96} />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-xl" />
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-xl" />
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-xl" />
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-slate-100 shadow-xs text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Failed to load user profile</h3>
        <p className="text-sm text-slate-500">Please check your network connection and try again.</p>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Key the form with profile details to automatically reset state on fresh profile data
  return <ProfileForm key={`${profile.id}-${profile.name}-${profile.email}-${profile.profile_image_url}`} profile={profile} />;
}

export default UserProfileView;
