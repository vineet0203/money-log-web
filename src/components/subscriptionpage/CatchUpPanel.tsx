'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckSquare, Square, SkipForward, CreditCard, Sparkles } from 'lucide-react';
import { useGetCatchUpOccurrences, useBulkCatchUp, CatchUpOccurrence } from '@/hooks/queries/subscriptions';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';

interface CatchUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatchUpPanel: React.FC<CatchUpPanelProps> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useGetCatchUpOccurrences();
  const bulkCatchUp = useBulkCatchUp();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const missedItems: CatchUpOccurrence[] = data?.data || [];

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === missedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(missedItems.map(m => m.id));
    }
  };

  const selectedTotal = missedItems
    .filter(m => selectedIds.includes(m.id))
    .reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0);

  const handleProcess = async (action: 'pay' | 'skip') => {
    if (selectedIds.length === 0) return;
    try {
      await bulkCatchUp.mutateAsync({
        action,
        occurrence_ids: selectedIds,
      });
      setSelectedIds([]);
      if (missedItems.length <= selectedIds.length) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to process bulk catch-up:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catch Up Missed Payments"
      description="Review and resolve payments that fell past due while you were away."
      maxWidth="max-w-2xl"
      hideFooter={true}
    >
      <div className="space-y-4 pt-1">
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton variant="rectangular" className="h-16 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-16 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-16 w-full rounded-2xl" />
          </div>
        ) : missedItems.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                All caught up!
              </h4>
              <p className="text-sm font-medium text-slate-500 mt-1">
                You have no missed or overdue recurring payments.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header selection control */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {selectedIds.length === missedItems.length ? (
                  <CheckSquare className="w-4 h-4 text-[#159A1D]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedIds.length === missedItems.length ? 'Deselect All' : 'Select All'} ({missedItems.length})
                </span>
              </button>

              <div className="text-xs font-bold text-slate-700">
                Selected: <span className="text-[#159A1D] font-extrabold">${selectedTotal.toFixed(2)}</span> ({selectedIds.length})
              </div>
            </div>

            {/* List of missed occurrences */}
            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {missedItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#159A1D] bg-emerald-50/40 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[#159A1D]">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#159A1D]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {item.subscription_name}
                          </span>
                          {item.category_name && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: item.category_color ? `${item.category_color}18` : '#94A3B818',
                                color: item.category_color || '#64748B'
                              }}
                            >
                              {item.category_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Due: {formatDate(item.due_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-900">
                        ${parseFloat(item.amount).toFixed(2)}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block mt-1">
                        Missed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIds.length === 0 || bulkCatchUp.isPending}
                  onClick={() => handleProcess('skip')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <SkipForward className="w-4 h-4 text-slate-500" />
                  <span>Skip Selected ({selectedIds.length})</span>
                </button>

                <button
                  type="button"
                  disabled={selectedIds.length === 0 || bulkCatchUp.isPending}
                  onClick={() => handleProcess('pay')}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl bg-[#159A1D] hover:bg-[#118218] text-white shadow-sm disabled:opacity-50 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Selected ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
