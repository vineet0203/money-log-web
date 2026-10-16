'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, Bell, Loader2 } from 'lucide-react';
import { useGetProfile, useUpdateProfile, UserProfile } from '@/hooks/queries/user';
import { StatInfoTooltip } from '@/components/ui/StatInfoTooltip';

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`${enabled ? 'bg-[#159A1D]' : 'bg-slate-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
      />
    </button>
  );
}

function NotificationSettingsForm({ profile }: { profile: UserProfile }) {
  const updateProfileMutation = useUpdateProfile();

  const [smsEnabled, setSmsEnabled] = useState(profile.global_sms_enabled === 1 || profile.global_sms_enabled === true);
  const [emailEnabled, setEmailEnabled] = useState(profile.global_email_enabled === 1 || profile.global_email_enabled === true);
  const [pushEnabled, setPushEnabled] = useState(profile.global_push_enabled === 1 || profile.global_push_enabled === true);

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
      },
    });
  };

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 shadow-sm border border-slate-100 w-full mx-auto">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h2 className="text-lg font-bold text-slate-900">Notification Settings</h2>
        <StatInfoTooltip text="Manage how and when you receive automated billing reminders and system alerts across in-app and external delivery channels." />
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* System In-App Notifications - Always Enabled */}
        <div className="flex items-center justify-between py-2 px-3 bg-emerald-50/60 rounded-xl border border-emerald-100 gap-2">
          <div className="flex items-center gap-3 sm:gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Bell className="text-[#159A1D] w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-[16px] font-bold text-slate-900 leading-tight">System Notifications</h3>
                <StatInfoTooltip text="Triggers immediately whenever an upcoming renewal reaches its reminder lead window, when recurring bills are auto-posted, or when payments become overdue." />
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#159A1D] text-white">
                  Active
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-emerald-800/80 mt-0.5 leading-tight">
                In-app alerts and renewal notices are always recorded to your Notification Center
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#159A1D] px-2.5 py-1 bg-white rounded-lg border border-emerald-200 shadow-2xs">
            Always Enabled
          </span>
        </div>

        <div className="pt-2 pb-1 px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">External Delivery Alert Channels</h4>
        </div>

        {/* SMS Alerts */}
        <div className="flex items-center justify-between py-1.5 gap-2">
          <div className="flex items-center gap-3 sm:gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">SMS Alerts</h3>
                <StatInfoTooltip text="Triggers at 10:00 AM in your local timezone when an active subscription's reminder lead day is reached, sent to your registered phone number." />
              </div>
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
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">Email Alerts</h3>
                <StatInfoTooltip text="Triggers at 10:00 AM in your local timezone when a renewal date is due, delivering a summary receipt to your verified email inbox." />
              </div>
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
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-[17px] font-bold text-slate-900 leading-tight">Push Notifications</h3>
                <StatInfoTooltip text="Triggers at 10:00 AM in your local timezone as an instant mobile push alert on your registered devices." />
              </div>
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
        <strong>Note:</strong> These are global delivery settings. In-app notifications are always preserved in your Notification Center regardless of external delivery channel toggles.
      </p>
    </div>
  );
}

export function NotificationSettings() {
  const { data: profile, isLoading } = useGetProfile();

  if (isLoading || !profile) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <NotificationSettingsForm
      key={`${profile.id}-${profile.global_sms_enabled}-${profile.global_email_enabled}-${profile.global_push_enabled}`}
      profile={profile}
    />
  );
}

export default NotificationSettings;
