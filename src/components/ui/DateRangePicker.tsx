"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  subDays,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  eachDayOfInterval,
  differenceInCalendarDays,
} from 'date-fns';

export interface DateRangePickerProps {
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
  onChange?: (startDate: string, endDate: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  placement?: 'bottom' | 'top' | 'auto';
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  disableFutureDates?: boolean;
  defaultPreset?: 'last30days' | 'thisMonth' | 'last7days' | 'today';
  showPresets?: boolean;
  clearable?: boolean;
}

// Helper to safely parse YYYY-MM-DD into a local midnight Date
function safeParseDate(str?: string): Date | null {
  if (!str) return null;
  try {
    const parts = str.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return null;
    }
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// Helper to format Date into YYYY-MM-DD
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateRangePicker({
  startDate = '',
  endDate = '',
  onChange,
  onClear,
  placeholder = 'Select date range',
  className = '',
  size = 'sm',
  align = 'left',
  placement = 'auto',
  disabled = false,
  minDate,
  maxDate,
  disableFutureDates = false,
  defaultPreset,
  showPresets = true,
  clearable = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const todayStr = useMemo(() => toDateString(new Date()), []);
  const effectiveMaxDate = maxDate || (disableFutureDates ? todayStr : undefined);

  // Compute initial dates if defaultPreset is set and props are empty
  const initialRange = useMemo(() => {
    if (startDate || endDate) {
      return { start: startDate, end: endDate };
    }
    const today = new Date();
    if (defaultPreset === 'last30days') {
      return {
        start: toDateString(subDays(today, 29)),
        end: toDateString(today),
      };
    }
    if (defaultPreset === 'thisMonth') {
      return {
        start: toDateString(startOfMonth(today)),
        end: disableFutureDates ? toDateString(today) : toDateString(endOfMonth(today)),
      };
    }
    if (defaultPreset === 'last7days') {
      return {
        start: toDateString(subDays(today, 6)),
        end: toDateString(today),
      };
    }
    if (defaultPreset === 'today') {
      const s = toDateString(today);
      return { start: s, end: s };
    }
    return { start: '', end: '' };
  }, [startDate, endDate, defaultPreset, disableFutureDates]);

  // Draft selection while popover is open
  const [draftStart, setDraftStart] = useState<string>(initialRange.start);
  const [draftEnd, setDraftEnd] = useState<string>(initialRange.end);
  const [hoverDate, setHoverDate] = useState<string>('');

  // The month displayed in the calendar view
  const [viewDate, setViewDate] = useState<Date>(() => {
    const today = new Date();
    if (disableFutureDates) {
      // Position so current month is the right month of the dual calendar
      return subMonths(startOfMonth(today), 1);
    }
    const parsed = safeParseDate(startDate) || safeParseDate(endDate);
    return parsed ? startOfMonth(parsed) : startOfMonth(today);
  });

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    placement: 'top' | 'bottom';
  }>({
    left: 0,
    width: 680,
    placement: 'bottom',
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize internal draft when external props change
  useEffect(() => {
    setDraftStart(startDate || initialRange.start);
    setDraftEnd(endDate || initialRange.end);
  }, [startDate, endDate, initialRange.start, initialRange.end]);

  // Position calculation and viewport collision detection
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    // Generous width so calendars and Saturday columns have ample room (never clipped)
    const popoverWidth = isDesktop
      ? (showPresets ? 680 : 540)
      : Math.min(window.innerWidth - 20, 360);

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let computedPlacement: 'top' | 'bottom' = 'bottom';
    if (placement === 'top') {
      computedPlacement = 'top';
    } else if (placement === 'bottom') {
      computedPlacement = 'bottom';
    } else {
      if (spaceBelow < 420 && spaceAbove > spaceBelow) {
        computedPlacement = 'top';
      }
    }

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - popoverWidth;
    }
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }
    if (left < 12) {
      left = 12;
    }

    if (computedPlacement === 'top') {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width: popoverWidth,
        placement: 'top',
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width: popoverWidth,
        placement: 'bottom',
      });
    }
  }, [align, placement, showPresets]);

  // Update viewDate when popover opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      if (disableFutureDates) {
        setViewDate(subMonths(startOfMonth(today), 1));
      } else {
        const parsed = safeParseDate(draftStart) || safeParseDate(draftEnd);
        if (parsed) {
          setViewDate(startOfMonth(parsed));
        }
      }
      updatePosition();
    }
  }, [isOpen, disableFutureDates, draftStart, draftEnd, updatePosition]);

  // Close when clicking outside or scrolling viewport
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll(e: Event) {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      setDraftStart(startDate || initialRange.start);
      setDraftEnd(endDate || initialRange.end);
      setHoverDate('');
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Presets definition
  const presets = useMemo(() => {
    const today = new Date();
    const todayString = toDateString(today);

    return [
      {
        id: 'today',
        label: 'Today',
        getRange: () => ({ start: todayString, end: todayString }),
      },
      {
        id: 'yesterday',
        label: 'Yesterday',
        getRange: () => {
          const y = subDays(today, 1);
          const s = toDateString(y);
          return { start: s, end: s };
        },
      },
      {
        id: 'last7days',
        label: 'Last 7 Days',
        getRange: () => ({
          start: toDateString(subDays(today, 6)),
          end: todayString,
        }),
      },
      {
        id: 'last30days',
        label: 'Last 30 Days',
        getRange: () => ({
          start: toDateString(subDays(today, 29)),
          end: todayString,
        }),
      },
      {
        id: 'thisMonth',
        label: 'This Month',
        getRange: () => ({
          start: toDateString(startOfMonth(today)),
          end: disableFutureDates ? todayString : toDateString(endOfMonth(today)),
        }),
      },
      {
        id: 'lastMonth',
        label: 'Last Month',
        getRange: () => {
          const lastMonth = subMonths(today, 1);
          return {
            start: toDateString(startOfMonth(lastMonth)),
            end: toDateString(endOfMonth(lastMonth)),
          };
        },
      },
      {
        id: 'thisYear',
        label: 'This Year',
        getRange: () => ({
          start: toDateString(startOfYear(today)),
          end: disableFutureDates ? todayString : toDateString(endOfYear(today)),
        }),
      },
    ];
  }, [disableFutureDates]);

  // Format date range display text for the trigger button
  const currentStart = startDate || initialRange.start;
  const currentEnd = endDate || initialRange.end;

  const displayLabel = useMemo(() => {
    if (!currentStart && !currentEnd) return placeholder;

    const start = safeParseDate(currentStart);
    const end = safeParseDate(currentEnd);

    if (start && !end) {
      return `From ${format(start, 'MMM d, yyyy')}`;
    }
    if (!start && end) {
      return `Up to ${format(end, 'MMM d, yyyy')}`;
    }
    if (start && end) {
      if (currentStart === currentEnd) {
        return format(start, 'MMM d, yyyy');
      }
      if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) {
          return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
        }
        return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
      }
      return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
    }

    return placeholder;
  }, [currentStart, currentEnd, placeholder]);

  // Handle Preset selection
  const handleSelectPreset = (preset: typeof presets[0]) => {
    const { start, end } = preset.getRange();
    setDraftStart(start);
    setDraftEnd(end);
    onChange?.(start, end);
    setIsOpen(false);
  };

  // Check if a preset is currently active
  const activePresetId = useMemo(() => {
    if (!draftStart || !draftEnd) return null;
    for (const p of presets) {
      const { start, end } = p.getRange();
      if (start === draftStart && end === draftEnd) {
        return p.id;
      }
    }
    return null;
  }, [draftStart, draftEnd, presets]);

  // Calendar Day Click Handler
  const handleDayClick = (dateStr: string) => {
    if (effectiveMaxDate && dateStr > effectiveMaxDate) return;
    if (minDate && dateStr < minDate) return;

    // If no start date, or both dates are already selected, start a fresh range
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(dateStr);
      setDraftEnd('');
      setHoverDate('');
      return;
    }

    // Second date clicked: complete range
    if (draftStart && !draftEnd) {
      if (dateStr < draftStart) {
        setDraftEnd(draftStart);
        setDraftStart(dateStr);
      } else {
        setDraftEnd(dateStr);
      }
      setHoverDate('');
    }
  };

  const handleApply = () => {
    if (draftStart && draftEnd) {
      onChange?.(draftStart, draftEnd);
    } else if (draftStart && !draftEnd) {
      onChange?.(draftStart, draftStart);
    }
    setIsOpen(false);
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDraftStart('');
    setDraftEnd('');
    setHoverDate('');
    onClear?.();
    onChange?.('', '');
  };

  // Check whether navigating forward would exceed effectiveMaxDate
  const today = useMemo(() => new Date(), []);
  const rightMonthDate = useMemo(() => addMonths(viewDate, 1), [viewDate]);

  const isNextDisabled = useMemo(() => {
    if (!effectiveMaxDate) return false;
    const maxDateObj = safeParseDate(effectiveMaxDate);
    if (!maxDateObj) return false;
    return isSameMonth(rightMonthDate, maxDateObj) || isAfter(rightMonthDate, maxDateObj);
  }, [effectiveMaxDate, rightMonthDate]);

  // Helper to render days for a given month
  const renderMonthCalendar = (monthDate: Date, showNavLeft = false, showNavRight = false) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Number of empty slots before the first day of the month (0 = Sun, ..., 6 = Sat)
    const leadPadding = monthStart.getDay();

    // Compute effective range bounds taking hover into account
    let effectiveStart = draftStart;
    let effectiveEnd = draftEnd;
    if (draftStart && !draftEnd && hoverDate) {
      if (hoverDate >= draftStart) {
        effectiveStart = draftStart;
        effectiveEnd = hoverDate;
      } else {
        effectiveStart = hoverDate;
        effectiveEnd = draftStart;
      }
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="w-full select-none">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {showNavLeft ? (
            <button
              type="button"
              onClick={() => setViewDate((prev) => subMonths(prev, 1))}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="text-xs sm:text-sm font-bold text-slate-800">
            {format(monthDate, 'MMMM yyyy')}
          </div>

          {showNavRight ? (
            <button
              type="button"
              disabled={isNextDisabled}
              onClick={() => setViewDate((prev) => addMonths(prev, 1))}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Weekday Names */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekDays.map((wd) => (
            <span key={wd} className="text-[11px] font-bold text-slate-400 py-1">
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
          {/* Empty lead padding */}
          {Array.from({ length: leadPadding }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8" />
          ))}

          {/* Month Days */}
          {daysInMonth.map((day) => {
            const dateStr = toDateString(day);
            const isToday = dateStr === todayStr;

            const isStart = dateStr === draftStart;
            const isEnd = dateStr === draftEnd;
            const isOnlyStart = draftStart && !draftEnd && dateStr === draftStart;

            const isInRange =
              effectiveStart &&
              effectiveEnd &&
              dateStr > effectiveStart &&
              dateStr < effectiveEnd;

            const isRangeBoundary = isStart || isEnd || isOnlyStart;

            // Check if day is disabled by minDate/maxDate
            const isFuture = Boolean(effectiveMaxDate && dateStr > effectiveMaxDate);
            const isPastMin = Boolean(minDate && dateStr < minDate);
            const isDisabled = isFuture || isPastMin;

            let cellBg = '';
            let textColor = 'text-slate-700 hover:bg-slate-100';

            if (isDisabled) {
              textColor = 'text-slate-300 opacity-30 cursor-not-allowed';
            } else if (isRangeBoundary) {
              cellBg = 'bg-[#159A1D] text-white font-bold shadow-2xs';
              textColor = 'text-white';
            } else if (isInRange) {
              cellBg = 'bg-emerald-50 text-emerald-900 font-semibold';
              textColor = 'text-emerald-900';
            }

            // Rounded edge shaping for range visuals
            let rounding = 'rounded-lg';
            if (isInRange) {
              rounding = 'rounded-none';
            } else if (isStart && effectiveEnd && isStart !== isEnd) {
              rounding = 'rounded-l-lg rounded-r-none';
            } else if (isEnd && effectiveStart && isStart !== isEnd) {
              rounding = 'rounded-r-lg rounded-l-none';
            }

            return (
              <div
                key={dateStr}
                className={`relative flex items-center justify-center h-8 ${
                  isInRange ? 'bg-emerald-50' : ''
                } ${
                  isStart && effectiveEnd && isStart !== isEnd
                    ? 'bg-gradient-to-r from-transparent to-emerald-50'
                    : ''
                } ${
                  isEnd && effectiveStart && isStart !== isEnd
                    ? 'bg-gradient-to-l from-transparent to-emerald-50'
                    : ''
                }`}
              >
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleDayClick(dateStr)}
                  onMouseEnter={() => {
                    if (draftStart && !draftEnd && !isDisabled) {
                      setHoverDate(dateStr);
                    }
                  }}
                  className={`w-8 h-8 text-xs flex items-center justify-center transition-all select-none ${rounding} ${cellBg} ${textColor} ${
                    isDisabled ? 'pointer-events-none' : 'cursor-pointer'
                  }`}
                >
                  <span>{day.getDate()}</span>
                  {isToday && !isRangeBoundary && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#159A1D]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sizeClasses = {
    xs: 'h-[30px] px-2.5 text-xs font-medium rounded-lg',
    sm: 'h-[38px] px-3.5 text-xs sm:text-sm font-medium rounded-xl',
    md: 'h-[42px] px-4 text-sm font-medium rounded-xl',
    lg: 'h-[48px] px-4 text-base font-medium rounded-xl',
  }[size] || 'h-[38px] px-3.5 text-xs sm:text-sm font-medium rounded-xl';

  const hasRangeSelected = Boolean(currentStart && currentEnd);

  // Range day count calculation for summary
  const rangeDuration = useMemo(() => {
    if (!draftStart) return null;
    const start = safeParseDate(draftStart);
    const end = safeParseDate(draftEnd || draftStart);
    if (!start || !end) return null;
    const diff = Math.abs(differenceInCalendarDays(end, start)) + 1;
    return `${diff} ${diff === 1 ? 'day' : 'days'}`;
  }, [draftStart, draftEnd]);

  const popoverPortal = isOpen && mounted ? createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Date range selector"
      data-no-row-click="true"
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      className="fixed z-[9999] bg-white border border-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150"
      style={{
        top: coords.top !== undefined ? `${coords.top}px` : undefined,
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxWidth: 'calc(100vw - 20px)',
      }}
    >
      {/* Main Container */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Presets Sidebar */}
        {showPresets && (
          <div className="w-full md:w-36 p-3 bg-slate-50/70 shrink-0 flex flex-wrap md:flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 hidden md:block">
              Quick Ranges
            </span>
            {presets.map((p) => {
              const isActive = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#159A1D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Calendar View: Dual-month on >= 768px, single-month on mobile */}
        <div className="flex-1 p-3.5 flex flex-col md:flex-row gap-5">
          {/* Left Month */}
          <div className="flex-1 max-w-[260px] mx-auto">
            {renderMonthCalendar(
              viewDate,
              true,
              // On mobile, show right arrow if not disabled
              typeof window !== 'undefined' && window.innerWidth < 768 ? !isNextDisabled : false
            )}
          </div>

          {/* Right Month (shown on desktop >= 768px) */}
          <div className="hidden md:block flex-1 max-w-[260px] mx-auto border-l border-slate-100 pl-5">
            {renderMonthCalendar(rightMonthDate, false, !isNextDisabled)}
          </div>
        </div>
      </div>

      {/* Manual Date Inputs & Action Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">From:</span>
            <input
              type="date"
              value={draftStart}
              max={effectiveMaxDate}
              onChange={(e) => setDraftStart(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>
          <span className="text-slate-300">—</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={draftEnd}
              min={draftStart}
              max={effectiveMaxDate}
              onChange={(e) => setDraftEnd(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          {rangeDuration && (
            <span className="hidden md:inline-flex text-[11px] font-bold text-[#159A1D] bg-[#159A1D]/10 px-2 py-0.5 rounded-full ml-1">
              {rangeDuration}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {(draftStart || draftEnd) && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!draftStart}
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#159A1D] hover:bg-[#118218] text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Check size={14} strokeWidth={2.6} />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block" data-no-row-click="true">
      <button
        ref={triggerRef}
        type="button"
        data-no-row-click="true"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className={`inline-flex items-center justify-between gap-2.5 bg-white border shadow-2xs transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${
          isOpen ? 'border-[#159A1D] ring-2 ring-[#159A1D]/20' : 'border-slate-200'
        } ${sizeClasses} ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon
            size={size === 'xs' ? 13 : 15}
            className={`shrink-0 transition-colors ${
              isOpen || hasRangeSelected ? 'text-[#159A1D]' : 'text-slate-400'
            }`}
          />
          <span
            className={`truncate ${
              hasRangeSelected ? 'text-slate-800 font-semibold' : 'text-slate-400'
            }`}
          >
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && hasRangeSelected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              title="Clear date range"
              onClick={handleReset}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleReset();
                }
              }}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={13} />
            </span>
          )}

          <ChevronDown
            size={size === 'xs' ? 12 : 14}
            strokeWidth={2.2}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-slate-700' : ''
            }`}
          />
        </div>
      </button>

      {popoverPortal}
    </div>
  );
}

export default DateRangePicker;
