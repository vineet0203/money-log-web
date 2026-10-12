import React, { ReactNode } from 'react';

export interface PosFilterBarProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PosFilterBar({ children, actions, className = '' }: PosFilterBarProps) {
  return (
    <div
      className={`bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}
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
