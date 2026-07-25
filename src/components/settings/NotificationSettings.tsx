"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Bell, Loader2 } from 'lucide-react';
import { useGetProfile, useUpdateProfile } from '@/hooks/queries/user';

export function NotificationSettings() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      className={`${enabled ? 'bg-[#159A1D]' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
      />
    </button>
  );

  // Sync state with fetched profile data
  useEffect(() => {
    if (profile) {
      setSmsEnabled(profile.global_sms_enabled === 1);
      setEmailEnabled(profile.global_email_enabled === 1);
      setPushEnabled(profile.global_push_enabled === 1);
    }
  }, [profile]);

  const handleToggle = (key: 'sms' | 'email' | 'push', value: boolean) => {
    // Optimistic update
    if (key === 'sms') setSmsEnabled(value);
    if (key === 'email') setEmailEnabled(value);
    if (key === 'push') setPushEnabled(value);

    // Call backend
    const payload = {
      global_sms_enabled: key === 'sms' ? (value ? 1 : 0) : (smsEnabled ? 1 : 0),
      global_email_enabled: key === 'email' ? (value ? 1 : 0) : (emailEnabled ? 1 : 0),
      global_push_enabled: key === 'push' ? (value ? 1 : 0) : (pushEnabled ? 1 : 0),
    };

    updateProfileMutation.mutate(payload, {
      onError: () => {
        // Revert optimistic update on failure
        if (key === 'sms') setSmsEnabled(!value);
        if (key === 'email') setEmailEnabled(!value);
        if (key === 'push') setPushEnabled(!value);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 shadow-sm border border-slate-100 w-full mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Notification Settings</h2>
      <div className="space-y-2 sm:space-y-3">
        {/* SMS Alerts */}
        <div className="flex items-center justify-between py-1.5 gap-2">
          <div className="flex items-center gap-3 sm:gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 pr-2">
              <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">SMS Alerts</h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5 leading-tight">Real-time SMS alerts on your device</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={smsEnabled}
            onChange={(val: boolean) => handleToggle('sms', val)}
          />
        </div>
        
        <hr className="border-slate-50" />

        {/* Email Alerts */}
        <div className="flex items-center justify-between py-1.5 gap-2">
          <div className="flex items-center gap-3 sm:gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Mail className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 pr-2">
              <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">Email Alerts</h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5 leading-tight">Real-time Email alerts to your inbox</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={emailEnabled}
            onChange={(val: boolean) => handleToggle('email', val)}
          />
        </div>
        
        <hr className="border-slate-50" />

        {/* Push Notifications */}
        <div className="flex items-center justify-between py-1.5 gap-2">
          <div className="flex items-center gap-3 sm:gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Bell className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 pr-2">
              <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">Push Notifications</h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5 leading-tight">Real-time push alerts on your device</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={pushEnabled}
            onChange={(val: boolean) => handleToggle('push', val)}
          />
        </div>
      </div>

        <p className="text-[11px] sm:text-xs font-medium text-slate-400 text-center mt-4 sm:mt-6 leading-relaxed max-w-lg mx-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
          <strong>Note:</strong> These are global settings. Even after enabling them here, you must also configure notification preferences for each individual subscription to receive its alerts. Carrier rates may apply.
        </p>
    </div>
  );
}
