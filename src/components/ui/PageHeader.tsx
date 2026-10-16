import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  iconColor?: string;
  iconBg?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-[#159A1D]',
  iconBg = 'bg-emerald-50',
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon size={20} />
          </div>
        )}
        <div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// Aliases for backwards compatibility with POS
export { PageHeader as PosPageHeader, type PageHeaderProps as PosPageHeaderProps };
