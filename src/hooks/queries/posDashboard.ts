import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export type PosPeriod = 'today' | 'yesterday' | 'week' | 'month';

export interface PosDashboardStats {
  period: PosPeriod;
  sales: {
    totalSales: number;
    totalOrders: number;
    avgTicket: number;
    refunds: number;
    refundCount: number;
    trend: number;
  };
  profit: {
    grossProfit: number;
    grossMargin: number;
    cogs: number;
    tax: number;
    discounts: number;
  };
  tenders: {
    total: number;
    card: number;
    cardPercent: number;
    cash: number;
    cashPercent: number;
    digital: number;
    digitalPercent: number;
  };
  inventory: {
    totalSkus: number;
    outOfStockCount: number;
    lowStockCount: number;
    reordersRequired: number;
    assetValue: number;
  };
}

export interface PosHourlyData {
  chartData: {
    hour: string;
    sales: number;
    orders: number;
  }[];
  peakHours: string;
}

export interface PosTopProduct {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  stock: number;
}

export interface PosRecentReceipt {
  id: string;
  customer: string;
  total: number;
  items: number;
  payment: string;
  status: string;
  created_at: string;
}

export interface PosLowStockItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  unit: string;
  status: 'out_of_stock' | 'critical' | 'low';
}

export interface PosRecentActivity {
  recentSales: PosRecentReceipt[];
  lowStockWatchlist: PosLowStockItem[];
  todayOrdersCount: number;
}

export const POS_DASHBOARD_KEY = ['pos', 'dashboard'];

/**
 * 1. KPI Stats & Overview Query
 */
export const usePosDashboardStats = (period: PosPeriod = 'today') => {
  return useQuery({
    queryKey: [...POS_DASHBOARD_KEY, 'stats', period],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosDashboardStats }>(
        '/pos/dashboard/stats',
        { params: { period } }
      );
      return data.data;
    },
    staleTime: 30_000,
  });
};

/**
 * 2. Hourly Sales & Rush Analytics Query
 */
export const usePosDashboardHourly = (period: PosPeriod = 'today') => {
  return useQuery({
    queryKey: [...POS_DASHBOARD_KEY, 'hourly-sales', period],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosHourlyData }>(
        '/pos/dashboard/hourly-sales',
        { params: { period } }
      );
      return data.data;
    },
    staleTime: 30_000,
  });
};

/**
 * 3. Top Products Query
 */
export const usePosDashboardTopProducts = (period: PosPeriod = 'today', limit: number = 5) => {
  return useQuery({
    queryKey: [...POS_DASHBOARD_KEY, 'top-products', period, limit],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosTopProduct[] }>(
        '/pos/dashboard/top-products',
        { params: { period, limit } }
      );
      return data.data;
    },
    staleTime: 30_000,
  });
};

/**
 * 4. Recent Activity Query (Orders & Low Stock Watchlist)
 */
export const usePosDashboardRecentActivity = (limit: number = 5) => {
  return useQuery({
    queryKey: [...POS_DASHBOARD_KEY, 'recent-activity', limit],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosRecentActivity }>(
        '/pos/dashboard/recent-activity',
        { params: { limit } }
      );
      return data.data;
    },
    staleTime: 20_000,
  });
};
