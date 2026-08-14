"use client";

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetAssetReportDetails } from '@/hooks/queries/accounts';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { 
  ArrowLeft, Landmark, ShieldCheck, UserCircle, MapPin, Mail, Phone, Loader2, AlertCircle 
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';

export default function AssetReportDetailsPage() {
  const { report_id } = useParams() as { report_id: string };
  const router = useRouter();
  const { setHeaderData } = useAppData();
  
  const { data, isLoading, error } = useGetAssetReportDetails(report_id);
  const report = data?.report;

  useEffect(() => {
    setHeaderData(
      'Asset Report Analytics', 
      'Detailed financial snapshot and historical trends from your verified asset report.',
      true // Enable global back button
    );
  }, [setHeaderData]);

  // --- Analytics Processing ---
  const analytics = useMemo(() => {
    if (!report) return null;

    let totalAssets = 0;
    let totalLiabilities = 0;
    let cash = 0; // highly liquid
    let investments = 0; // illiquid
    let creditCards = 0;
    let creditLimit = 0;
    let loans = 0;
    const accountList: any[] = [];
    let ownersList: any[] = [];
    const historicalMap: Record<string, number> = {}; // date -> total balance
    const institutionBalances: Record<string, number> = {}; // institution name -> balance

    report.items.forEach((item: any) => {
      item.accounts.forEach((acc: any) => {
        const bal = acc.balances.current || 0;
        
        // Categorize Assets vs Liabilities based on account type
        if (['credit', 'loan'].includes(acc.type)) {
          totalLiabilities += bal;
          if (acc.type === 'credit') {
            creditCards += bal;
            if (acc.balances.limit) creditLimit += acc.balances.limit;
          }
          else loans += bal;
        } else {
          totalAssets += bal;
          if (acc.type === 'investment' || acc.type === 'brokerage') investments += bal;
          else cash += bal;
          
          if (!institutionBalances[item.institution_name]) institutionBalances[item.institution_name] = 0;
          institutionBalances[item.institution_name] += bal;
        }

        accountList.push({
          id: acc.account_id,
          institution: item.institution_name,
          name: acc.name,
          mask: acc.mask,
          type: acc.type,
          subtype: acc.subtype,
          balance: bal,
        });

        // Collect historical balances for the chart
        if (acc.historical_balances && !['credit', 'loan'].includes(acc.type)) {
          acc.historical_balances.forEach((hb: any) => {
            if (!historicalMap[hb.date]) historicalMap[hb.date] = 0;
            historicalMap[hb.date] += hb.current;
          });
        }

        // Collect owners (KYC)
        if (acc.owners && acc.owners.length > 0) {
          acc.owners.forEach((o: any) => ownersList.push(o));
        }
      });
    });

    // Format historical chart data
    const chartData = Object.keys(historicalMap)
      .sort() // sort dates chronologically
      .map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: date,
        balance: historicalMap[date],
      }));

    // Deduplicate owners by primary name (simple deduplication)
    const uniqueOwners = Array.from(new Map(ownersList.map(o => [o.names[0], o])).values());

    const barChartData = [
      { name: 'Cash & banking', Assets: cash, Debt: 0 },
      { name: 'Investments', Assets: investments, Debt: 0 },
      { name: 'Credit cards', Assets: 0, Debt: -creditCards },
      { name: 'Loans', Assets: 0, Debt: -loans },
    ];

    const liquidData = [
      { name: 'Highly Liquid (Cash)', value: cash },
      { name: 'Investments', value: investments },
    ].filter(d => d.value > 0);

    const instData = Object.keys(institutionBalances).map(name => ({
      name, value: institutionBalances[name]
    })).sort((a, b) => b.value - a.value);

    // Advanced Stats Calculations
    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const utilization = creditLimit > 0 ? (creditCards / creditLimit) * 100 : 0;

    // Growth Calculation
    let netGrowth = 0;
    let netGrowthPercent = 0;
    if (chartData.length > 1) {
      const oldestBal = chartData[0].balance;
      const newestBal = chartData[chartData.length - 1].balance;
      netGrowth = newestBal - oldestBal;
      if (oldestBal !== 0) {
        netGrowthPercent = (netGrowth / oldestBal) * 100;
      }
    }

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      accountCount: accountList.length,
      institutionCount: report.items.length,
      accountList,
      chartData,
      barChartData,
      liquidData,
      instData,
      uniqueOwners,
      stats: {
        debtRatio,
        utilization,
        netGrowth,
        netGrowthPercent
      }
    };
  }, [report]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Analyzing asset report data...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl flex items-center gap-4 text-red-700">
        <AlertCircle size={24} />
        <div>
          <h3 className="font-bold">Failed to load report</h3>
          <p className="text-sm">The report might still be generating or does not exist.</p>
        </div>
      </div>
    );
  }

  const cols: Column<any>[] = [
    {
      key: 'institution',
      header: 'Institution',
      render: (r) => <span className="font-semibold text-slate-700">{r.institution}</span>
    },
    {
      key: 'name',
      header: 'Account Name',
      render: (r) => (
        <div>
          <span className="font-medium text-slate-800">{r.name}</span>
          {r.mask && <span className="text-slate-400 ml-2">...{r.mask}</span>}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => <span className="capitalize text-slate-500">{r.subtype || r.type}</span>
    },
    {
      key: 'balance',
      header: 'Current Balance',
      render: (r) => (
        <span className="font-bold text-slate-800">
          ${r.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full opacity-50 transition-transform duration-500" />
          <span className="text-slate-500 font-medium z-10">Total Verified Assets</span>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-800 mt-2 z-10 break-words">
            ${analytics?.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full opacity-50 transition-transform duration-500" />
          <span className="text-slate-500 font-medium z-10">Total Liabilities</span>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-800 mt-2 z-10 break-words">
            ${analytics?.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 transition-transform duration-500" />
          <span className="text-slate-500 font-medium z-10">Net Worth</span>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-800 mt-2 z-10 break-words">
            ${analytics?.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full opacity-50 transition-transform duration-500" />
          <span className="text-slate-500 font-medium z-10">Verified Accounts</span>
          <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-800 mt-2 z-10 break-words">
            {analytics?.accountCount} <span className="text-sm font-medium text-slate-400">across {analytics?.institutionCount} inst.</span>
          </h3>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1">Debt-to-Asset Ratio</p>
            <h4 className="text-xl lg:text-2xl font-bold text-slate-800 break-words">{analytics?.stats.debtRatio.toFixed(1)}%</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
            <span className="text-lg font-bold text-slate-400">%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1">Credit Utilization</p>
            <h4 className="text-xl lg:text-2xl font-bold text-slate-800 break-words">{analytics?.stats.utilization.toFixed(1)}%</h4>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 flex-shrink-0">
            <Landmark size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-1">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1">90-Day Net Growth</p>
            <h4 className={`text-xl lg:text-2xl font-bold break-words ${analytics?.stats.netGrowth && analytics.stats.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics?.stats.netGrowth && analytics.stats.netGrowth >= 0 ? '+' : ''}
              ${Math.abs(analytics?.stats.netGrowth || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              <span className="text-sm ml-2 opacity-70 whitespace-nowrap">
                ({analytics?.stats.netGrowthPercent.toFixed(1)}%)
              </span>
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Historical Trend Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Historical Asset Trend</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#159A1D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#159A1D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(val) => `$${val/1000}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Total Assets']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#159A1D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset vs Debt Bar Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Assets vs Debt Breakdown</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(val) => val === 0 ? '$0' : val < 0 ? `-$${Math.abs(val)/1000}k` : `$${val/1000}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${Math.abs(value).toLocaleString(undefined, {minimumFractionDigits: 2})}`, value < 0 ? 'Debt' : 'Assets']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <ReferenceLine y={0} stroke="#cbd5e1" />
                  <Bar dataKey="Assets" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Debt" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* KYC / Verified Identity */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Verified Identity</h3>
                <p className="text-xs text-slate-500 font-medium">Bank-extracted KYC data</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {analytics?.uniqueOwners.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-10">No identity data available in this report.</p>
              ) : (
                analytics?.uniqueOwners.map((owner, idx) => {
                  const name = owner.names[0] || 'Unknown';
                  const email = owner.emails?.[0]?.data;
                  const phone = owner.phone_numbers?.[0]?.data;
                  const addressObj = owner.addresses?.[0]?.data;
                  const addressStr = addressObj ? `${addressObj.street || ''}, ${addressObj.city || ''} ${addressObj.region || ''}` : null;

                  return (
                    <div key={idx} className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <UserCircle className="text-slate-400 mt-0.5" size={18} />
                        <p className="text-sm font-bold text-slate-800">{name}</p>
                      </div>
                      {email && (
                        <div className="flex items-start gap-3">
                          <Mail className="text-slate-400 mt-0.5" size={16} />
                          <p className="text-sm font-semibold text-slate-600">{email}</p>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="text-slate-400 mt-0.5" size={16} />
                          <p className="text-sm font-semibold text-slate-600">{phone}</p>
                        </div>
                      )}
                      {addressStr && (
                        <div className="flex items-start gap-3">
                          <MapPin className="text-slate-400 mt-0.5" size={16} />
                          <p className="text-sm text-slate-600">{addressStr}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Liquid vs Illiquid Pie Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Liquidity Profile</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.liquidData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics?.liquidData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Included Accounts</h3>
        </div>
        <DataTable data={analytics?.accountList || []} columns={cols} />
      </div>

    </div>
  );
}
