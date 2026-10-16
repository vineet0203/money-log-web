import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface SeriesPoint {
  period: string;
  label: string;
  amount: number;
}

export interface SeriesReportResponse {
  metric: 'expense' | 'income' | 'net' | 'cumulative_net';
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

export interface BreakdownItem {
  key: string;
  label: string;
  color?: string;
  current: number;
  previous: number | null;
  delta: number | null;
  share: number;
}

export interface BreakdownReportResponse {
  dimension: 'category' | 'day_of_week' | 'recurrence';
  from: string;
  to: string;
  items: BreakdownItem[];
}

export const useGetSeriesReport = (params?: {
  metric?: 'expense' | 'income' | 'net' | 'cumulative_net';
  from?: string;
  to?: string;
  fromDate?: string;
  toDate?: string;
  granularity?: 'day' | 'week' | 'month';
  category_id?: number | string;
}) => {
  return useQuery({
    queryKey: ['reports', 'series', params],
    queryFn: async (): Promise<SeriesReportResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.metric) searchParams.append('metric', params.metric);
      const from = params?.from || params?.fromDate;
      const to = params?.to || params?.toDate;
      if (from) searchParams.append('from', from);
      if (to) searchParams.append('to', to);
      if (params?.granularity) searchParams.append('granularity', params.granularity);
      if (params?.category_id) searchParams.append('category_id', String(params.category_id));

      const { data } = await api.get(`/reports/series?${searchParams.toString()}`);
      return data;
    },
  });
};

export const useGetBreakdownReport = (params?: {
  dimension?: 'category' | 'day_of_week' | 'recurrence';
  from?: string;
  to?: string;
  fromDate?: string;
  toDate?: string;
  type?: string;
  category_id?: number | string;
  search?: string;
  has_receipt?: boolean | string;
}) => {
  return useQuery({
    queryKey: ['reports', 'breakdown', params],
    queryFn: async (): Promise<BreakdownReportResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.dimension) searchParams.append('dimension', params.dimension);
      const from = params?.from || params?.fromDate;
      const to = params?.to || params?.toDate;
      if (from) searchParams.append('from', from);
      if (to) searchParams.append('to', to);
      if (params?.type) searchParams.append('type', params.type);
      if (params?.category_id) searchParams.append('category_id', String(params.category_id));
      if (params?.search) searchParams.append('search', params.search);
      if (params?.has_receipt !== undefined) searchParams.append('has_receipt', String(params.has_receipt));

      const { data } = await api.get(`/reports/breakdown?${searchParams.toString()}`);
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
