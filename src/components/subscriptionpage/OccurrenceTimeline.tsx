'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, RotateCcw, CreditCard, ExternalLink, Receipt, ArrowUpDown
} from 'lucide-react';
import {
  useGetOccurrences,
  usePayOccurrence,
  useSkipOccurrence,
  useUnskipOccurrence,
  useUndoSubscriptionPayment,
  RecurringOccurrence
} from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

interface OccurrenceTimelineProps {
  subscriptionId: string | number;
  subscriptionName: string;
  defaultAmount?: string | number;
  defaultCategoryId?: number | null;
}

export const OccurrenceTimeline: React.FC<OccurrenceTimelineProps> = ({
  subscriptionId,
  subscriptionName,
  defaultCategoryId,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedOccurrence, setSelectedOccurrence] = useState<RecurringOccurrence | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [payCategoryId, setPayCategoryId] = useState<number | null>(defaultCategoryId || null);

  const { data: categories = [] } = useGetCategories();

  // Confirmation states
  const [skipTarget, setSkipTarget] = useState<RecurringOccurrence | null>(null);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);

  const { data, isLoading } = useGetOccurrences(subscriptionId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort: sortOrder,
    limit: 50
  });

  const payOccurrence = usePayOccurrence();
  const skipOccurrence = useSkipOccurrence();
  const unskipOccurrence = useUnskipOccurrence();
  const undoPayment = useUndoSubscriptionPayment();
  const [unskipTarget, setUnskipTarget] = useState<RecurringOccurrence | null>(null);

  const occurrences = data?.data || [];

  const handleOpenPayModal = (occ: RecurringOccurrence) => {
    setSelectedOccurrence(occ);
    setPayAmount(occ.amount);
    // Default payment date to today so the expense accurately counts in the active month
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayCategoryId(defaultCategoryId || null);
    setPayModalOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedOccurrence) return;
    try {
      await payOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: selectedOccurrence.id,
        amount: parseFloat(payAmount),
        date: payDate,
        category_id: payCategoryId
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

  const handleConfirmUnskip = async (occ: RecurringOccurrence) => {
    setUnskipTarget(occ);
    try {
      await unskipOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: occ.id
      });
      setUnskipTarget(null);
    } catch (err) {
      console.error('Failed to unskip occurrence:', err);
      setUnskipTarget(null);
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

  const formatDate = (dStr: string | null | undefined) => {
    if (!dStr) return '';
    try {
      if (typeof dStr === 'string' && (dStr.includes('T') || dStr.includes(':') || dStr.includes(' '))) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
      const cleanDate = typeof dStr === 'string' ? dStr.split('T')[0].split(' ')[0] : '';
      const [y, m, d] = cleanDate.split('-').map(Number);
      if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) {
        const fallback = new Date(dStr);
        return isNaN(fallback.getTime()) ? String(dStr) : fallback.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(dStr);
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

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title={sortOrder === 'asc' ? 'Currently: Nearest date first. Click for furthest date first' : 'Currently: Furthest date first. Click for nearest date first'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'asc' ? 'Nearest First' : 'Furthest First'}</span>
          </button>

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
          {(() => {
            const latestPaidOccurrence = occurrences
              .filter(o => o.status === 'paid')
              .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];

            return occurrences.map((occ) => {
              const isLatestPaid = occ.status === 'paid' && latestPaidOccurrence?.id === occ.id;

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

                    {occ.status === 'paid' && occ.skipped_at && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80">
                          Previously Skipped
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {occ.transaction_description || (
                            <>
                              Skipped on {formatDate(occ.skipped_at)} • Paid on {occ.paid_at ? formatDate(occ.paid_at) : 'Paid'}
                              {(() => {
                                const dueTime = new Date(occ.due_date).getTime();
                                const payTime = occ.paid_at ? new Date(occ.paid_at).getTime() : new Date().getTime();
                                const diffDays = Math.round((payTime - dueTime) / (1000 * 60 * 60 * 24));
                                if (diffDays > 0) return ` (${diffDays} day${diffDays > 1 ? 's' : ''} late)`;
                                if (diffDays < 0) return ` (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} early)`;
                                return ' (on due date)';
                              })()}
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {occ.status === 'paid' && !occ.skipped_at && occ.transaction_description && (
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {occ.transaction_description}
                      </p>
                    )}

                    {occ.status === 'skipped' && occ.skipped_at && (
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        Skipped on {formatDate(occ.skipped_at)}
                      </p>
                    )}
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

                    {occ.status === 'skipped' && (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleConfirmUnskip(occ)}
                          loading={unskipOccurrence.isPending && unskipTarget?.id === occ.id}
                        >
                          Unskip
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
          });
        })()}
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
          {selectedOccurrence && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Scheduled Due Date:</span>
              <span className="font-bold text-slate-800">{formatDate(selectedOccurrence.due_date)}</span>
            </div>
          )}

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Payment Date
              </label>
              <span className="text-[10.5px] text-slate-400 font-medium">Defaults to today for accurate period tracking</span>
            </div>
            <input
              type="date"
              value={payDate}
              onChange={e => setPayDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={payCategoryId !== null && payCategoryId !== undefined ? String(payCategoryId) : ''}
              onChange={e => setPayCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            >
              <option value="">No Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link to Full Payment Form */}
          {selectedOccurrence && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <Link
                href={`/subscriptions/${subscriptionId}/pay?occId=${selectedOccurrence.id}&dueDate=${selectedOccurrence.due_date}&date=${payDate}&amount=${payAmount}&status=${selectedOccurrence.status}&skippedAt=${selectedOccurrence.skipped_at || ''}`}
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
