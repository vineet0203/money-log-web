'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useGetRecurrencePreview } from '@/hooks/queries/subscriptions';
import { Skeleton } from '@/components/ui/Skeleton';

interface RecurrencePreviewProps {
  startDate?: string;
  frequency?: string;
  intervalCount?: number;
  byMonthDay?: number;
  byWeekday?: number;
  endMode?: string;
  endDate?: string;
  occurrencesTotal?: number;
  count?: number;
}

export const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({
  startDate,
  frequency = 'monthly',
  intervalCount = 1,
  byMonthDay,
  byWeekday,
  endMode = 'never',
  endDate,
  occurrencesTotal,
  count = 3,
}) => {
  const { data: dates, isLoading, isError } = useGetRecurrencePreview(
    {
      start_date: startDate,
      frequency,
      interval_count: intervalCount,
      by_month_day: byMonthDay,
      by_weekday: byWeekday,
      end_mode: endMode,
      end_date: endDate,
      occurrences_total: occurrencesTotal,
      count,
    },
    !!startDate
  );

  if (!startDate) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>Next {count} Scheduled Dates Preview</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
          <Clock className="w-3 h-3" />
          <span>Auto-calculated</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          <Skeleton variant="rectangular" className="h-7 w-28 rounded-lg" />
          <Skeleton variant="rectangular" className="h-7 w-28 rounded-lg" />
          <Skeleton variant="rectangular" className="h-7 w-28 rounded-lg" />
        </div>
      ) : isError || !dates || dates.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          No upcoming occurrences within selected schedule parameters.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {dates.map((d, index) => (
            <div
              key={d}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-sky-200 text-slate-800 shadow-xs"
            >
              <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span>{formatDate(d)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
