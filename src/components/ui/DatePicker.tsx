import React, { useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ label, value, onChange, placeholder }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (e) {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="w-full">
      <style>{`
        /* Hide the native calendar icon in webkit browsers */
        .hide-native-date-icon::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      
      {label && (
        <label className="block text-sm font-bold text-[#4F627A] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input 
          ref={inputRef}
          type="date" 
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          onClick={handleIconClick}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-[#4F627A] placeholder:text-slate-400 hide-native-date-icon cursor-pointer"
        />
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <CalendarIcon size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
