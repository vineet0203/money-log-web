"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export const DEFAULT_STAT_INFO: Record<string, string> = {
  // Income & Inflows
  'total income': 'Total sum of all incoming cash flows, deposits, and income entries recorded in this period.',
  'total inflows': 'Total sum of all incoming cash flows, deposits, and income entries recorded in this period.',
  'income this month': 'Month-to-date total of all income deposits received since the 1st of this month.',
  'income mtd': 'Month-to-date total of all income deposits received since the 1st of this month.',
  'average inflow': 'Average amount received per recorded income transaction in this period.',
  'largest inflow': 'Single highest-value income deposit recorded within this period.',

  // Expenses & Outflows
  'total expenses': 'Total sum of all outgoing payments, purchases, and cash expenses recorded in this period.',
  'total outflows': 'Total sum of all outgoing payments, purchases, and cash expenses recorded in this period.',
  'expenses this month': 'Month-to-date total of all expenses logged since the 1st of this month.',
  'expenses mtd': 'Month-to-date total of all expenses logged since the 1st of this month.',
  'total expenses month': 'Total sum of all outgoing payments and recorded expenses for the selected month.',
  'average daily spend': 'Total month-to-date expenses divided by the number of calendar days elapsed so far.',
  'largest expense': 'Single highest-value expense transaction recorded within this period.',
  'highest expense': 'Peak individual expense transaction logged in this period.',
  'highest outflow': 'Peak individual cash outflow transaction logged in this period.',
  'over-budget categories': 'Number of spending categories whose total expenses have exceeded their monthly budget limit.',

  // Cash Flow & Projections
  'net cash flow': 'Net cash movement (Total Income minus Total Expenses) across the selected period.',
  'net balance flow': 'Net cash movement (Total Income minus Total Expenses) across the selected period.',
  'monthly savings rate': 'Percentage of monthly income saved after subtracting all logged expenses ((Income − Expenses) ÷ Income).',
  'savings rate': 'Percentage of monthly income saved after subtracting all logged expenses ((Income − Expenses) ÷ Income).',
  'committed outflow': 'Total monthly committed expenses required by active recurring subscriptions and scheduled bills.',
  'projected month end': 'Estimated month-end expenditure based on average daily spend extrapolated across the full month.',
  'projected spend': 'Estimated month-end expenditure based on average daily spend extrapolated across the full month.',
  'transactions count': 'Total count of transaction entries matching the active filters and period.',

  // Subscriptions & Reminders
  'active payments': 'Currently running recurring subscription schedules and recurring bills.',
  'active subscriptions': 'Total count of recurring subscriptions and scheduled bills currently active.',
  'monthly commitment': 'Total normalized monthly commitment required by all active recurring subscriptions.',
  'monthly recurring cost': 'Total normalized monthly cost of all active recurring subscriptions.',
  'due within 7 days': 'Subscriptions and bills with their next renewal date falling within the next 7 days.',
  'due in 7 days': 'Subscriptions and bills with their next billing date due within the next 7 days.',
  'due in 30 days': 'Subscriptions and bills with their next billing date due within the next 30 days.',
  'within 7 days': 'Subscriptions renewing within the next 7 calendar days.',
  'within 8 30 days': 'Subscriptions renewing within standard 8 to 30 day window.',
  'overdue missed': 'Subscriptions and recurring bills past their due date that require attention or confirmation.',
  'overdue': 'Payments and renewals that have passed their due date.',
  'inactive payments': 'Subscriptions and recurring schedules that have been paused or cancelled.',
  'total recurring': 'Total count of all recurring subscription obligations configured in the system.',
  'total reminders': 'Total number of automated reminder notifications configured.',
};

