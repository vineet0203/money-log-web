"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { TotalBalanceCard } from '@/components/dashboardpage/TotalBalanceCard';
import { StatCard } from '@/components/dashboardpage/StatCard';
import { IncomeVsExpensesChart } from '@/components/dashboardpage/IncomeVsExpensesChart';
import { SpendingByCategoryChart } from '@/components/dashboardpage/SpendingByCategoryChart';
import { RecentTransactionsCard } from '@/components/dashboardpage/RecentTransactionsCard';
import { BudgetOverviewCard } from '@/components/dashboardpage/BudgetOverviewCard';
import { SubscriptionsBillsCard } from '@/components/dashboardpage/SubscriptionsBillsCard';
import { useGetDashboardOverview } from '@/hooks/queries/dashboard';

export default function DashboardPage() {
  const { setHeaderData } = useAppData();
  const { data: dashboard, isLoading } = useGetDashboardOverview();

  const format = (val: number) => Math.abs(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formatSign = (val: number) => (val >= 0 ? '+' : '-') + format(val);
  
  useEffect(() => {
    setHeaderData("Dashboard");
  }, [setHeaderData]);

  return (
    <div className="mx-auto space-y-6 pb-12">
      {/* Top Stats Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TotalBalanceCard data={dashboard?.totalBalance} />
        <StatCard 
          title="Today's Income" 
          amount={dashboard ? formatSign(dashboard.todayIncome.today) : '$0.00'}
          metrics={[
            { label: 'This week', value: dashboard ? format(dashboard.todayIncome.thisWeek) : '$0.00' },
            { label: 'This month', value: dashboard ? format(dashboard.todayIncome.thisMonth) : '$0.00' }
          ]}
        />
        <StatCard 
          title="Today's Expenses" 
          amount={dashboard ? formatSign(-dashboard.todayExpenses.today) : '$0.00'}
          amountColor="text-[#EF4444]"
          metrics={[
            { label: 'This week', value: dashboard ? format(dashboard.todayExpenses.thisWeek) : '$0.00' },
            { label: 'This month', value: dashboard ? format(dashboard.todayExpenses.thisMonth) : '$0.00' }
          ]}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Net Profit" 
          amount={dashboard ? formatSign(dashboard.netProfit.daily) : '$0.00'}
          amountColor={dashboard && dashboard.netProfit.daily < 0 ? 'text-[#EF4444]' : 'text-[#159A1D]'}
          metrics={[
            { label: 'Daily P&L', value: dashboard ? formatSign(dashboard.netProfit.daily) : '$0.00', valueColor: dashboard?.netProfit.daily >= 0 ? 'text-[#159A1D]' : 'text-[#EF4444]' },
            { label: 'Monthly', value: dashboard ? formatSign(dashboard.netProfit.monthly) : '$0.00', valueColor: dashboard?.netProfit.monthly >= 0 ? 'text-[#159A1D]' : 'text-[#EF4444]' },
            { label: 'Yearly', value: dashboard ? formatSign(dashboard.netProfit.yearly) : '$0.00', valueColor: dashboard?.netProfit.yearly >= 0 ? 'text-[#159A1D]' : 'text-[#EF4444]' }
          ]}
        />
        <StatCard 
          title="Cash Flow" 
          amount={dashboard ? format(dashboard.todayIncome.thisMonth + dashboard.todayExpenses.thisMonth) : '$0.00'}
          amountColor="text-[#3B82F6]"
          metrics={[
            { label: 'Money in', value: dashboard ? format(dashboard.todayIncome.thisMonth) : '$0.00', valueColor: 'text-[#159A1D]' },
            { label: 'Money out', value: dashboard ? format(dashboard.todayExpenses.thisMonth) : '$0.00', valueColor: 'text-[#EF4444]' }
          ]}
        />
        <SubscriptionsBillsCard count={dashboard?.upcomingSubscriptions?.count} items={dashboard?.upcomingSubscriptions?.items} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeVsExpensesChart data={dashboard?.charts?.incomeVsExpenses} />
        </div>
        <div className="lg:col-span-1">
          <SpendingByCategoryChart data={dashboard?.charts?.spendingByCategory} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsCard transactions={dashboard?.recentTransactions} />
        <BudgetOverviewCard budgets={dashboard?.budgets} />
        
      </div>
    </div>
  );
}
