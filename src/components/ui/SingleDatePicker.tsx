import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface SingleDatePickerProps {
  date?: string;
  onChange?: (date: string) => void;
  className?: string;
  type?: 'date' | 'month';
}

export function SingleDatePicker({ date, onChange, className = '', type = 'date' }: SingleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localDate, setLocalDate] = useState(date || new Date().toISOString().split('T')[0]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return type === 'month' ? 'Select Month' : 'Select Date';
    try {
      if (type === 'month') {
        const [year, month] = dateString.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      const dateObj = new Date(dateString);
      const today = new Date();
      
      const isToday = 
        dateObj.getDate() === today.getDate() && 
        dateObj.getMonth() === today.getMonth() && 
        dateObj.getFullYear() === today.getFullYear();
      
      const formatted = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      return isToday ? `Today, ${formatted}` : formatted;
    } catch {
      return dateString;
    }
  };

  const handleApply = () => {
    onChange?.(localDate);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
          isOpen ? 'border-[#159A1D]' : 'border-slate-200 text-slate-700'
        } ${className}`}
      >
        <CalendarIcon size={16} className={isOpen ? 'text-[#159A1D]' : 'text-slate-500'} />
        <span>{formatDisplayDate(date || localDate)}</span>
        <ChevronDown 
          size={14} 
          className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#159A1D]' : 'text-slate-400'}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">{type === 'month' ? 'Select Month' : 'Select Date'}</label>
              <input 
                type={type} 
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-700"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                className="px-4 py-2 rounded-lg bg-[#159A1D] text-white text-xs font-bold shadow-sm hover:bg-[#118218] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
