"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { TotalBalanceCard } from '@/components/dashboardpage/TotalBalanceCard';
import { StatCard } from '@/components/dashboardpage/StatCard';
import { UpcomingBillsCard } from '@/components/dashboardpage/UpcomingBillsCard';
import { IncomeVsExpensesChart } from '@/components/dashboardpage/IncomeVsExpensesChart';
import { SpendingByCategoryChart } from '@/components/dashboardpage/SpendingByCategoryChart';
import { RecentTransactionsCard } from '@/components/dashboardpage/RecentTransactionsCard';
import { BudgetOverviewCard } from '@/components/dashboardpage/BudgetOverviewCard';
import { GoalsTrackingCard } from '@/components/dashboardpage/GoalsTrackingCard';
import { SubscriptionsBillsCard } from '@/components/dashboardpage/SubscriptionsBillsCard';

export default function DashboardPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Dashboard");
  }, [setHeaderData]);

  return (
    <div className="mx-auto space-y-6 pb-12">
      {/* Top Stats Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TotalBalanceCard />
        <StatCard 
          title="Today's Income" 
          amount="+$320.00"
          metrics={[
            { label: 'This week', value: '$1,840' },
            { label: 'This month', value: '$6,200' }
          ]}
        />
        <StatCard 
          title="Today's Expenses" 
          amount="-$148.50"
          amountColor="text-[#EF4444]"
          metrics={[
            { label: 'This week', value: '$620' },
            { label: 'This month', value: '$3,140' }
          ]}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Net Profit" 
          amount="+$171.50"
          metrics={[
            { label: 'Daily P&L', value: '+$171', valueColor: 'text-[#159A1D]' },
            { label: 'Monthly', value: '+$3,060', valueColor: 'text-[#159A1D]' },
            { label: 'Yearly', value: '+$18.2k', valueColor: 'text-[#159A1D]' }
          ]}
        />
        <StatCard 
          title="Cash Flow" 
          amount="$12,450"
          amountColor="text-[#3B82F6]"
          metrics={[
            { label: 'Money in', value: '$6,200', valueColor: 'text-[#159A1D]' },
            { label: 'Money out', value: '$3,140', valueColor: 'text-[#EF4444]' }
          ]}
        />
        <UpcomingBillsCard />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeVsExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <SpendingByCategoryChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactionsCard />
        <BudgetOverviewCard />
        <div className="flex flex-col h-full">
          <GoalsTrackingCard />
          <SubscriptionsBillsCard />
        </div>
      </div>
    </div>
  );
}
