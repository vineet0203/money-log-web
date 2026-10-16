import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      id,
      sizeVariant = 'md',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    const sizeClasses = {
      sm: 'py-2 px-3 text-xs sm:text-sm',
      md: 'py-2.5 px-3.5 text-sm',
      lg: 'py-3 px-4 text-base',
    }[sizeVariant];

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1"
          >
            {label}
            {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border rounded-xl font-medium shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-900 placeholder:text-slate-400 ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${sizeClasses} ${
              error ? 'border-rose-500' : 'border-slate-200'
            } ${className}`}
            onWheel={(e) => {
              if (props.type === 'number') {
                e.currentTarget.blur();
              }
              props.onWheel?.(e);
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-semibold text-rose-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
