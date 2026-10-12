import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface PosStatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  // Success (Green / Emerald)
  'active': 'success',
  'completed': 'success',
  'in_stock': 'success',
  'in stock': 'success',
  'paid': 'success',
  'received': 'success',
  'processed': 'success',
  'verified': 'success',
  'approved': 'success',
  'settled': 'success',

  // Warning (Amber / Orange)
  'low_stock': 'warning',
  'low stock': 'warning',
  'partial': 'warning',
  'partial discrepancy': 'warning',
  'pending': 'warning',
  'draft': 'warning',
  'issued': 'warning',
  'in transit': 'warning',
  'split': 'warning',

  // Danger (Rose / Red)
  'out_of_stock': 'danger',
  'out of stock': 'danger',
  'unpaid': 'danger',
  'cancelled': 'danger',
  'voided': 'danger',
  'refunded': 'danger',
  'failed': 'danger',
  'damaged': 'danger',
  'overdue': 'danger',

  // Neutral (Slate / Gray)
  'inactive': 'neutral',
  'archived': 'neutral',
  'closed': 'neutral',
};

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  neutral: {
    bg: 'bg-slate-100 text-slate-600 border border-slate-200/60',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
};

export function PosStatusBadge({
  status,
  variant,
  showDot = true,
  className = '',
}: PosStatusBadgeProps) {
  const normalizedKey = status.toLowerCase().trim();
  const resolvedVariant = variant || statusVariantMap[normalizedKey] || 'neutral';
  const styles = variantStyles[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${styles.bg} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      )}
      <span>{status}</span>
    </span>
  );
}
