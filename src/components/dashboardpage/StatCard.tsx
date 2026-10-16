import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatInfoTooltip } from '@/components/ui';

export interface DashboardStatCardProps {
  title: string;
  amount: string;
  amountColor?: string;
  subtitle?: string;
  info?: string;
  delta?: {
    value: number | null;
    isGood?: boolean;
    label?: string;
  };
  metrics: {
    label: string;
    value: string;
    valueColor?: string;
  }[];
}

export function StatCard({
  title,
  amount,
  amountColor = "text-[#159A1D]",
  subtitle,
  info,
  delta,
  metrics,
}: DashboardStatCardProps) {
  const gridColsClass =
    metrics.length === 2
      ? 'grid-cols-2'
      : metrics.length === 3
      ? 'grid-cols-3'
      : 'grid-cols-4';

  const hasDelta = delta && delta.value !== null && delta.value !== undefined;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0 h-full min-h-[140px]">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
              {title}
            </p>
            <StatInfoTooltip text={info} title={title} subtitle={subtitle} />
          </div>
          {hasDelta && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0 ${
                delta.isGood
                  ? 'bg-emerald-50 text-[#159A1D] border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-600 border border-rose-200/60'
              }`}
              title={delta.label || 'Month-over-month change'}
            >
              {delta.value! >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {delta.value! >= 0 ? `+${delta.value}%` : `${delta.value}%`}
            </span>
          )}
        </div>

        <h2 className={`text-xl sm:text-2xl font-bold mt-1 truncate ${amountColor}`}>
          {amount}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      <div className={`grid ${gridColsClass} gap-1 mt-4 pt-3 border-t border-slate-100`}>
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`flex flex-col min-w-0 ${
              idx !== metrics.length - 1 ? 'border-r border-slate-100 pr-1.5' : ''
            } ${idx !== 0 ? 'px-1.5' : ''}`}
          >
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {metric.label}
            </span>
            <span
              className={`text-xs font-bold font-mono truncate ${
                metric.valueColor || 'text-slate-800'
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatCard;
