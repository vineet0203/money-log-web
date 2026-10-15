"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  AlertTriangle, 
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { 
  PosPeriod, 
  usePosDashboardStats, 
  usePosDashboardHourly, 
  usePosDashboardTopProducts, 
  usePosDashboardRecentActivity 
} from '@/hooks/queries/posDashboard';

export function PosDashboardView() {
  const [timeFilter, setTimeFilter] = useState<PosPeriod>('today');

  // Modular API Queries for optimal loading and caching
  const { data: stats, isLoading: statsLoading, isFetching: statsFetching } = usePosDashboardStats(timeFilter);
  const { data: hourlyData, isLoading: hourlyLoading } = usePosDashboardHourly(timeFilter);
  const { data: topProducts = [], isLoading: topProductsLoading } = usePosDashboardTopProducts(timeFilter, 5);
  const { data: recentActivity, isLoading: activityLoading } = usePosDashboardRecentActivity(5);

  const formatCurr = (val: number | undefined) => 
    (val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'recently';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const salesTrend = stats?.sales?.trend ?? 0;
  const isPositiveTrend = salesTrend >= 0;

  return (
    <div className="space-y-6 max-w-full">
      {/* Sub-header Bar: Title & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800 truncate">Point of Sale Pulse</h2>
              {statsFetching && !statsLoading && (
                <RefreshCw className="w-3 h-3 text-slate-400 animate-spin shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">Live store sales, turnover metrics, and stock levels</p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="overflow-x-auto custom-scrollbar -mx-1 sm:mx-0 px-1 sm:px-0">
          <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-lg text-xs font-medium text-slate-600 shrink-0">
            {(['today', 'yesterday', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all whitespace-nowrap cursor-pointer ${
                  timeFilter === filter
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1: 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: POS Gross Sales */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">
                {timeFilter === 'today' ? "Today's POS Sales" : timeFilter === 'yesterday' ? "Yesterday's Sales" : `${timeFilter === 'week' ? 'This Week' : 'This Month'} Sales`}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 truncate">
                {statsLoading ? (
                  <span className="inline-block w-24 h-7 bg-slate-200 animate-pulse rounded"></span>
                ) : (
                  formatCurr(stats?.sales?.totalSales)
                )}
              </h2>
            </div>
            {!statsLoading && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isPositiveTrend ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              }`}>
                {isPositiveTrend ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                <span>{isPositiveTrend ? '+' : ''}{salesTrend}%</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col min-w-0 border-r border-slate-100 pr-1.5">
              <span className="text-[10px] text-slate-400 truncate">Orders</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : (stats?.sales?.totalOrders ?? 0)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 border-r border-slate-100 px-1.5">
              <span className="text-[10px] text-slate-400 truncate">Avg Ticket</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : formatCurr(stats?.sales?.avgTicket)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 pl-1.5">
              <span className="text-[10px] text-slate-400 truncate">Refunds</span>
              <span className="text-xs font-semibold text-slate-500 truncate">
                {statsLoading ? '...' : formatCurr(stats?.sales?.refunds)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Net Gross Margin & COGS */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">Gross Store Profit</p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-emerald-600 truncate">
                {statsLoading ? (
                  <span className="inline-block w-24 h-7 bg-slate-200 animate-pulse rounded"></span>
                ) : (
                  formatCurr(stats?.profit?.grossProfit)
                )}
              </h2>
            </div>
            {!statsLoading && (
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                {(stats?.profit?.grossMargin ?? 0)}% Margin
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col min-w-0 border-r border-slate-100 pr-1.5">
              <span className="text-[10px] text-slate-400 truncate">COGS</span>
              <span className="text-xs font-semibold text-rose-500 truncate">
                {statsLoading ? '...' : formatCurr(stats?.profit?.cogs)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 border-r border-slate-100 px-1.5">
              <span className="text-[10px] text-slate-400 truncate">Tax</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : formatCurr(stats?.profit?.tax)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 pl-1.5">
              <span className="text-[10px] text-slate-400 truncate">Discounts</span>
              <span className="text-xs font-semibold text-slate-500 truncate">
                {statsLoading ? '...' : `-${formatCurr(stats?.profit?.discounts)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Payment Split */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">Tender Breakdown</p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 truncate">
                {statsLoading ? (
                  <span className="inline-block w-24 h-7 bg-slate-200 animate-pulse rounded"></span>
                ) : (
                  formatCurr(stats?.tenders?.total)
                )}
              </h2>
            </div>
            {!statsLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                <CreditCard className="w-3 h-3 shrink-0" />
                <span>{(stats?.tenders?.cardPercent ?? 0)}% Card</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col min-w-0 border-r border-slate-100 pr-1.5">
              <span className="text-[10px] text-slate-400 truncate">Cash</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : formatCurr(stats?.tenders?.cash)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 border-r border-slate-100 px-1.5">
              <span className="text-[10px] text-slate-400 truncate">Card</span>
              <span className="text-xs font-semibold text-blue-600 truncate">
                {statsLoading ? '...' : formatCurr(stats?.tenders?.card)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 pl-1.5">
              <span className="text-[10px] text-slate-400 truncate">Digital</span>
              <span className="text-xs font-semibold text-purple-600 truncate">
                {statsLoading ? '...' : formatCurr(stats?.tenders?.digital)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Inventory & Stock Alerts */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">Inventory Alerts</p>
              <h2 className={`text-xl sm:text-2xl font-bold mt-1 truncate ${
                (stats?.inventory?.lowStockCount ?? 0) > 0 ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {statsLoading ? (
                  <span className="inline-block w-24 h-7 bg-slate-200 animate-pulse rounded"></span>
                ) : (
                  `${stats?.inventory?.lowStockCount ?? 0} Items Low`
                )}
              </h2>
            </div>
            {!statsLoading && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                (stats?.inventory?.outOfStockCount ?? 0) > 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
              }`}>
                {(stats?.inventory?.outOfStockCount ?? 0) > 0 ? (
                  <>
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{stats?.inventory?.outOfStockCount} Out</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>In Stock</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col min-w-0 border-r border-slate-100 pr-1.5">
              <span className="text-[10px] text-slate-400 truncate">SKUs</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : (stats?.inventory?.totalSkus ?? 0)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 border-r border-slate-100 px-1.5">
              <span className="text-[10px] text-slate-400 truncate">Asset Value</span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statsLoading ? '...' : formatCurr(stats?.inventory?.assetValue)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 pl-1.5">
              <span className="text-[10px] text-slate-400 truncate">Reorders</span>
              <span className="text-xs font-semibold text-amber-600 truncate">
                {statsLoading ? '...' : (stats?.inventory?.reordersRequired ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Hourly Rush & Top 5 Sellers) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Hourly Sales & Peak Foot Traffic Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col min-h-[350px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                {timeFilter === 'week' ? 'Past 7 Days Sales Volume' : timeFilter === 'month' ? 'Monthly Sales Activity' : "Today's Hourly Sales & Customer Rush"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{hourlyData?.peakHours || 'Peak traffic activity'}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0 self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0"></span>
              <span>Revenue ($)</span>
            </div>
          </div>

          <div className="flex-1 w-full mt-2 min-h-[250px] sm:min-h-[280px]">
            {hourlyLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Loading sales trends...
              </div>
            ) : !hourlyData?.chartData || hourlyData.chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No transaction data available for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    dy={6}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Sales']}
                    labelFormatter={(label) => `Time/Date: ${label}`}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 5 Products by Revenue */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Top Selling Items</h3>
                <p className="text-xs text-slate-400 truncate">By revenue generated</p>
              </div>
              <Link 
                href="/pos/reports"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition shrink-0"
              >
                Full report
              </Link>
            </div>

            {topProductsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading top sellers...</div>
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No product sales recorded for this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topProducts.map((item, idx) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.category} • {item.sold} sold</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-800">{formatCurr(item.revenue)}</p>
                      <span className="text-[10px] text-slate-400">{item.stock} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link 
              href="/pos/products" 
              className="text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center justify-between transition"
            >
              <span>Manage Products &amp; Prices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Live Sales Feed & Low Stock Watchlist */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Checkout Orders */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Recent POS Receipts</h3>
                <p className="text-xs text-slate-400 truncate">Real-time checkout activity</p>
              </div>
              <Link 
                href="/pos/sales" 
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition shrink-0"
              >
                View all sales
              </Link>
            </div>

            {activityLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading recent receipts...</div>
            ) : !recentActivity?.recentSales || recentActivity.recentSales.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No checkout orders completed yet.
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {recentActivity.recentSales.map((sale) => (
                  <div 
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate">{sale.id}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600 font-medium shrink-0">
                            {sale.payment}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {sale.customer} • {sale.items} items • {formatTimeAgo(sale.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">{formatCurr(sale.total)}</span>
                      <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sale.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {recentActivity?.todayOrdersCount || 0} transactions completed today
            </span>
            <Link
              href="/pos/sales"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Sales &amp; Returns</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Low Stock & Reorder Alert Watchlist */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Low Stock &amp; Reorder Watchlist</h3>
                <p className="text-xs text-slate-400 truncate">Items nearing or below minimum safety levels</p>
              </div>
              <Link 
                href="/pos/suppliers" 
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition shrink-0"
              >
                Create Purchase
              </Link>
            </div>

            {activityLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading stock alerts...</div>
            ) : !recentActivity?.lowStockWatchlist || recentActivity.lowStockWatchlist.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                <PackageCheck className="w-8 h-8 text-emerald-500/80 mb-1" />
                <p className="font-medium text-slate-600">All catalog items healthy</p>
                <p className="text-[11px] text-slate-400">No inventory currently below minimum safety levels</p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {recentActivity.lowStockWatchlist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.status === 'out_of_stock'
                          ? 'bg-rose-100 text-rose-600'
                          : item.status === 'critical'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {item.id} • Min safety: {item.threshold} {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold ${
                        item.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {item.stock} {item.unit} left
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">
                        {item.status === 'out_of_stock' ? 'Out of stock' : 'Needs reorder'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Auto-alerts enabled for inventory below safety thresholds</span>
            <Link
              href="/pos/suppliers"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Go to Purchases</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
