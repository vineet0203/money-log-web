"use client";

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { 
  Utensils, 
  Car, 
  Plane, 
  ShoppingBag, 
  Home, 
  Coffee, 
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';

import { useDashboardAnalytics } from '@/hooks/queries/analytics';

const CATEGORY_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#F43F5E', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const getCategoryStyle = (name: string, index: number) => {
  const n = name.toLowerCase();
  let icon = Wallet;
  if (n.includes('food') || n.includes('dining') || n.includes('restaurant')) icon = Utensils;
  else if (n.includes('travel') || n.includes('airline') || n.includes('hotel')) icon = Plane;
  else if (n.includes('transport') || n.includes('car') || n.includes('uber') || n.includes('taxi')) icon = Car;
  else if (n.includes('shop') || n.includes('store') || n.includes('retail')) icon = ShoppingBag;
  else if (n.includes('house') || n.includes('home') || n.includes('utilit')) icon = Home;
  else if (n.includes('subscript') || n.includes('service')) icon = Smartphone;
  else if (n.includes('coffee') || n.includes('cafe')) icon = Coffee;

  return { icon, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] };
};

type DateFilter = 'this_month' | 'last_30_days' | 'last_7_days';

// ─── Components ────────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('last_7_days');

  // Calculate Dates dynamically based on filter
  const getDates = () => {
    const end = new Date();
    const start = new Date();
    if (dateFilter === 'last_7_days') {
      start.setDate(start.getDate() - 7);
    } else if (dateFilter === 'last_30_days') {
      start.setDate(start.getDate() - 30);
    } else if (dateFilter === 'this_month') {
      start.setDate(1);
    }
    return { 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    };
  };

  const { startDate, endDate } = getDates();
  const { data, isLoading } = useDashboardAnalytics(startDate, endDate);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (isLoading || !data) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  const { summary, dailyData, categoryData } = data;

  return (
    <div className="space-y-8">
      
      {/* ─── Header & Filters ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="font-semibold text-slate-700 w-full md:w-auto text-center md:text-left">Analytics Overview</div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 p-1 rounded-xl w-full md:w-auto gap-1">
          <button
            onClick={() => setDateFilter('last_7_days')}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              dateFilter === 'last_7_days' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('last_30_days')}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              dateFilter === 'last_30_days' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('this_month')}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              dateFilter === 'this_month' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 relative z-10">
            <Wallet size={28} className="text-indigo-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{formatCurrency(summary.balance)}</h3>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 relative z-10">
            <TrendingUp size={28} className="text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Income</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{formatCurrency(summary.income)}</h3>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 relative z-10">
            <TrendingDown size={28} className="text-rose-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Spend</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{formatCurrency(summary.spend)}</h3>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-50 rounded-full blur-2xl opacity-60"></div>
        </div>

      </div>

      {/* ─── Income vs Expense Ratio ─── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-emerald-600">Income ({formatCurrency(summary.income)})</span>
          <span className="text-rose-600">Expense ({formatCurrency(summary.spend)})</span>
        </div>
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000" 
            style={{ width: `${(summary.income / (summary.income + summary.spend || 1)) * 100}%` }} 
          />
          <div 
            className="h-full bg-rose-500 transition-all duration-1000" 
            style={{ width: `${(summary.spend / (summary.income + summary.spend || 1)) * 100}%` }} 
          />
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Cash Flow Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px] lg:col-span-2">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">Daily Income & Expense</h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  formatter={(value: any, name: any) => [formatCurrency(Number(value)), String(name)]}
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}
                />
                
                {/* Dynamically render Income and Expense Stacks based on categories */}
                {categoryData.map((cat, idx) => {
                  const incomeCat = cat.name === 'Salary' ? cat.name : `${cat.name} (Income)`;
                  return (
                    <React.Fragment key={cat.name}>
                      {cat.income > 0 && <Bar dataKey={incomeCat} name={`${cat.name} (Income)`} stackId="income" fill="#10B981" maxBarSize={40} />}
                      {cat.expense > 0 && <Bar dataKey={cat.name} name={cat.name} stackId="expense" fill={getCategoryStyle(cat.name, idx).color} maxBarSize={40} />}
                    </React.Fragment>
                  );
                })}

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category List Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col lg:col-span-2">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">Income vs Expense</h3>
          
          <div className="flex flex-col gap-5">
            {categoryData.length === 0 && (
              <p className="text-slate-500 text-center py-8">No transactions found for this period.</p>
            )}
            {categoryData.map((cat, idx) => {
              const { icon: Icon, color } = getCategoryStyle(cat.name, idx);
              const total = cat.income + cat.expense;
              const incomePct = total === 0 ? 0 : (cat.income / total) * 100;
              const expensePct = total === 0 ? 0 : (cat.expense / total) * 100;

              return (
                <div key={idx} className="flex flex-col gap-2 group">
                  
                  {/* Info Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${color}15`, color: color }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{cat.name}</span>
                        <div className="flex gap-2 text-xs font-semibold mt-0.5">
                          {cat.income > 0 && <span className="text-emerald-500">+{formatCurrency(cat.income)} In</span>}
                          {cat.expense > 0 && <span className="text-rose-500">-{formatCurrency(cat.expense)} Out</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-extrabold text-slate-800">{formatCurrency(total)}</span>
                      <span className="text-xs font-semibold text-slate-400">Total Volume</span>
                    </div>
                  </div>

                  {/* Dual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${incomePct}%` }}
                    />
                    <div 
                      className="h-full bg-rose-500 transition-all duration-1000 ease-out"
                      style={{ width: `${expensePct}%` }}
                    />
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
