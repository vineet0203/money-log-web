"use client";

import React, { forwardRef } from 'react';
import { Search, X, Loader2, LucideIcon } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value: string;
  onChange: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  sizeVariant?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  clearable?: boolean;
  isLoading?: boolean;
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
    inputClassName = '',
    onClear,
    autoFocus = false,
    sizeVariant = 'sm',
    leftIcon: LeftIcon = Search,
    clearable = true,
    isLoading = false,
    shortcut,
    disabled = false,
    onKeyDown,
    ...rest
  },
  ref
) {
  const sizeConfig = {
    xs: {
      input: 'h-[30px] pl-8 pr-7 text-xs rounded-lg',
      iconSize: 14,
      iconLeft: 'left-2.5',
      clearRight: 'right-2',
      clearIconSize: 12,
    },
    sm: {
      input: 'h-[38px] pl-9 pr-8 text-xs sm:text-sm rounded-xl',
      iconSize: 16,
      iconLeft: 'left-3',
      clearRight: 'right-2.5',
      clearIconSize: 13,
    },
    md: {
      input: 'h-[42px] pl-10 pr-9 text-sm rounded-xl',
      iconSize: 17,
      iconLeft: 'left-3.5',
      clearRight: 'right-3',
      clearIconSize: 14,
    },
    lg: {
      input: 'h-[48px] pl-11 pr-10 text-base rounded-2xl',
      iconSize: 19,
      iconLeft: 'left-4',
      clearRight: 'right-3.5',
      clearIconSize: 16,
    },
  }[sizeVariant] || {
    input: 'h-[38px] pl-9 pr-8 text-xs sm:text-sm rounded-xl',
    iconSize: 16,
    iconLeft: 'left-3',
    clearRight: 'right-2.5',
    clearIconSize: 13,
  };

  const hasExplicitWidth = /\b(w-|max-w-|min-w-|flex-)/.test(className);
  const widthClasses = hasExplicitWidth ? '' : 'flex-1 min-w-[200px]';

  return (
    <div className={`relative ${widthClasses} ${className}`}>
      <div
        className={`absolute ${sizeConfig.iconLeft} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center`}
      >
        {isLoading ? (
          <Loader2 size={sizeConfig.iconSize} className="animate-spin text-[#159A1D]" />
        ) : (
          <LeftIcon size={sizeConfig.iconSize} />
        )}
      </div>

      <input
        ref={ref}
        type="text"
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value, e)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full ${sizeConfig.input} bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 transition-all duration-150 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${inputClassName}`}
        {...rest}
      />

      {value && clearable && !disabled && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className={`absolute ${sizeConfig.clearRight} top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer`}
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={sizeConfig.clearIconSize} />
        </button>
      )}

      {!value && shortcut && !disabled && (
        <span
          className={`absolute ${sizeConfig.clearRight} top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded`}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
});

// Aliases for backwards compatibility with POS
export { SearchInput as PosSearchInput, type SearchInputProps as PosSearchInputProps };
export default SearchInput;
