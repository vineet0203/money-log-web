'use client';

import React, { useState } from 'react';
import {
  Calendar, CheckCircle2, AlertCircle, SkipForward,
  RotateCcw, CreditCard
} from 'lucide-react';
import {
  useGetOccurrences,
  usePayOccurrence,
  useSkipOccurrence,
  useUndoSubscriptionPayment,
  RecurringOccurrence
} from '@/hooks/queries/subscriptions';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';

interface OccurrenceTimelineProps {
  subscriptionId: string | number;
  subscriptionName: string;
  defaultAmount?: string | number;
}

export const OccurrenceTimeline: React.FC<OccurrenceTimelineProps> = ({
  subscriptionId,
  subscriptionName,
  defaultAmount
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOccurrence, setSelectedOccurrence] = useState<RecurringOccurrence | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');

  const { data, isLoading } = useGetOccurrences(subscriptionId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50
  });

  const payOccurrence = usePayOccurrence();
  const skipOccurrence = useSkipOccurrence();
  const undoPayment = useUndoSubscriptionPayment();

  const occurrences = data?.data || [];

  const handleOpenPayModal = (occ: RecurringOccurrence) => {
    setSelectedOccurrence(occ);
    setPayAmount(occ.amount);
    setPayDate(occ.due_date);
    setPayModalOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedOccurrence) return;
    try {
      await payOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: selectedOccurrence.id,
        amount: parseFloat(payAmount),
        date: payDate
      });
      setPayModalOpen(false);
      setSelectedOccurrence(null);
    } catch (err) {
      console.error('Failed to pay occurrence:', err);
    }
  };

  const handleSkip = async (occId: number) => {
    try {
      await skipOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: occId
      });
    } catch (err) {
      console.error('Failed to skip occurrence:', err);
    }
  };

  const handleUndo = async () => {
    try {
      await undoPayment.mutateAsync(subscriptionId);
    } catch (err) {
      console.error('Failed to undo payment:', err);
    }
  };

  const formatDate = (dStr: string) => {
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  const getStatusBadge = (status: RecurringOccurrence['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E7F8F0] text-[#159A1D] border border-[#C5ECD9]">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Calendar className="w-3 h-3" /> Due
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="w-3 h-3" /> Missed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <SkipForward className="w-3 h-3" /> Skipped
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-400">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#159A1D]" />
            Recurring Occurrences Timeline
          </h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Materialized due dates, payment records, and schedule status.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
          {['all', 'due', 'paid', 'missed', 'skipped'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          <Skeleton variant="rectangular" className="h-14 w-full rounded-2xl" />
          <Skeleton variant="rectangular" className="h-14 w-full rounded-2xl" />
          <Skeleton variant="rectangular" className="h-14 w-full rounded-2xl" />
        </div>
      ) : occurrences.length === 0 ? (
        <div className="text-center py-10 text-xs font-medium text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          No occurrences found matching the &quot;{statusFilter}&quot; filter.
        </div>
      ) : (
        <div className="space-y-3">
          {occurrences.map((occ, idx) => {
            const isLatestPaid = occ.status === 'paid' && !occurrences.slice(0, idx).some(o => o.status === 'paid');

            return (
              <div
                key={occ.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all gap-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatDate(occ.due_date)}
                      </span>
                      {getStatusBadge(occ.status)}
                    </div>
                    {occ.paid_at && (
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        Recorded on {new Date(occ.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="font-extrabold text-base text-slate-900">
                    ${parseFloat(occ.amount).toFixed(2)}
                  </div>

                  {/* Contextual Actions */}
                  <div className="flex items-center gap-2">
                    {(occ.status === 'due' || occ.status === 'missed') && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSkip(occ.id)}
                          disabled={skipOccurrence.isPending}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPayModal(occ)}
                          disabled={payOccurrence.isPending}
                          className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#159A1D] hover:bg-[#118218] text-white shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay
                        </button>
                      </>
                    )}

                    {occ.status === 'paid' && isLatestPaid && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={undoPayment.isPending}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Confirming Occurrence Payment with optional override */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Record Payment for ${subscriptionName}`}
        description="Confirm payment details to create a transaction and mark this occurrence paid."
        maxWidth="max-w-lg"
        hideFooter={true}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Date
            </label>
            <input
              type="date"
              value={payDate}
              onChange={e => setPayDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPay}
              disabled={payOccurrence.isPending || !payAmount}
              className="px-5 py-2 text-sm font-bold rounded-xl bg-[#159A1D] hover:bg-[#118218] text-white shadow-sm disabled:opacity-50 transition-all"
            >
              {payOccurrence.isPending ? 'Recording...' : 'Confirm & Mark Paid'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
