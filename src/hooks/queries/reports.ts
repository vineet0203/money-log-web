import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface SeriesPoint {
  period: string;
  label: string;
  amount: number;
}

export interface SeriesReportResponse {
  metric: 'expense' | 'income' | 'net';
  from: string;
  to: string;
  granularity: 'day' | 'week' | 'month';
  total: number;
  previous_total: number;
  change_pct: number | null;
  points: SeriesPoint[];
}

export interface CategoryBreakdownItem {
  category_id: number;
  category_name: string;
  category_color: string;
  icon_name: string;
  budget_limit: number | null;
  total_amount: number;
}

export interface MonthlyReportResponse {
  month: string;
  totalIncome: number;
  totalExpense: number;
  categoryBreakdown: CategoryBreakdownItem[];
  incomeCategoryBreakdown: CategoryBreakdownItem[];
}

export const useGetSeriesReport = (params?: {
  metric?: 'expense' | 'income' | 'net';
  from?: string;
  to?: string;
  granularity?: 'day' | 'week' | 'month';
  category_id?: number | string;
}) => {
  return useQuery({
    queryKey: ['reports', 'series', params],
    queryFn: async (): Promise<SeriesReportResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.metric) searchParams.append('metric', params.metric);
      if (params?.from) searchParams.append('from', params.from);
      if (params?.to) searchParams.append('to', params.to);
      if (params?.granularity) searchParams.append('granularity', params.granularity);
      if (params?.category_id) searchParams.append('category_id', String(params.category_id));

      const { data } = await api.get(`/reports/series?${searchParams.toString()}`);
      return data;
    },
  });
};

export const useGetMonthlyReport = (params?: { year?: number | string; month?: number | string }) => {
  return useQuery({
    queryKey: ['reports', 'monthly', params],
    queryFn: async (): Promise<MonthlyReportResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.year) searchParams.append('year', String(params.year));
      if (params?.month) searchParams.append('month', String(params.month));

      const { data } = await api.get(`/reports/monthly?${searchParams.toString()}`);
      return data;
    },
  });
};
