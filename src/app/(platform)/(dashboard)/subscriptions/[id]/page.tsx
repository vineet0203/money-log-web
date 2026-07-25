"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { Play, Calendar, Clock, Repeat, Edit, Folder, Pencil, History, CreditCard } from 'lucide-react';
import { RemindersSettings } from '@/components/subscriptionpage/RemindersSettings';
import { PaymentHistoryTable } from '@/components/subscriptionpage/PaymentHistoryTable';
import { useGetSubscriptionDetails } from '@/hooks/queries/subscriptions';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { useSnackbar } from 'notistack';

export default function SubscriptionDetailsPage() {
  const { setHeaderData } = useAppData();
  const params = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const id = params?.id as string;

  const { data, isLoading, error } = useGetSubscriptionDetails(id);

  useEffect(() => {
    if (data?.subscription) {
      setHeaderData(`#${data.subscription.id} ${data.subscription.name}`, "View and manage your subscription details.", true);
    }
  }, [setHeaderData, data]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading subscription details...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-medium">Failed to load subscription.</div>;
  }

  const { subscription, transactions } = data;

  const OverviewRow = ({ icon: Icon, label, value, iconBg = "bg-[#EEF2F6]", iconColor = "text-[#637381]" }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-full ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-500 text-sm">{label}</span>
      </div>
      <span className="font-extrabold text-slate-800 text-sm">{value}</span>
    </div>
  );

  const handlePayClick = () => {
    if (data?.subscription) {
      const { next_billing_date, billing_cycle } = data.subscription;
      const today = new Date();
      const nextDate = new Date(next_billing_date);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const maxDays = billing_cycle === 'yearly' ? 30 : 15;
      
      if (diffDays > maxDays) {
        enqueueSnackbar(`Too early! You can only pay up to ${maxDays} days before the due date.`, { variant: 'warning' });
        return;
      }
    }
    router.push(`/subscriptions/${id}/pay`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header Card (Horizontal Layout) */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5 min-w-[200px]">
          <div className="flex-shrink-0">
            <SubscriptionLogo name={subscription.name} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-slate-900">{subscription.name}</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#159A1D]">${parseFloat(subscription.amount).toFixed(2)}</span>
              <span className="text-sm font-bold text-slate-400 capitalize">/{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={handlePayClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all whitespace-nowrap"
          >
            <CreditCard size={16} />
            Pay
          </button>
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap"
          >
            <Pencil size={16} />
            Edit Subscription
          </button>
        </div>
      </div>

      {/* Grid Layout for Overview and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Main Details Card (Overview) */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-800 mb-2 px-1">Overview</h3>
          
          <div className="flex flex-col px-1">
            <OverviewRow 
              icon={Calendar} 
              label="Started Date" 
              value={new Date(subscription.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
              iconBg="bg-blue-50" 
              iconColor="text-blue-500" 
            />
            <OverviewRow 
              icon={Clock} 
              label="Next Bill" 
              value={new Date(subscription.next_billing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
              iconBg="bg-orange-50" 
              iconColor="text-orange-500" 
            />
            <OverviewRow 
              icon={Repeat} 
              label="Billing Cycle" 
              value={subscription.billing_cycle} 
              iconBg="bg-emerald-50" 
              iconColor="text-emerald-500" 
            />
            <OverviewRow 
              icon={Edit} 
              label="Source" 
              value={subscription.source || 'Manual Added'} 
              iconBg="bg-purple-50" 
              iconColor="text-purple-500" 
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

      {/* Payment History Section */}
      <div className="flex flex-col mt-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-extrabold text-slate-800">Payment History</h3>
          <span className="text-sm font-bold text-slate-400">{transactions.length} Records</span>
        </div>
        
        <PaymentHistoryTable transactions={transactions} />
      </div>
    </div>
  );
}
