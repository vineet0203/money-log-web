import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  SalesSummaryData,
  ProductSalesItem,
  CategorySalesItem,
  ProfitMarginsSummary,
  InventoryValuationSummary,
  PaymentSummaryItem,
  ReturnsRefundsSummary,
  PurchaseReportSummary,
  DateRangePreset
} from '@/components/pos/reports/types';

export const POS_REPORTS_KEY = ['pos', 'reports'];

/**
 * 1. Sales Summary Report
 */
export const useSalesSummaryReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'sales-summary', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: SalesSummaryData }>(
        '/pos/reports/sales-summary',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};

/**
 * 2. Product-wise Sales Report
 */
export const useProductSalesReportQuery = (dateRange: DateRangePreset = '30days', category: string = 'All') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'product-sales', dateRange, category],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ProductSalesItem[] }>(
        '/pos/reports/product-sales',
        { params: { dateRange, category } }
      );
      return data.data;
    },
  });
};

/**
 * 3. Category-wise Sales Report
 */
export const useCategorySalesReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'category-sales', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: CategorySalesItem[] }>(
        '/pos/reports/category-sales',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};

/**
 * 4. Profit & Margins Report
 */
export const useProfitMarginsReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'profit-margins', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ProfitMarginsSummary }>(
        '/pos/reports/profit-margins',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};

/**
 * 5. Inventory Valuation Report (Current snapshot)
 */
export const useInventoryValuationReportQuery = () => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'inventory-valuation'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: InventoryValuationSummary }>(
        '/pos/reports/inventory-valuation'
      );
      return data.data;
    },
  });
};

/**
 * 6. Payment Summary Report
 */
export const usePaymentSummaryReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'payment-summary', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PaymentSummaryItem[] }>(
        '/pos/reports/payment-summary',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};

/**
 * 7. Returns & Refunds Report
 */
export const useReturnsRefundsReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'returns-refunds', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ReturnsRefundsSummary }>(
        '/pos/reports/returns-refunds',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};

/**
 * 8. Purchase Report
 */
export const usePurchaseReportQuery = (dateRange: DateRangePreset = '30days') => {
  return useQuery({
    queryKey: [...POS_REPORTS_KEY, 'purchases', dateRange],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PurchaseReportSummary }>(
        '/pos/reports/purchases',
        { params: { dateRange } }
      );
      return data.data;
    },
  });
};
