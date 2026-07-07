import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl shadow-sm transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-[#159A1D] hover:bg-[#118018] text-white focus:ring-[#159A1D] hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-200",
      outline: "border-2 border-gray-200 hover:border-gray-300 bg-transparent text-gray-900 focus:ring-gray-200",
      ghost: "shadow-none hover:bg-gray-100 text-gray-700 focus:ring-gray-200",
    };

    const sizes = {
      sm: "py-2 px-4 text-sm",
      md: "py-3 px-6 text-base",
      lg: "py-4 px-6 text-lg",
    };

    return (
      <button 
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
