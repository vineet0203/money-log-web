import React, { useState } from 'react';
import { Bell, Minus, Plus, MessageSquareText, Mail, Save, Loader2 } from 'lucide-react';
import { useGetProfile } from '@/hooks/queries/user';
import { useUpdateSubscription } from '@/hooks/queries/subscriptions';
import { useSnackbar } from 'notistack';

interface RemindersSettingsProps {
  subscriptionId?: string;
  initialSettings?: {
    is_reminder_on: boolean;
    reminder_days: number;
    is_sms_enabled: boolean;
    is_email_enabled: boolean;
  };
  billingCycle?: string;
}

export function RemindersSettings({ subscriptionId, initialSettings, billingCycle = 'monthly' }: RemindersSettingsProps) {
  const [remindersEnabled, setRemindersEnabled] = useState(initialSettings?.is_reminder_on ?? true);
  const [daysBefore, setDaysBefore] = useState<number>(initialSettings?.reminder_days ?? 7);
  const [smsEnabled, setSmsEnabled] = useState(initialSettings?.is_sms_enabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(initialSettings?.is_email_enabled ?? true);

  const { data: profile } = useGetProfile();
  const { enqueueSnackbar } = useSnackbar();
  const updateMutation = useUpdateSubscription();

  const handleToggleReminders = (enabled: boolean) => {
    if (enabled) {
      const globalSms = profile?.global_sms_enabled ?? false;
      const globalEmail = profile?.global_email_enabled ?? false;

      if (!globalSms && !globalEmail) {
        enqueueSnackbar('Please enable SMS or Email in global Notification Settings first.', { variant: 'error' });
        return;
      }
      
      setSmsEnabled(globalSms);
      setEmailEnabled(globalEmail);
    }
    setRemindersEnabled(enabled);
  };

  const handleToggleSms = (enabled: boolean) => {
    if (enabled) {
      if (!profile?.global_sms_enabled) {
        enqueueSnackbar('SMS is disabled globally. Enable it in Notification Settings first.', { variant: 'warning' });
        return;
      }
    } else {
      // Trying to disable SMS, ensure Email is still enabled
      if (!emailEnabled) {
        enqueueSnackbar('At least one notification method (SMS or Email) must be enabled.', { variant: 'warning' });
        return;
      }
    }
    setSmsEnabled(enabled);
  };

  const handleToggleEmail = (enabled: boolean) => {
    if (enabled) {
      if (!profile?.global_email_enabled) {
        enqueueSnackbar('Email is disabled globally. Enable it in Notification Settings first.', { variant: 'warning' });
        return;
      }
    } else {
      // Trying to disable Email, ensure SMS is still enabled
      if (!smsEnabled) {
        enqueueSnackbar('At least one notification method (SMS or Email) must be enabled.', { variant: 'warning' });
        return;
      }
    }
    setEmailEnabled(enabled);
  };

  const handleSave = () => {
    if (!subscriptionId) return;

    updateMutation.mutate(
      {
        id: subscriptionId,
        is_reminder_on: remindersEnabled,
        reminder_days: daysBefore,
        is_sms_enabled: smsEnabled,
        is_email_enabled: emailEnabled,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Reminder settings saved successfully!', { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Failed to save reminder settings.', { variant: 'error' });
        }
      }
    );
  };

  // Reusable toggle switch component
  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#159A1D]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
      
      {/* Header: Enable Reminders & Save Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFF9E6] text-[#F59E0B] flex items-center justify-center">
            <Bell size={18} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-slate-800 text-base">Enable Reminders</span>
        </div>
        
        <div className="flex items-center gap-4">
          <ToggleSwitch enabled={remindersEnabled} onChange={handleToggleReminders} />
          <button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      {/* Conditional Sub-settings Area */}
      {remindersEnabled && (
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 flex flex-col gap-6">
          {/* Days Before Expiry */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 text-sm">Days Before Expiry</span>
            <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <button 
                onClick={() => setDaysBefore(Math.max(1, daysBefore - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-slate-900 w-5 text-center text-sm">{daysBefore}</span>
              <button 
                onClick={() => {
                  const maxDays = billingCycle === 'yearly' ? 30 : 15;
                  setDaysBefore(Math.min(maxDays, daysBefore + 1));
                }}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200/60 w-full" />

          {/* SMS Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquareText size={18} className="text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">SMS Notification</span>
            </div>
            <ToggleSwitch enabled={smsEnabled} onChange={handleToggleSms} />
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">Email Notification</span>
            </div>
            <ToggleSwitch enabled={emailEnabled} onChange={handleToggleEmail} />
          </div>
        </div>
      )}
    </div>
  );
}
