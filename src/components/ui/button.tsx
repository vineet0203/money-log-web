import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      icon,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    const prefixIcon = leftIcon || icon;

    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variants = {
      primary:
        'bg-[#159A1D] hover:bg-[#118218] text-white focus:ring-[#159A1D]/30 shadow-xs',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-200 shadow-xs',
      outline:
        'border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-200 shadow-xs',
      ghost:
        'shadow-none hover:bg-slate-100 text-slate-600 focus:ring-slate-200',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-200 shadow-xs',
    };

    const sizes = {
      xs: 'h-[30px] px-2.5 text-xs gap-1.5',
      sm: 'h-[38px] px-3.5 text-xs sm:text-sm gap-2',
      md: 'h-[42px] px-4 text-sm gap-2',
      lg: 'h-[48px] px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isBusy}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          prefixIcon && <span className="shrink-0">{prefixIcon}</span>
        )}
        {children}
        {!isBusy && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
