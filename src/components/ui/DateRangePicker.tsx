import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange?: (start: string, end: string) => void;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for the inputs
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');

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

  // Format date for display (e.g., "May 19, 2025")
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const displayString = 
    startDate && endDate 
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : 'Select Date Range';

  const handleApply = () => {
    onChange?.(localStart, localEnd);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
          isOpen ? 'border-[#159A1D]' : 'border-slate-200 text-slate-700'
        } ${className}`}
      >
        <CalendarIcon size={16} className={isOpen ? 'text-[#159A1D]' : 'text-slate-400'} />
        <span>{displayString}</span>
        <ChevronDown 
          size={14} 
          className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#159A1D]' : 'text-slate-400'}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-72 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">From Date</label>
              <input 
                type="date" 
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-700"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">To Date</label>
              <input 
                type="date" 
                value={localEnd}
                min={localStart}
                onChange={(e) => setLocalEnd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-700"
              />
            </div>

            <div className="h-px bg-slate-100 w-full mt-1" />

            <div className="flex justify-end gap-2">
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
                Apply Range
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
