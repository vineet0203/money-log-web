import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSubscriptionModal({ isOpen, onClose }: Props) {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [startDate, setStartDate] = useState('2026-06-27');
  const [rate, setRate] = useState('');

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and dots (no commas)
    let val = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point is allowed
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    setRate(val);
  };

  const handleSubmit = () => {
    // mock submit action
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Subscription"
      submitText="Add Subscription"
    >
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-[#4F627A] mb-1.5">
            Name
          </label>
          <input 
            type="text" 
            placeholder="e.g. Netflix, Spotify" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
          />
        </div>

        {/* Rate */}
        <div>
          <label className="block text-sm font-bold text-[#4F627A] mb-1.5">
            Rate ($)
          </label>
          <input 
            type="text" 
            value={rate}
            onChange={handleRateChange}
            placeholder="15.99" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
          />
        </div>

        {/* Billing Cycle Toggle */}
        <div>
          <label className="block text-sm font-bold text-[#4F627A] mb-1.5">
            Billing Cycle
          </label>
          <div className="flex w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('Monthly')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                billingCycle === 'Monthly' 
                  ? 'bg-[#62D279] text-white' 
                  : 'text-[#647892] hover:bg-slate-50'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('Yearly')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                billingCycle === 'Yearly' 
                  ? 'bg-[#62D279] text-white' 
                  : 'text-[#647892] hover:bg-slate-50'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Category Select */}
        <div>
          <Select 
            label="Category"
            placeholder="Tap to select a category"
            className="shadow-sm text-slate-400"
            options={[
              { value: 'entertainment', label: 'Entertainment' },
              { value: 'productivity', label: 'Productivity' },
              { value: 'utilities', label: 'Utilities' },
              { value: 'health_fitness', label: 'Health & Fitness' },
              { value: 'education', label: 'Education' },
              { value: 'finance', label: 'Finance' },
              { value: 'software', label: 'Software' },
              { value: 'food_delivery', label: 'Food & Delivery' },
            ]}
          />
        </div>

        {/* Start Date */}
        <div>
          <DatePicker 
            label="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChange={setStartDate}
          />
        </div>
      </div>
    </Modal>
  );
}
