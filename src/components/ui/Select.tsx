import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ label, error, options, value, onChange, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-bold text-[#4F627A] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
            isOpen ? 'border-[#159A1D]' : 'border-slate-200'
          } ${className}`}
        >
          <span className={selectedOption ? 'text-[#4F627A]' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            strokeWidth={2.5} 
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                    value === opt.value
                      ? 'bg-[#159A1D]/10 text-[#159A1D]'
                      : 'text-[#4F627A] hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check size={16} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
