export type DateRangePreset = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'quarter';

export type ReportTab = 
  | 'sales_summary'
  | 'product_sales'
  | 'category_sales'
  | 'profit_margins'
  | 'inventory_valuation'
  | 'payment_summary'
  | 'returns_refunds'
  | 'purchase_report';

export interface SalesSummaryData {
  totalGrossSales: number;
  totalDiscounts: number;
  totalNetSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalTax: number;
  totalItemsSold: number;
  trend: Array<{ date: string; gross: number; net: number; orders: number }>;
  hourlyBreakdown: Array<{ hour: string; sales: number; orders: number }>;
}

export interface ProductSalesItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitsSold: number;
  grossSales: number;
  discount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
}

export interface CategorySalesItem {
  category: string;
  itemsSold: number;
  revenue: number;
  revenueShare: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
  color: string;
}

export interface ProfitMarginsSummary {
  grossRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netOperatingProfit: number;
  netMarginPercent: number;
  tierBreakdown: Array<{ tier: string; range: string; count: number; revenue: number; profit: number }>;
  topProfitProducts: Array<{ name: string; category: string; profit: number; margin: number }>;
  lowMarginAlerts: Array<{ name: string; margin: number; currentPrice: number; costPrice: number }>;
}

export interface InventoryValuationSummary {
  totalItems: number;
  totalStockUnits: number;
  valuationAtCost: number;
  valuationAtRetail: number;
  potentialProfit: number;
  healthyStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryValuations: Array<{ category: string; units: number; costValue: number; retailValue: number; margin: number }>;
  brandValuations: Array<{ brand: string; units: number; costValue: number; retailValue: number }>;
}

export interface PaymentSummaryItem {
  method: string;
  transactions: number;
  totalAmount: number;
  percentage: number;
  processingFees: number;
  netCollected: number;
  color: string;
}

export interface ReturnsRefundsSummary {
  totalReturns: number;
  totalRefundAmount: number;
  returnRatePercent: number;
  reasons: Array<{ reason: string; count: number; amount: number; percentage: number }>;
  refundMethods: Array<{ method: string; count: number; amount: number }>;
  returnedProducts: Array<{ productName: string; sku: string; unitsReturned: number; refundAmount: number; primaryReason: string }>;
}

export interface CashierRegisterShift {
  id: string;
  registerId: string;
  cashierName: string;
  shift: string;
  date: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  ordersCount: number;
  totalSales: number;
  status: 'Balanced' | 'Over' | 'Short';
}

export interface PurchaseReportSummary {
  totalPurchases: number;
  totalSpend: number;
  completedPOs: number;
  pendingPOs: number;
  supplierSpend: Array<{ supplier: string; poCount: number; totalSpend: number; fulfillmentRate: number; pendingAmount: number }>;
  recentPurchases: Array<{ poNumber: string; supplier: string; date: string; itemsCount: number; totalCost: number; status: 'Received' | 'Pending' | 'Partial'; paymentStatus: 'Paid' | 'Unpaid' | 'Partial' }>;
}
