import React, { useState } from 'react';
import { Bell, Minus, Plus, MessageSquareText, Mail, Save } from 'lucide-react';

export function RemindersSettings() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [daysBefore, setDaysBefore] = useState(15);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

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
          <ToggleSwitch enabled={remindersEnabled} onChange={setRemindersEnabled} />
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all">
            <Save size={16} />
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
                onClick={() => setDaysBefore(daysBefore + 1)}
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
            <ToggleSwitch enabled={smsEnabled} onChange={setSmsEnabled} />
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">Email Notification</span>
            </div>
            <ToggleSwitch enabled={emailEnabled} onChange={setEmailEnabled} />
          </div>
        </div>
      )}
    </div>
  );
}
