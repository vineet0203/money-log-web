import React, { ReactNode } from 'react';

export interface FilterBarProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({ children, actions, className = '' }: FilterBarProps) {
  return (
    <div
      className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// Aliases for backwards compatibility with POS
export { FilterBar as PosFilterBar, type FilterBarProps as PosFilterBarProps };
