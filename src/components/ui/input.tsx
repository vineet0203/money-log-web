import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-[#4F627A] mb-1.5 flex items-center gap-1">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-900 placeholder:text-slate-400 ${
              error ? 'border-red-500' : 'border-slate-200'
            } ${className}`}
            onWheel={(e) => {
              if (props.type === 'number') {
                e.currentTarget.blur();
              }
              props.onWheel?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
