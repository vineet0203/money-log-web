"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { StatCard } from '@/components/ui/StatCard';
import { SubscriptionDetailsTable } from '@/components/subscriptionpage/SubscriptionDetailsTable';
import { AddSubscriptionModal } from '@/components/subscriptionpage/AddSubscriptionModal';
import { CatchUpPanel } from '@/components/subscriptionpage/CatchUpPanel';
import { useGetSubscriptionStats, useGetCatchUpOccurrences } from '@/hooks/queries/subscriptions';
import { AlertCircle, ChevronRight, RefreshCw, Calendar, BellOff } from 'lucide-react';

export default function SubscriptionsPage() {
  const { setHeaderData } = useAppData();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatchUpOpen, setIsCatchUpOpen] = useState(false);
  
  const { data: stats } = useGetSubscriptionStats();
  const { data: catchUpData } = useGetCatchUpOccurrences();

  const ongoingCount = stats?.ongoing_count || '0';
  const upcomingCount = stats?.upcoming_count || '0';
  const inactiveCount = stats?.inactive_count || '0';
  const missedCount = catchUpData?.totalMissed || Number(stats?.total_missed_count) || 0;

  useEffect(() => {
    setHeaderData("Subscriptions", "Manage all your subscriptions, frequencies, and renewal schedules.");
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12 space-y-6">
      {/* Catch-Up Banner (§2.3, §2.7) */}
      {missedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-950">
                You have {missedCount} overdue payment{missedCount > 1 ? 's' : ''} to catch up
              </h4>
              <p className="text-xs font-medium text-rose-700/90 mt-0.5">
                Review and clear missed occurrences in one pass to keep your spending balance reconciled.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCatchUpOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors shrink-0"
          >
            <span>Review & Catch Up ({missedCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Stats Row: 4 Symmetrical StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Active Payments" 
          value={ongoingCount.toString().padStart(2, '0')} 
          color="green"
          icon={RefreshCw}
          subtitle="Currently running schedules"
        />
        <StatCard 
          title="Due Within 7 Days" 
          value={upcomingCount.toString().padStart(2, '0')} 
          color="amber"
          icon={Calendar}
          subtitle="Upcoming renewal dates"
        />
        <StatCard 
          title="Overdue / Missed" 
          value={missedCount.toString().padStart(2, '0')} 
          color="rose"
          icon={AlertCircle}
          subtitle={missedCount > 0 ? "Click to review and catch up" : "All payments up to date"}
          onClick={missedCount > 0 ? () => setIsCatchUpOpen(true) : undefined}
        />
        <StatCard 
          title="Inactive Payments" 
          value={inactiveCount.toString().padStart(2, '0')} 
          color="slate"
          icon={BellOff}
          subtitle="Paused or cancelled"
        />
      </div>

      {/* Subscription Details Table */}
      <SubscriptionDetailsTable onAddSubscription={() => setIsAddModalOpen(true)} />

      {/* Add Subscription Modal with Recurrence Builder */}
      <AddSubscriptionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Catch-Up Modal Panel */}
      <CatchUpPanel
        isOpen={isCatchUpOpen}
        onClose={() => setIsCatchUpOpen(false)}
      />
    </div>
  );
}