export function resolveStatInfo(title?: string, text?: string, subtitle?: React.ReactNode): string {
  if (text && text.trim()) return text.trim();
  if (!title) return typeof subtitle === 'string' && subtitle ? subtitle : '';

  const clean = title.toLowerCase().trim();
  const normalized = clean.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Direct dictionary matches
  if (DEFAULT_STAT_INFO[clean]) return DEFAULT_STAT_INFO[clean];
  if (DEFAULT_STAT_INFO[normalized]) return DEFAULT_STAT_INFO[normalized];

  // 2. Intelligent Category / Keyword matching
  if (normalized.includes('income') || normalized.includes('inflow')) {
    if (normalized.includes('average')) return 'Average amount received per recorded income transaction in this period.';
    if (normalized.includes('largest') || normalized.includes('highest')) return 'Single highest-value income deposit recorded within this period.';
    if (normalized.includes('month') || normalized.includes('mtd')) return 'Month-to-date total of all income deposits received since the 1st of this month.';
    return 'Total sum of all incoming cash flows, deposits, and income entries recorded in this period.';
  }

  if (normalized.includes('expense') || normalized.includes('outflow') || normalized.includes('spend')) {
    if (normalized.includes('average daily') || normalized.includes('daily avg')) return 'Total month-to-date expenses divided by the number of calendar days elapsed so far.';
    if (normalized.includes('largest') || normalized.includes('highest') || normalized.includes('peak')) return 'Single highest-value expense transaction recorded within this period.';
    if (normalized.includes('month') || normalized.includes('mtd')) return 'Month-to-date total of all outgoing payments and recorded expenses for this month.';
    if (normalized.includes('projected')) return 'Estimated month-end expenditure based on average daily spend extrapolated across the full month.';
    return 'Total sum of all outgoing payments, purchases, and cash expenses recorded in this period.';
  }

  if (normalized.includes('net cash') || normalized.includes('net flow') || normalized.includes('balance flow') || normalized.includes('profit')) {
    return 'Net cash movement (Total Income minus Total Expenses) across the selected period.';
  }

  if (normalized.includes('saving')) {
    return 'Percentage of monthly income saved after subtracting all logged expenses ((Income − Expenses) ÷ Income).';
  }

  if (normalized.includes('commit')) {
    return 'Total monthly committed expenses required by active recurring subscriptions and bills.';
  }

  if (normalized.includes('projected')) {
    return 'Estimated month-end expenditure based on average daily spend extrapolated across the full month.';
  }

  if (normalized.includes('subscription') || normalized.includes('recurring')) {
    return 'Total count or financial volume of active recurring subscription commitments.';
  }

  if (normalized.includes('7 day') || normalized.includes('seven day')) {
    return 'Scheduled subscriptions and bills renewing within the next 7 days.';
  }

  if (normalized.includes('30 day')) {
    return 'Scheduled subscriptions and bills renewing within the next 30 days.';
  }

  if (normalized.includes('overdue') || normalized.includes('missed')) {
    return 'Payments and subscription obligations that have passed their scheduled billing date without confirmation.';
  }

  if (normalized.includes('budget')) {
    return 'Category budget performance tracking spending limits against actual outflows.';
  }

  if (normalized.includes('transaction') || normalized.includes('count')) {
    return 'Total count of transaction entries matching the active filters and period.';
  }

  if (normalized.includes('product')) {
    return 'Total catalog products currently tracked in your product inventory.';
  }

  if (normalized.includes('stock')) {
    return 'Current inventory count and stock availability metrics.';
  }

  if (normalized.includes('inventory') || normalized.includes('valuation')) {
    return 'Total financial value of current on-hand warehouse inventory.';
  }

  if (normalized.includes('supplier')) {
    return 'Supplier and vendor transaction totals and outstanding payable balances.';
  }

  if (normalized.includes('purchase')) {
    return 'Total purchase orders and procurement expenditures.';
  }

  if (normalized.includes('sale') || normalized.includes('revenue')) {
    return 'Total sales volume, receipts, and order revenue for the period.';
  }

  if (normalized.includes('margin')) {
    return 'Gross or net profit margin percentage achieved on goods sold.';
  }

  if (normalized.includes('return') || normalized.includes('refund')) {
    return 'Total merchandise returns and refunded amounts processed.';
  }

  if (normalized.includes('tax')) {
    return 'Total applicable sales tax collected on recorded sales.';
  }

  if (normalized.includes('discount')) {
    return 'Total promotional discounts and reductions granted on sales.';
  }

  if (typeof subtitle === 'string' && subtitle.trim()) {
    return subtitle.trim();
  }

  return `Key performance metric tracking ${title}.`;
}

export interface StatInfoTooltipProps {
  text?: string;
  title?: string;
  subtitle?: React.ReactNode;
  className?: string;
}

export function StatInfoTooltip({ text, title, subtitle, className = '' }: StatInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedText = resolveStatInfo(title, text, subtitle);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!resolvedText) return null;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label="More information"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 rounded transition-colors cursor-help inline-flex items-center"
      >
        <Info size={13} className="shrink-0" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 sm:w-64 pointer-events-none select-none transition-all duration-150"
        >
          <div className="bg-slate-900 text-white text-[11px] leading-relaxed rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-800 text-center font-normal">
            {resolvedText}
          </div>
          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mx-auto border-r border-b border-slate-800" />
        </div>
      )}
    </div>
  );
}
