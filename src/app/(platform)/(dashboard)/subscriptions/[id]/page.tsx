"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { Calendar, Clock, Repeat, Folder, Zap, CheckCircle2, Pencil } from 'lucide-react';
import { RemindersSettings } from '@/components/subscriptionpage/RemindersSettings';
import { OccurrenceTimeline } from '@/components/subscriptionpage/OccurrenceTimeline';
import { useGetSubscriptionDetails } from '@/hooks/queries/subscriptions';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { formatRecurrenceFrequency } from '@/lib/recurrenceFormatters';
import { AddSubscriptionModal } from '@/components/subscriptionpage/AddSubscriptionModal';

export default function SubscriptionDetailsPage() {
  const { setHeaderData } = useAppData();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, error } = useGetSubscriptionDetails(id);

  useEffect(() => {
    if (data?.subscription) {
      setHeaderData(`#${data.subscription.id} ${data.subscription.name}`, "View and manage recurring schedule and materialized occurrences.", true);
    }
  }, [setHeaderData, data]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading recurring schedule details...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-medium">Failed to load payment details.</div>;
  }

  const { subscription } = data;
  const isIncome = subscription.type === 'income';

  const OverviewRow = ({ icon: Icon, label, value, iconBg = "bg-slate-100", iconColor = "text-slate-600" }: any) => (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <span className="font-medium text-slate-500 text-xs sm:text-sm">{label}</span>
      </div>
      <span className="font-semibold text-slate-800 text-xs sm:text-sm text-right">{value}</span>
    </div>
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex-shrink-0">
            <SubscriptionLogo name={subscription.name} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{subscription.name}</h2>
              {subscription.auto_post ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  <Zap className="w-3 h-3" /> Auto-post
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#159A1D]">${parseFloat(subscription.amount).toFixed(2)}</span>
              <span className="text-xs font-medium text-slate-400 capitalize">· {formatRecurrenceFrequency(subscription)}</span>
            </div>
          </div>
        </div>

        {/* Edit Recurring Payment Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Recurring Payment</span>
          </button>
        </div>
      </div>

      {/* Grid Layout for Overview and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Main Details Card (Overview) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-1">Overview</h3>
          
          <div className="flex flex-col px-1">
            <OverviewRow 
              icon={Calendar} 
              label="Start Date" 
              value={new Date(subscription.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
              iconBg="bg-blue-50" 
              iconColor="text-blue-500" 
            />
            <OverviewRow 
              icon={Clock} 
              label={isIncome ? "Due / Expected Date" : "Due Date"} 
              value={new Date(subscription.next_billing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
              iconBg="bg-orange-50" 
              iconColor="text-orange-500" 
            />
            <OverviewRow 
              icon={CheckCircle2} 
              label={isIncome ? "Last Received Date" : "Last Paid Date"} 
              value={subscription.last_paid_date 
                ? new Date(subscription.last_paid_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : "No payments recorded yet"} 
              iconBg="bg-emerald-50" 
              iconColor="text-[#159A1D]" 
            />
            <OverviewRow 
              icon={Repeat} 
              label="Frequency" 
              value={formatRecurrenceFrequency(subscription)} 
              iconBg="bg-emerald-50" 
              iconColor="text-emerald-500" 
            />
            <OverviewRow 
              icon={Zap} 
              label="Posting Mode" 
              value={subscription.auto_post ? "Automatic on due date" : "Manual confirmation"} 
              iconBg="bg-amber-50" 
              iconColor="text-amber-500" 
            />
            <OverviewRow 
              icon={Folder} 
              label="Category" 
              value={subscription.category_name || 'Uncategorized'} 
              iconBg="bg-indigo-50" 
              iconColor="text-indigo-500" 
            />
          </div>
        </div>

        {/* Reminders Settings Component */}
        <div className="w-full">
          <RemindersSettings 
            subscriptionId={subscription.id.toString()}
            initialSettings={{
              is_reminder_on: subscription.is_reminder_on === 1 || subscription.is_reminder_on === true,
              reminder_days: subscription.reminder_days || 7,
              is_sms_enabled: subscription.is_sms_enabled === 1 || subscription.is_sms_enabled === true,
              is_email_enabled: subscription.is_email_enabled === 1 || subscription.is_email_enabled === true,
            }}
            billingCycle={subscription.billing_cycle}
          />
        </div>
      </div>

      {/* Occurrence Timeline */}
      <div className="mt-2">
        <OccurrenceTimeline
          subscriptionId={subscription.id}
          subscriptionName={subscription.name}
          defaultAmount={subscription.amount}
          defaultCategoryId={subscription.category_id}
        />
      </div>

      {/* Edit Recurring Payment Modal */}
      <AddSubscriptionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        subscription={subscription}
      />
    </div>
  );
}
