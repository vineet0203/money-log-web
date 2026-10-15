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
  variant?: 'contained' | 'underline' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
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
                    ? activeTabClassName || 'border-emerald-600 text-emerald-700'
                    : inactiveTabClassName || 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                } ${tabClassName}`}
              >
                {Icon && (
                  <Icon
                    size={iconSizes[size]}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
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

export default Tabs;
