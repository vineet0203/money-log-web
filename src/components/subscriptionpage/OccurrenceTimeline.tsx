'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, RotateCcw, CreditCard, ExternalLink, Receipt
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

interface OccurrenceTimelineProps {
  subscriptionId: string | number;
  subscriptionName: string;
  defaultAmount?: string | number;
}

export const OccurrenceTimeline: React.FC<OccurrenceTimelineProps> = ({
  subscriptionId,
  subscriptionName,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOccurrence, setSelectedOccurrence] = useState<RecurringOccurrence | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');

  // Confirmation states
  const [skipTarget, setSkipTarget] = useState<RecurringOccurrence | null>(null);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);

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

  const handleConfirmSkip = async () => {
    if (!skipTarget) return;
    try {
      await skipOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: skipTarget.id
      });
      setSkipTarget(null);
    } catch (err) {
      console.error('Failed to skip occurrence:', err);
    }
  };

  const handleConfirmUndo = async () => {
    try {
      await undoPayment.mutateAsync(subscriptionId);
      setUndoConfirmOpen(false);
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
    return <StatusBadge status={status} size="sm" />;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col gap-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#159A1D]" />
            Recurring Occurrences Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
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
                    <div className="flex items-center gap-3 mt-0.5">
                      {occ.paid_at && (
                        <p className="text-[11px] font-semibold text-slate-400">
                          Recorded on {new Date(occ.paid_at).toLocaleDateString()}
                        </p>
                      )}
                      {occ.transaction_id && (
                        <Link
                          href={`/transactions/${occ.transaction_id}/edit`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159A1D] hover:text-[#118218] hover:underline transition-colors"
                          title="View full transaction details and receipt"
                        >
                          <span>Tx #{occ.transaction_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="font-bold font-mono text-sm sm:text-base text-slate-900">
                    ${parseFloat(occ.amount).toFixed(2)}
                  </div>

                  {/* Contextual Actions */}
                  <div className="flex items-center gap-2">
                    {(occ.status === 'due' || occ.status === 'missed') && (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setSkipTarget(occ)}
                          loading={skipOccurrence.isPending && skipTarget?.id === occ.id}
                        >
                          Skip
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => handleOpenPayModal(occ)}
                          loading={payOccurrence.isPending && selectedOccurrence?.id === occ.id}
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                          Pay
                        </Button>
                      </>
                    )}

                    {occ.status === 'paid' && isLatestPaid && (
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => setUndoConfirmOpen(true)}
                        loading={undoPayment.isPending}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="!bg-rose-50 !text-rose-600 hover:!bg-rose-100 !border !border-rose-200"
                      >
                        Undo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Skipping Occurrence */}
      {skipTarget && (
        <ConfirmDialog
          isOpen={skipTarget !== null}
          onClose={() => setSkipTarget(null)}
          onConfirm={handleConfirmSkip}
          title="Skip Recurring Occurrence"
          description={
            <span>
              Are you sure you want to skip the occurrence for{' '}
              <strong className="text-slate-900 font-bold">
                {formatDate(skipTarget.due_date)}
              </strong>{' '}
              (${parseFloat(skipTarget.amount).toFixed(2)})? This cycle will be marked as skipped without recording an expense or income transaction.
            </span>
          }
          confirmText="Yes, Skip"
          cancelText="Cancel"
          variant="warning"
          isLoading={skipOccurrence.isPending}
        />
      )}

      {/* Confirmation Dialog for Undoing Payment */}
      {undoConfirmOpen && (
        <ConfirmDialog
          isOpen={undoConfirmOpen}
          onClose={() => setUndoConfirmOpen(false)}
          onConfirm={handleConfirmUndo}
          title="Undo Last Payment"
          description="Are you sure you want to undo the latest payment? This will revert the occurrence back to due and remove the linked transaction record."
          confirmText="Yes, Undo Payment"
          cancelText="Cancel"
          variant="danger"
          isLoading={undoPayment.isPending}
        />
      )}

      {/* Modal for Recording Occurrence Payment */}
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
              onWheel={e => e.currentTarget.blur()}
              onKeyDown={e => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
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

          {/* Link to Full Payment Form */}
          {selectedOccurrence && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <Link
                href={`/subscriptions/${subscriptionId}/pay?occId=${selectedOccurrence.id}&date=${payDate}&amount=${payAmount}`}
                className="text-xs font-bold text-[#159A1D] hover:text-[#118218] hover:underline flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Need to attach receipt photo or custom category? Open Full Payment Form →</span>
              </Link>
            </div>
          )}

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
