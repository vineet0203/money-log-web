"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  required?: boolean;
  disabled?: boolean;
  placement?: 'bottom' | 'top' | 'auto';
  dropdownClassName?: string;
  dropdownWidth?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
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
  placement = 'auto',
  dropdownClassName = '',
  dropdownWidth: dropdownWidthProp,
  searchable,
  searchPlaceholder,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: 'top' | 'bottom';
  }>({
    left: 0,
    width: 180,
    maxHeight: 260,
    placement: 'bottom',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show search input when options count is greater than 15, or when explicitly requested
  const isSearchable = searchable ?? options.length > 15;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => String(opt.label).toLowerCase().includes(q));
  }, [options, isSearchable, searchQuery]);

  // Position calculation and viewport collision detection
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const triggerWidth = rect.width;

    // Determine width:
    // When searchable, expand to minimum 260px so search box and items have ample room.
    // If not searchable, default to minimum 200px or trigger width unless explicit custom width is given.
    const hasCustomWidth = dropdownClassName?.includes('w-') || dropdownClassName?.includes('min-w-');
    const defaultMinWidth = isSearchable ? 260 : (hasCustomWidth ? triggerWidth : Math.max(triggerWidth, 200));
    let finalWidth = dropdownWidthProp ?? Math.max(triggerWidth, defaultMinWidth);

    // Safeguard for small viewports
    const maxViewportWidth = window.innerWidth - 16;
    if (finalWidth > maxViewportWidth) {
      finalWidth = maxViewportWidth;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let computedPlacement: 'top' | 'bottom' = 'bottom';
    if (placement === 'top') {
      computedPlacement = 'top';
    } else if (placement === 'bottom') {
      computedPlacement = 'bottom';
    } else {
      // Auto: if not enough space below (< 240px) and more space above, flip upwards
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        computedPlacement = 'top';
      }
    }

    let left = rect.left;
    if (dropdownClassName?.includes('right-0')) {
      left = rect.right - finalWidth;
    }
    if (left + finalWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - finalWidth - 8);
    }
    if (left < 8) {
      left = 8;
    }

    if (computedPlacement === 'top') {
      const maxHeight = Math.min(260, Math.max(120, spaceAbove - 16));
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
        width: finalWidth,
        maxHeight,
        placement: 'top',
      });
    } else {
      const maxHeight = Math.min(260, Math.max(120, spaceBelow - 16));
      setCoords({
        top: rect.bottom + 4,
        left,
        width: finalWidth,
        maxHeight,
        placement: 'bottom',
      });
    }
  };

  // Reset search query when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside or scrolling viewport
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll(e: Event) {
      // Don't close if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setSearchQuery('');
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const sizeClasses = {
    xs: 'h-[30px] px-2.5 text-xs font-medium rounded-lg',
    sm: 'h-[38px] px-3 text-xs sm:text-sm font-medium rounded-xl',
    md: 'h-[42px] px-3.5 text-sm font-medium rounded-xl',
    lg: 'h-[48px] px-4 text-base font-medium rounded-xl',
  }[size] || 'h-[38px] px-3 text-xs sm:text-sm font-medium rounded-xl';

  const itemSizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs font-medium',
    sm: 'px-3 py-2 text-xs sm:text-sm font-medium',
    md: 'px-3.5 py-2 text-sm font-medium',
    lg: 'px-4 py-2.5 text-sm font-semibold',
  }[size] || 'px-3 py-2 text-xs sm:text-sm font-medium';

  const dropdownPortal = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      role="listbox"
      data-no-row-click="true"
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      className={`fixed z-[9999] bg-white border border-slate-100 rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-150 ${dropdownClassName}`}
      style={{
        top: coords.top !== undefined ? `${coords.top}px` : undefined,
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: `${coords.maxHeight}px`,
      }}
    >
      {/* Sticky Search Box when options count exceeds 15 */}
      {isSearchable && (
        <div className="p-2 border-b border-slate-100 bg-white shrink-0">
          <SearchInput
            sizeVariant="xs"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder || 'Search options...'}
            className="w-full min-w-0"
            inputClassName="w-full text-xs"
            autoFocus
            clearable
          />
        </div>
      )}

      {/* Options List */}
      <div className="p-1.5 space-y-0.5 overflow-y-auto custom-scrollbar flex-1">
        {filteredOptions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No options found
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                title={opt.label}
                data-no-row-click="true"
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent?.stopImmediatePropagation?.();
                  onChange?.(String(opt.value));
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between text-left rounded-lg transition-colors cursor-pointer select-none ${itemSizeClasses} ${
                  isSelected
                    ? 'bg-[#159A1D]/10 text-[#159A1D] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate pr-1">{opt.label}</span>
                {isSelected && (
                  <Check
                    size={size === 'xs' ? 12 : size === 'sm' ? 13 : 15}
                    strokeWidth={2.8}
                    className="shrink-0 ml-1.5 text-[#159A1D]"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  ) : null;

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
          ref={triggerRef}
          type="button"
          data-no-row-click="true"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className={`w-full flex items-center justify-between bg-white border text-left shadow-2xs transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${
            isOpen ? 'border-[#159A1D] ring-2 ring-[#159A1D]/20' : 'border-slate-200'
          } ${sizeClasses} ${className}`}
        >
          <span className={`truncate ${selectedOption ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
          </span>
          <ChevronDown 
            size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} 
            strokeWidth={2.2} 
            className={`text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`}
          />
        </button>

        {dropdownPortal}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default Select;
