import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  disabled?: boolean;
  placement?: 'bottom' | 'top';
  dropdownClassName?: string;
}

export function Select({
  label,
  error,
  options,
  value,
  onChange,
  placeholder,
  className = '',
  containerClassName = '',
  size = 'md',
  required,
  disabled = false,
  placement = 'bottom',
  dropdownClassName = '',
}: SelectProps) {
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

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
    md: 'px-3.5 py-2.5 text-sm font-medium rounded-xl',
    lg: 'px-4 py-3 text-sm font-medium rounded-xl',
  }[size];

  const itemSizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs font-medium',
    md: 'px-3 py-2 text-sm font-medium',
    lg: 'px-3 py-2.5 text-sm font-semibold',
  }[size];

  return (
    <div className={`w-full ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-white border text-left shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? 'border-[#159A1D]' : 'border-slate-200'
          } ${sizeClasses} ${className}`}
        >
          <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
          </span>
          <ChevronDown 
            size={size === 'sm' ? 14 : 16} 
            strokeWidth={2.5} 
            className={`text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute z-50 ${
              placement === 'top'
                ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
                : 'top-full mt-1.5 slide-in-from-top-1'
            } ${
              dropdownClassName ? dropdownClassName : 'w-full min-w-[140px] left-0'
            } bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in duration-150`}
          >
            <div className="p-1.5 space-y-0.5">
              {options.map((opt) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange?.(String(opt.value));
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left rounded-lg transition-colors ${itemSizeClasses} ${
                      isSelected
                        ? 'bg-[#159A1D]/10 text-[#159A1D] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={size === 'sm' ? 13 : 15} strokeWidth={3} className="shrink-0 ml-1 text-[#159A1D]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
