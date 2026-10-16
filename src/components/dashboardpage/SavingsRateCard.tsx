import React from 'react';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import { StatInfoTooltip } from '@/components/ui';

interface SavingsRateCardProps {
  savingsRate?: {
    rate: number | null;
    delta: number | null;
  };
  income?: number;
  expenses?: number;
}

export function SavingsRateCard({ savingsRate, income = 0, expenses = 0 }: SavingsRateCardProps) {
  const format = (val: number) =>
    Math.abs(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const rate = savingsRate?.rate;
  const delta = savingsRate?.delta;

  const hasSavingsRate = rate !== null && rate !== undefined;
  const netSaved = income - expenses;

  return (
    <div className="bg-[#159A1D] rounded-xl p-4 sm:p-5 text-white shadow-xs flex flex-col justify-between min-w-0 h-full min-h-[140px] relative">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wide truncate">
              Monthly Savings Rate
            </p>
            <StatInfoTooltip
              text="Percentage of monthly income saved after subtracting all logged expenses ((Income − Expenses) ÷ Income)."
              className="[&_button]:text-white/75 [&_button:hover]:text-white"
            />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono truncate">
              {hasSavingsRate ? `${rate}%` : '0.0%'}
            </h2>
            {delta !== null && delta !== undefined && delta !== 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                  delta > 0
                    ? 'bg-white/20 text-white'
                    : 'bg-black/20 text-white/90'
                }`}
                title="Month-over-month change in savings rate"
              >
                {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white">
          <PiggyBank size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20">
        <div className="flex flex-col min-w-0 border-r border-white/20 pr-2">
          <span className="text-[10px] text-white/80 font-medium truncate">Net Saved MTD</span>
          <span className="text-xs font-bold font-mono truncate">
            {(netSaved >= 0 ? '+' : '-') + format(netSaved)}
          </span>
        </div>

        <div className="flex flex-col min-w-0 pl-1">
          <span className="text-[10px] text-white/80 font-medium truncate">Outflow Share</span>
          <span className="text-xs font-bold font-mono truncate">
            {income > 0 ? `${Math.min(100, Math.round((expenses / income) * 100))}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SavingsRateCard;
