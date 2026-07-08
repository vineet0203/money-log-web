"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { SubscriptionStatCard } from '@/components/subscriptionpage/SubscriptionStatCard';
import { AddSubscriptionCard } from '@/components/subscriptionpage/AddSubscriptionCard';
import { SubscriptionDetailsTable } from '@/components/subscriptionpage/SubscriptionDetailsTable';
import { AddSubscriptionModal } from '@/components/subscriptionpage/AddSubscriptionModal';

export default function SubscriptionsPage() {
  const { setHeaderData } = useAppData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setHeaderData("Subscription Management", "Manage all your subscription in one place.");
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12 space-y-6">
      {/* Top Stats & Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SubscriptionStatCard title="On Going Subscriptions" value="12" />
        <SubscriptionStatCard title="Upcoming Subscriptions" value="05" />
        <SubscriptionStatCard title="Inactive Subscription" value="04" />
        <AddSubscriptionCard onClick={() => setIsAddModalOpen(true)} />
      </div>

      {/* Subscription Details Table */}
      <SubscriptionDetailsTable />

      {/* Add Subscription Modal */}
      <AddSubscriptionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
