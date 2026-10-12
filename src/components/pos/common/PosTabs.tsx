"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PosTabItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  count?: number | string;
  badge?: string;
}

export interface PosTabsProps {
  tabs: (PosTabItem | string)[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function PosTabs({ tabs, activeTab, onChange, className = '' }: PosTabsProps) {
  const normalizedTabs: PosTabItem[] = tabs.map(tab => 
    typeof tab === 'string' ? { id: tab, label: tab } : tab
  );

  return (
    <div className={`px-4 sm:px-6 border-b border-slate-100 flex items-center bg-white rounded-t-xl overflow-x-auto custom-scrollbar shadow-xs ${className}`}>
      <div className="flex gap-1 sm:gap-2">
        {normalizedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold transition-all border-b-[3px] -mb-[1px] whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-50 text-slate-900 border-[#159A1D]'
                  : 'text-[#849AB4] border-transparent hover:text-slate-900 hover:bg-slate-50/70'
              }`}
            >
              {Icon && (
                <Icon
                  size={16}
                  className={`transition-colors shrink-0 ${
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
                <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
