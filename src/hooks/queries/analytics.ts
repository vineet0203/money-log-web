import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface DashboardSummary {
  balance: number;
  income: number;
  spend: number;
}

export interface DashboardAnalyticsResponse {
  summary: DashboardSummary;
  dailyData: any[];
  categoryData: {
    name: string;
    income: number;
    expense: number;
  }[];
}

export const useDashboardAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['dashboardAnalytics', startDate, endDate],
    queryFn: async (): Promise<DashboardAnalyticsResponse> => {
      const { data } = await api.get('/reports/dashboard', {
        params: { startDate, endDate }
      });
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};
