"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { SavingsRateCard } from '@/components/dashboardpage/SavingsRateCard';
import { StatCard } from '@/components/dashboardpage/StatCard';
import { IncomeVsExpensesChart } from '@/components/dashboardpage/IncomeVsExpensesChart';
import { SpendingByCategoryChart } from '@/components/dashboardpage/SpendingByCategoryChart';
import { RecentTransactionsCard } from '@/components/dashboardpage/RecentTransactionsCard';
import { BudgetOverviewCard } from '@/components/dashboardpage/BudgetOverviewCard';
import { SubscriptionsBillsCard } from '@/components/dashboardpage/SubscriptionsBillsCard';
import { PosDashboardView } from '@/components/dashboardpage/PosDashboardView';
import { useGetDashboardOverview } from '@/hooks/queries/dashboard';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { LayoutDashboard, Store } from 'lucide-react';

export default function DashboardPage() {
  const { setHeaderData } = useAppData();
  const { data: dashboard, isLoading } = useGetDashboardOverview();
  const [activeTab, setActiveTab] = useState<'finance' | 'pos'>('finance');

  const format = (val: number) =>
    Math.abs(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formatSign = (val: number) => (val >= 0 ? '+' : '-') + format(val);

  useEffect(() => {
    setHeaderData("Dashboard");
  }, [setHeaderData]);

  const dashboardTabs: TabItem<'finance' | 'pos'>[] = [
    {
      id: 'finance',
      label: 'Finance & Accounts',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      label: 'Point of Sale (POS)',
      icon: Store,
      badge: (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
            activeTab === 'pos'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          Live
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto space-y-6 pb-12 w-full max-w-full">
      {/* Dashboard View Tabs Container */}
      <div className="flex items-center max-w-full overflow-x-auto custom-scrollbar pb-0.5">
        <Tabs<'finance' | 'pos'>
          tabs={dashboardTabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          variant="contained"
          size="md"
        />
      </div>

      {/* Tab 1: Finance & Accounts */}
      {activeTab === 'finance' && (
        <div className="space-y-6 max-w-full">
          {/* Top Stats Row 1: Primary Headline Row per Implementation Plan §3A.3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {/* Replaces TotalBalanceCard with SavingsRateCard */}
            <SavingsRateCard
              savingsRate={dashboard?.savingsRate}
              income={dashboard?.todayIncome?.thisMonth}
              expenses={dashboard?.todayExpenses?.thisMonth}
            />

            {/* Income MTD with Month-over-Month Delta */}
            <StatCard
              title="Income (This Month)"
              info="Month-to-date total of all income deposits received since the 1st of this month."
              amount={dashboard ? formatSign(dashboard.todayIncome.thisMonth) : '$0.00'}
              amountColor="text-[#159A1D]"
              delta={
                dashboard?.todayIncome?.delta !== null && dashboard?.todayIncome?.delta !== undefined
                  ? {
                      value: dashboard.todayIncome.delta,
                      isGood: dashboard.todayIncome.delta >= 0,
                      label: 'vs last month',
                    }
                  : undefined
              }
              metrics={[
                {
                  label: 'Today',
                  value: dashboard ? formatSign(dashboard.todayIncome.today) : '$0.00',
                  valueColor: 'text-[#159A1D]',
                },
                {
                  label: 'This week',
                  value: dashboard ? format(dashboard.todayIncome.thisWeek) : '$0.00',
                },
              ]}
            />

            {/* Expenses MTD with Month-over-Month Delta (decrease is good) */}
            <StatCard
              title="Expenses (This Month)"
              info="Month-to-date total of all outgoing payments and recorded expenses for this month."
              amount={dashboard ? formatSign(-dashboard.todayExpenses.thisMonth) : '$0.00'}
              amountColor="text-rose-600"
              delta={
                dashboard?.todayExpenses?.delta !== null && dashboard?.todayExpenses?.delta !== undefined
                  ? {
                      value: dashboard.todayExpenses.delta,
                      // For expenses, a reduction (<= 0) is good
                      isGood: dashboard.todayExpenses.delta <= 0,
                      label: 'vs last month',
                    }
                  : undefined
              }
              metrics={[
                {
                  label: 'Today',
                  value: dashboard ? formatSign(-dashboard.todayExpenses.today) : '$0.00',
                  valueColor: 'text-rose-600',
                },
                {
                  label: 'This week',
                  value: dashboard ? format(dashboard.todayExpenses.thisWeek) : '$0.00',
                },
              ]}
            />
          </div>

          {/* Stats Row 2: Secondary Planning, Commitments & Projections per §3A.3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {/* Net Cash Flow with MoM Delta */}
            <StatCard
              title="Net Cash Flow"
              info="Net cash movement (Total Income minus Total Expenses) across the current month."
              amount={dashboard ? formatSign(dashboard.netProfit.monthly) : '$0.00'}
              amountColor={
                dashboard && dashboard.netProfit.monthly < 0 ? 'text-rose-600' : 'text-[#159A1D]'
              }
              delta={
                dashboard?.netProfit?.delta !== null && dashboard?.netProfit?.delta !== undefined
                  ? {
                      value: dashboard.netProfit.delta,
                      isGood: dashboard.netProfit.delta >= 0,
                      label: 'vs last month',
                    }
                  : undefined
              }
              metrics={[
                {
                  label: 'Daily P&L',
                  value: dashboard ? formatSign(dashboard.netProfit.daily) : '$0.00',
                  valueColor: dashboard?.netProfit.daily >= 0 ? 'text-[#159A1D]' : 'text-rose-600',
                },
                {
                  label: 'Yearly P&L',
                  value: dashboard ? formatSign(dashboard.netProfit.yearly) : '$0.00',
                  valueColor: dashboard?.netProfit.yearly >= 0 ? 'text-[#159A1D]' : 'text-rose-600',
                },
              ]}
            />

            {/* Committed Recurring Outflow */}
            <StatCard
              title="Committed Outflow"
              info="Total monthly committed expenses required by active recurring subscriptions and scheduled bills."
              amount={dashboard?.commitments ? format(dashboard.commitments.monthlyCommitted) : '$0.00'}
              amountColor="text-purple-700"
              subtitle={
                dashboard?.commitments?.committedPercentOfIncome !== null &&
                dashboard?.commitments?.committedPercentOfIncome !== undefined
                  ? `${dashboard.commitments.committedPercentOfIncome}% of monthly income`
                  : 'Recurring monthly commitments'
              }
              metrics={[
                {
                  label: 'Due in 7 days',
                  value: dashboard?.commitments
                    ? `${dashboard.commitments.dueNext7.count} (${format(dashboard.commitments.dueNext7.amount)})`
                    : '0 ($0.00)',
                  valueColor: 'text-amber-700',
                },
                {
                  label: 'Due in 30 days',
                  value: dashboard?.commitments
                    ? `${dashboard.commitments.dueNext30.count} (${format(dashboard.commitments.dueNext30.amount)})`
                    : '0 ($0.00)',
                },
              ]}
            />

            {/* Spend Projections */}
            <StatCard
              title="Projected Month-End"
              info="Estimated month-end expenditure based on average daily spend extrapolated across the full month."
              amount={dashboard?.projection ? format(dashboard.projection.projectedMonthEndSpend) : '$0.00'}
              amountColor="text-blue-600"
              subtitle={
                dashboard?.projection
                  ? `Based on daily avg of ${format(dashboard.projection.averageDailySpend)}`
                  : undefined
              }
              metrics={[
                {
                  label: 'Days elapsed',
                  value: dashboard?.projection
                    ? `${dashboard.projection.daysElapsed} of ${dashboard.projection.daysInMonth} days`
                    : '—',
                },
                {
                  label: 'Spent MTD',
                  value: dashboard ? format(dashboard.todayExpenses.thisMonth) : '$0.00',
                  valueColor: 'text-rose-600',
                },
              ]}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2">
              <IncomeVsExpensesChart data={dashboard?.charts?.incomeVsExpenses} />
            </div>
            <div className="xl:col-span-1">
              <SpendingByCategoryChart data={dashboard?.charts?.spendingByCategory} />
            </div>
          </div>

          {/* Bottom Actionable Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <RecentTransactionsCard transactions={dashboard?.recentTransactions} />
            <BudgetOverviewCard
              budgets={dashboard?.budgets}
              budgetHealth={dashboard?.budgetHealth}
            />
            <SubscriptionsBillsCard
              count={dashboard?.upcomingSubscriptions?.count}
              items={dashboard?.upcomingSubscriptions?.items}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Point of Sale (POS) */}
      {activeTab === 'pos' && (
        <PosDashboardView />
      )}
    </div>
  );
}
