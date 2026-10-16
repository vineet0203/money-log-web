"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  count?: number | string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  tabs: (TabItem<T> | T)[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'contained' | 'underline' | 'pills' | 'card';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  standalone?: boolean;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'contained',
  size = 'md',
  fullWidth = false,
  standalone,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
}: TabsProps<T>) {
  const normalizedTabs: TabItem<T>[] = tabs.map((tab) =>
    typeof tab === 'string' ? { id: tab, label: tab } : tab
  );

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  if (variant === 'card') {
    const isStandalone = standalone ?? false;
    const containerBase = isStandalone
      ? 'rounded-2xl border border-slate-100 bg-white shadow-xs'
      : 'border-b border-slate-100 bg-white';

    const heightClass = {
      sm: 'h-12',
      md: 'h-14',
      lg: 'h-16',
    }[size] || 'h-14';

    return (
      <div
        role="tablist"
        className={`px-4 sm:px-6 flex items-center overflow-x-auto overflow-y-hidden custom-scrollbar shrink-0 ${heightClass} ${containerBase} ${className}`}
      >
        <div className={`flex gap-1 sm:gap-2 h-full ${fullWidth ? 'w-full' : ''}`}>
          {normalizedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                disabled={tab.disabled}
                onClick={() => onChange(tab.id)}
                className={`group h-full px-4 sm:px-6 text-xs sm:text-sm font-semibold transition-all border-b-[3px] -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none rounded-t-lg ${
                  isActive
                    ? activeTabClassName || 'bg-slate-50/80 text-slate-900 border-[#159A1D] font-bold'
                    : inactiveTabClassName || 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50/60'
                } ${tabClassName}`}
              >
                {Icon && (
                  <Icon
                    size={iconSizes[size] || 16}
                    className={`transition-colors shrink-0 ${
                      isActive ? 'text-[#159A1D]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}

                {tab.badge && (
                  <span className="ml-1 shrink-0">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={`flex items-center border-b border-slate-200 overflow-x-auto ${className}`}
      >
        <div className={`flex gap-2 sm:gap-4 ${fullWidth ? 'w-full' : ''}`}>
          {normalizedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                disabled={tab.disabled}
                onClick={() => onChange(tab.id)}
                className={`flex items-center justify-center gap-2 font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                  sizeClasses[size]
                } ${fullWidth ? 'flex-1' : ''} ${
                  isActive
                    ? activeTabClassName || 'border-[#159A1D] text-[#159A1D]'
                    : inactiveTabClassName || 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                } ${tabClassName}`}
              >
                {Icon && (
                  <Icon
                    size={iconSizes[size]}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#159A1D]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#159A1D]/15 text-[#159A1D]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}

                {tab.badge && (
                  <span className="ml-1 shrink-0">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: 'contained' / 'pills' in a container box
  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/60 shadow-2xs gap-1 max-w-full overflow-x-auto custom-scrollbar ${
        fullWidth ? 'w-full flex' : ''
      } ${className}`}
    >
      {normalizedTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none ${
              sizeClasses[size]
            } ${fullWidth ? 'flex-1' : ''} ${
              isActive
                ? activeTabClassName || 'bg-white text-slate-900 shadow-sm'
                : inactiveTabClassName || 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            } ${tabClassName}`}
          >
            {Icon && (
              <Icon
                size={iconSizes[size]}
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              />
            )}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-slate-100 text-slate-800'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}

            {tab.badge && (
              <span className="ml-1 shrink-0">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Aliases for backwards compatibility with POS
export { Tabs as PosTabs, type TabsProps as PosTabsProps, type TabItem as PosTabItem };
export default Tabs;
