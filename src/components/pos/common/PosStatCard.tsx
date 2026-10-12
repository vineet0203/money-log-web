import React, { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type PosStatColor = 'green' | 'blue' | 'purple' | 'amber' | 'rose' | 'emerald' | 'slate';

export interface PosStatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  color?: PosStatColor;
  colorScheme?: PosStatColor;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
}

const colorStyles: Record<PosStatColor, { bg: string; text: string; lightBg: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-[#159A1D]', lightBg: 'bg-emerald-50/30' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', lightBg: 'bg-emerald-50/30' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', lightBg: 'bg-blue-50/30' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', lightBg: 'bg-purple-50/30' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', lightBg: 'bg-amber-50/30' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', lightBg: 'bg-rose-50/30' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', lightBg: 'bg-slate-50/50' },
};

export function PosStatCard({
  title,
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  colorScheme,
  trend,
  className = '',
  onClick,
}: PosStatCardProps) {
  const displayTitle = title || label || '';
  const displayColor = color || colorScheme || 'green';
  const styles = colorStyles[displayColor] || colorStyles.green;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-200 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="space-y-1 min-w-0 pr-2">
        <p className="text-xs font-semibold text-slate-400 truncate">{displayTitle}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {subtitle && (
          <div className="text-[11px] text-slate-500 truncate">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={`text-[11px] font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend.value}</span>
            {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>

      {Icon && (
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.text}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
