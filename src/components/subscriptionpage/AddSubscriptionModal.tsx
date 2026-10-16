'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/input';
import { useGetCategories } from '@/hooks/queries/categories';
import { useAddSubscription, RecurrenceFrequency, RecurrenceEndMode } from '@/hooks/queries/subscriptions';
import { RecurrencePreview } from './RecurrencePreview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'quarterly', label: 'Quarterly (Every 3 months)' },
  { value: 'half_yearly', label: 'Half-yearly (Every 6 months)' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'daily', label: 'Daily' },
];

const END_MODE_OPTIONS = [
  { value: 'never', label: 'Never (Ongoing)' },
  { value: 'on_date', label: 'On specific date' },
  { value: 'after_n', label: 'After a number of payments' },
];

export function AddSubscriptionModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Recurrence rule parameters
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [intervalCount, setIntervalCount] = useState<number>(1);
  const [byMonthDay, setByMonthDay] = useState<number>(new Date().getDate());
  const [byWeekday, setByWeekday] = useState<number>(new Date().getDay());
  const [endMode, setEndMode] = useState<RecurrenceEndMode>('never');
  const [endDate, setEndDate] = useState<string>('');
  const [occurrencesTotal, setOccurrencesTotal] = useState<string>('');
  const [autoPost, setAutoPost] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState('');

  const { data: categories = [] } = useGetCategories();
  const { mutateAsync: addSubscription, isPending } = useAddSubscription();

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setRate(val);
  };

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    try {
      const dt = new Date(newDate);
      if (!isNaN(dt.getTime())) {
        setByMonthDay(dt.getDate());
        setByWeekday(dt.getDay());
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!name.trim() || !rate || !startDate || !categoryId) {
      setErrorMsg('Please fill out all required fields (Name, Amount, Category, Start Date)');
      return;
    }

    try {
      await addSubscription({
        name: name.trim(),
        amount: parseFloat(rate),
        type,
        billing_cycle: frequency === 'yearly' ? 'yearly' : 'monthly',
        frequency,
        interval_count: intervalCount,
        by_month_day: ['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency) ? byMonthDay : null,
        by_weekday: ['weekly', 'biweekly'].includes(frequency) ? byWeekday : null,
        end_mode: endMode,
        end_date: endMode === 'on_date' ? endDate : null,
        occurrences_total: endMode === 'after_n' && occurrencesTotal ? parseInt(occurrencesTotal, 10) : null,
        auto_post: autoPost,
        start_date: startDate,
        category_id: parseInt(categoryId, 10),
      });

      // Reset form
      setName('');
      setRate('');
      setCategoryId('');
      setType('expense');
      setFrequency('monthly');
      setIntervalCount(1);
      setEndMode('never');
      setEndDate('');
      setOccurrencesTotal('');
      setAutoPost(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to add recurring payment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Recurring Payment"
      description="Create a recurring income or expense rule with automated schedule occurrences."
      submitText={isPending ? 'Saving...' : 'Create Recurring Rule'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${
              type === 'expense'
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${
              type === 'income'
                ? 'bg-[#E7F8F0] text-[#159A1D] border-[#C5ECD9] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Basic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input 
            label="Name / Title *"
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Netflix, Apartment Rent, Salary" 
          />

          <Input 
            label="Amount ($) *"
            type="text" 
            value={rate}
            onChange={handleRateChange}
            placeholder="0.00" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select 
            label="Category *"
            placeholder="Select a category"
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map(c => ({
              value: c.id.toString(),
              label: c.name
            }))}
          />

          <DatePicker 
            label="First Payment / Start Date *"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>

        {/* Recurrence Frequency & Interval Section */}
        <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/60 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Recurrence Cadence
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Frequency"
              value={frequency}
              onChange={(val) => setFrequency(val as RecurrenceFrequency)}
              options={FREQUENCY_OPTIONS}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Interval (Repeat Every X {frequency.replace('_', ' ')}s)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={intervalCount}
                onChange={(e) => setIntervalCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
              />
            </div>
          </div>

          {/* Anchor Day Selection */}
          {['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Day of Month (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={byMonthDay}
                onChange={(e) => setByMonthDay(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
              />
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Automatically clamped on shorter months (e.g. 31st becomes 28th/29th in Feb, 30th in Apr).
              </p>
            </div>
          )}

          {['weekly', 'biweekly'].includes(frequency) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Day of Week
              </label>
              <select
                value={byWeekday}
                onChange={(e) => setByWeekday(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          {/* End Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Select
              label="End Condition"
              value={endMode}
              onChange={(val) => setEndMode(val as RecurrenceEndMode)}
              options={END_MODE_OPTIONS}
            />

            {endMode === 'on_date' && (
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            )}

            {endMode === 'after_n' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Occurrences
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={occurrencesTotal}
                  onChange={(e) => setOccurrencesTotal(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Materialization Preview */}
        <RecurrencePreview
          startDate={startDate}
          frequency={frequency}
          intervalCount={intervalCount}
          byMonthDay={['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency) ? byMonthDay : undefined}
          byWeekday={['weekly', 'biweekly'].includes(frequency) ? byWeekday : undefined}
          endMode={endMode}
          endDate={endMode === 'on_date' ? endDate : undefined}
          occurrencesTotal={endMode === 'after_n' && occurrencesTotal ? parseInt(occurrencesTotal, 10) : undefined}
          count={3}
        />

        {/* Automation Options (Auto-Post) */}
        <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/60 flex items-start gap-3">
          <input
            id="autoPostCheck"
            type="checkbox"
            checked={autoPost}
            onChange={(e) => setAutoPost(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]"
          />
          <label htmlFor="autoPostCheck" className="text-xs text-slate-600 cursor-pointer">
            <span className="font-bold block text-slate-900 text-sm mb-0.5">
              Automatic Posting (Recommended for Fixed Expenses / Salaries)
            </span>
            Automatically creates a ledger transaction on each due date in your local timezone without waiting for manual confirmation.
          </label>
        </div>
      </div>
    </Modal>
  );
}
