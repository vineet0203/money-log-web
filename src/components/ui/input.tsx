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
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full px-0 py-3 text-gray-900 bg-transparent border-0 border-b ${
              error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#159A1D]'
            } focus:ring-0 placeholder-gray-400 transition-colors ${className}`}
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
