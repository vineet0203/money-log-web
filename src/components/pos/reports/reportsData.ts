import { 
  SalesSummaryData, 
  ProductSalesItem, 
  CategorySalesItem, 
  ProfitMarginsSummary, 
  InventoryValuationSummary, 
  PaymentSummaryItem, 
  ReturnsRefundsSummary, 
  CashierRegisterShift, 
  PurchaseReportSummary 
} from './types';

export const MOCK_SALES_SUMMARY: SalesSummaryData = {
  totalGrossSales: 48920.50,
  totalDiscounts: 3410.00,
  totalNetSales: 45510.50,
  totalOrders: 1420,
  averageOrderValue: 32.05,
  totalTax: 3640.84,
  totalItemsSold: 3840,
  trend: [
    { date: 'Oct 01', gross: 6240, net: 5820, orders: 182 },
    { date: 'Oct 02', gross: 5890, net: 5490, orders: 171 },
    { date: 'Oct 03', gross: 7120, net: 6640, orders: 204 },
    { date: 'Oct 04', gross: 8450, net: 7890, orders: 245 },
    { date: 'Oct 05', gross: 9110, net: 8480, orders: 268 },
    { date: 'Oct 06', gross: 6380, net: 5930, orders: 188 },
    { date: 'Oct 07', gross: 5730, net: 5260, orders: 162 },
  ],
  hourlyBreakdown: [
    { hour: '07:00 AM', sales: 1840, orders: 92 },
    { hour: '08:00 AM', sales: 4210, orders: 184 },
    { hour: '09:00 AM', sales: 5890, orders: 230 },
    { hour: '10:00 AM', sales: 4320, orders: 170 },
    { hour: '11:00 AM', sales: 3650, orders: 142 },
    { hour: '12:00 PM', sales: 5120, orders: 195 },
    { hour: '01:00 PM', sales: 4890, orders: 185 },
    { hour: '02:00 PM', sales: 3410, orders: 130 },
    { hour: '03:00 PM', sales: 3980, orders: 154 },
    { hour: '04:00 PM', sales: 4560, orders: 178 },
    { hour: '05:00 PM', sales: 3620, orders: 138 },
    { hour: '06:00 PM', sales: 2150, orders: 84 },
  ],
};

export const MOCK_PRODUCT_SALES: ProductSalesItem[] = [
  {
    id: 'p-1',
    productName: 'Premium Espresso Blend (500g)',
    sku: 'COF-001-500G',
    category: 'Coffee',
    unitsSold: 342,
    grossSales: 6327.00,
    discount: 513.00,
    netRevenue: 5814.00,
    cogs: 2052.00,
    grossProfit: 3762.00,
    marginPercent: 64.7,
  },
  {
    id: 'p-2',
    productName: 'Ethiopia Yirgacheffe Beans (250g)',
    sku: 'COF-002',
    category: 'Coffee',
    unitsSold: 285,
    grossSales: 6270.00,
    discount: 456.00,
    netRevenue: 5814.00,
    cogs: 2280.00,
    grossProfit: 3534.00,
    marginPercent: 60.8,
  },
  {
    id: 'p-3',
    productName: 'Oat Milk Barista Edition (1L)',
    sku: 'DRY-201',
    category: 'Dairy & Milks',
    unitsSold: 890,
    grossSales: 4895.00,
    discount: 245.00,
    netRevenue: 4650.00,
    cogs: 3115.00,
    grossProfit: 1535.00,
    marginPercent: 33.0,
  },
  {
    id: 'p-4',
    productName: 'Ceramic Pour-Over Dripper (Red)',
    sku: 'EQP-102-RED',
    category: 'Equipment',
    unitsSold: 94,
    grossSales: 2256.00,
    discount: 188.00,
    netRevenue: 2068.00,
    cogs: 1410.00,
    grossProfit: 658.00,
    marginPercent: 31.8,
  },
  {
    id: 'p-5',
    productName: 'Artisan Vanilla Syrup (750ml)',
    sku: 'SYR-301-VAN',
    category: 'Syrups & Flavors',
    unitsSold: 186,
    grossSales: 2325.00,
    discount: 139.50,
    netRevenue: 2185.50,
    cogs: 1302.00,
    grossProfit: 883.50,
    marginPercent: 40.4,
  },
  {
    id: 'p-6',
    productName: 'Digital Precision Scale 0.1g',
    sku: 'EQP-105',
    category: 'Equipment',
    unitsSold: 62,
    grossSales: 2170.00,
    discount: 124.00,
    netRevenue: 2046.00,
    cogs: 1240.00,
    grossProfit: 806.00,
    marginPercent: 39.4,
  },
  {
    id: 'p-7',
    productName: 'Canvas Barista Work Apron (Black)',
    sku: 'ACC-301-M-BLK',
    category: 'Accessories',
    unitsSold: 58,
    grossSales: 1682.00,
    discount: 116.00,
    netRevenue: 1566.00,
    cogs: 928.00,
    grossProfit: 638.00,
    marginPercent: 40.7,
  },
  {
    id: 'p-8',
    productName: 'Artisan Salted Caramel Syrup (750ml)',
    sku: 'SYR-301-CAR',
    category: 'Syrups & Flavors',
    unitsSold: 144,
    grossSales: 1800.00,
    discount: 90.00,
    netRevenue: 1710.00,
    cogs: 1008.00,
    grossProfit: 702.00,
    marginPercent: 41.1,
  },
  {
    id: 'p-9',
    productName: 'Reusable Stainless Cone Filter',
    sku: 'EQP-109',
    category: 'Equipment',
    unitsSold: 112,
    grossSales: 1344.00,
    discount: 112.00,
    netRevenue: 1232.00,
    cogs: 728.00,
    grossProfit: 504.00,
    marginPercent: 40.9,
  },
];

export const MOCK_CATEGORY_SALES: CategorySalesItem[] = [
  {
    category: 'Coffee',
    itemsSold: 1250,
    revenue: 19840.00,
    revenueShare: 43.6,
    cogs: 7420.00,
    grossProfit: 12420.00,
    marginPercent: 62.6,
    color: '#159A1D',
  },
  {
    category: 'Dairy & Milks',
    itemsSold: 1120,
    revenue: 9680.00,
    revenueShare: 21.3,
    cogs: 6240.00,
    grossProfit: 3440.00,
    marginPercent: 35.5,
    color: '#3B82F6',
  },
  {
    category: 'Equipment',
    itemsSold: 380,
    revenue: 7850.50,
    revenueShare: 17.2,
    cogs: 4890.00,
    grossProfit: 2960.50,
    marginPercent: 37.7,
    color: '#8B5CF6',
  },
  {
    category: 'Syrups & Flavors',
    itemsSold: 640,
    revenue: 5240.00,
    revenueShare: 11.5,
    cogs: 2980.00,
    grossProfit: 2260.00,
    marginPercent: 43.1,
    color: '#F59E0B',
  },
  {
    category: 'Accessories',
    itemsSold: 450,
    revenue: 2900.00,
    revenueShare: 6.4,
    cogs: 1650.00,
    grossProfit: 1250.00,
    marginPercent: 43.1,
    color: '#EC4899',
  },
];

export const MOCK_PROFIT_MARGINS: ProfitMarginsSummary = {
  grossRevenue: 48920.50,
  totalCogs: 23180.00,
  grossProfit: 25740.50,
  grossMarginPercent: 52.6,
  operatingExpenses: 9400.00,
  netOperatingProfit: 16340.50,
  netMarginPercent: 33.4,
  tierBreakdown: [
    { tier: 'High Margin', range: 'Above 55%', count: 18, revenue: 24200, profit: 15400 },
    { tier: 'Mid Margin', range: '35% - 55%', count: 24, revenue: 16400, profit: 7800 },
    { tier: 'Low Margin', range: 'Below 35%', count: 8, revenue: 8320, profit: 2540 },
  ],
  topProfitProducts: [
    { name: 'Premium Espresso Blend (500g)', category: 'Coffee', profit: 3762.00, margin: 64.7 },
    { name: 'Ethiopia Yirgacheffe Beans (250g)', category: 'Coffee', profit: 3534.00, margin: 60.8 },
    { name: 'Oat Milk Barista Edition (1L)', category: 'Dairy & Milks', profit: 1535.00, margin: 33.0 },
    { name: 'Artisan Vanilla Syrup (750ml)', category: 'Syrups & Flavors', profit: 883.50, margin: 40.4 },
    { name: 'Digital Precision Scale', category: 'Equipment', profit: 806.00, margin: 39.4 },
  ],
  lowMarginAlerts: [
    { name: 'Ceramic Pour-Over Dripper', margin: 31.8, currentPrice: 24.00, costPrice: 15.00 },
    { name: 'Oat Milk Barista Edition', margin: 33.0, currentPrice: 5.50, costPrice: 3.50 },
    { name: 'Double Wall Glass 250ml', margin: 28.5, currentPrice: 14.00, costPrice: 10.00 },
  ],
};

export const MOCK_INVENTORY_VALUATION: InventoryValuationSummary = {
  totalItems: 38,
  totalStockUnits: 2450,
  valuationAtCost: 28450.00,
  valuationAtRetail: 54890.00,
  potentialProfit: 26440.00,
  healthyStockCount: 29,
  lowStockCount: 6,
  outOfStockCount: 3,
  categoryValuations: [
    { category: 'Coffee', units: 820, costValue: 9840.00, retailValue: 20500.00, margin: 52.0 },
    { category: 'Equipment', units: 240, costValue: 7200.00, retailValue: 12480.00, margin: 42.3 },
    { category: 'Dairy & Milks', units: 640, costValue: 3840.00, retailValue: 6080.00, margin: 36.8 },
    { category: 'Syrups & Flavors', units: 480, costValue: 4320.00, retailValue: 8640.00, margin: 50.0 },
    { category: 'Accessories', units: 270, costValue: 3250.00, retailValue: 7190.00, margin: 54.8 },
  ],
  brandValuations: [
    { brand: 'Origins Roastery', units: 820, costValue: 9840.00, retailValue: 20500.00 },
    { brand: 'AeroGrind', units: 180, costValue: 4600.00, retailValue: 8100.00 },
    { brand: 'Hario', units: 160, costValue: 3600.00, retailValue: 6400.00 },
    { brand: 'Monin', units: 480, costValue: 4320.00, retailValue: 8640.00 },
    { brand: 'Oatly', units: 640, costValue: 3840.00, retailValue: 6080.00 },
    { brand: 'BaristaPro', units: 170, costValue: 2250.00, retailValue: 5170.00 },
  ],
};

export const MOCK_PAYMENT_SUMMARY: PaymentSummaryItem[] = [
  {
    method: 'Credit Card (Visa / Mastercard)',
    transactions: 684,
    totalAmount: 22755.25,
    percentage: 50.0,
    processingFees: 455.10,
    netCollected: 22300.15,
    color: '#3B82F6',
  },
  {
    method: 'Cash Payment',
    transactions: 412,
    totalAmount: 12287.75,
    percentage: 27.0,
    processingFees: 0.00,
    netCollected: 12287.75,
    color: '#159A1D',
  },
  {
    method: 'UPI / Dynamic QR',
    transactions: 215,
    totalAmount: 6826.50,
    percentage: 15.0,
    processingFees: 0.00,
    netCollected: 6826.50,
    color: '#8B5CF6',
  },
  {
    method: 'Apple Pay / Google Pay',
    transactions: 85,
    totalAmount: 2730.60,
    percentage: 6.0,
    processingFees: 54.60,
    netCollected: 2676.00,
    color: '#F59E0B',
  },
  {
    method: 'Store Credit / Gift Card',
    transactions: 24,
    totalAmount: 910.40,
    percentage: 2.0,
    processingFees: 0.00,
    netCollected: 910.40,
    color: '#EC4899',
  },
];

export const MOCK_RETURNS_REFUNDS: ReturnsRefundsSummary = {
  totalReturns: 28,
  totalRefundAmount: 945.50,
  returnRatePercent: 1.97,
  reasons: [
    { reason: 'Customer Changed Mind', count: 11, amount: 380.00, percentage: 40.2 },
    { reason: 'Wrong Size / Variant Selected', count: 8, amount: 265.50, percentage: 28.1 },
    { reason: 'Defective / Damaged Packaging', count: 6, amount: 210.00, percentage: 22.2 },
    { reason: 'Tasting / Flavor Preference', count: 3, amount: 90.00, percentage: 9.5 },
  ],
  refundMethods: [
    { method: 'Store Credit Voucher', count: 14, amount: 485.50 },
    { method: 'Original Payment Card', count: 9, amount: 320.00 },
    { method: 'Cash Refund', count: 5, amount: 140.00 },
  ],
  returnedProducts: [
    { productName: 'Canvas Barista Work Apron', sku: 'ACC-301-M-BLK', unitsReturned: 5, refundAmount: 145.00, primaryReason: 'Wrong Size / Fit' },
    { productName: 'Ceramic Pour-Over Dripper', sku: 'EQP-102-RED', unitsReturned: 4, refundAmount: 96.00, primaryReason: 'Defective / Damaged Packaging' },
    { productName: 'Artisan Salted Caramel Syrup', sku: 'SYR-301-CAR', unitsReturned: 3, refundAmount: 37.50, primaryReason: 'Customer Changed Mind' },
    { productName: 'Digital Precision Scale 0.1g', sku: 'EQP-105', unitsReturned: 2, refundAmount: 70.00, primaryReason: 'Calibration Inaccuracy' },
  ],
};

export const MOCK_CASHIER_REGISTERS: CashierRegisterShift[] = [
  {
    id: 's-1',
    registerId: 'Terminal #01 (Main Counter)',
    cashierName: 'Elena Rostova',
    shift: 'Morning (07:00 - 15:00)',
    date: '2026-10-12',
    openingCash: 200.00,
    cashSales: 1680.00,
    cardSales: 3450.00,
    cashIn: 50.00,
    cashOut: 100.00,
    expectedCash: 1830.00,
    actualCash: 1830.00,
    difference: 0.00,
    ordersCount: 164,
    totalSales: 5130.00,
    status: 'Balanced',
  },
  {
    id: 's-2',
    registerId: 'Terminal #02 (Express & Drive-thru)',
    cashierName: 'Marcus Vance',
    shift: 'Morning (07:00 - 15:00)',
    date: '2026-10-12',
    openingCash: 200.00,
    cashSales: 1240.00,
    cardSales: 2890.00,
    cashIn: 0.00,
    cashOut: 50.00,
    expectedCash: 1390.00,
    actualCash: 1385.00,
    difference: -5.00,
    ordersCount: 132,
    totalSales: 4130.00,
    status: 'Short',
  },
  {
    id: 's-3',
    registerId: 'Terminal #01 (Main Counter)',
    cashierName: 'Sarah Jenkins',
    shift: 'Evening (15:00 - 22:00)',
    date: '2026-10-12',
    openingCash: 200.00,
    cashSales: 1420.00,
    cardSales: 2980.00,
    cashIn: 0.00,
    cashOut: 0.00,
    expectedCash: 1620.00,
    actualCash: 1623.50,
    difference: +3.50,
    ordersCount: 140,
    totalSales: 4400.00,
    status: 'Over',
  },
];

export const MOCK_PURCHASE_REPORT: PurchaseReportSummary = {
  totalPurchases: 18,
  totalSpend: 24850.00,
  completedPOs: 15,
  pendingPOs: 3,
  supplierSpend: [
    { supplier: 'Origins Roastery', poCount: 6, totalSpend: 11200.00, fulfillmentRate: 98.5, pendingAmount: 0 },
    { supplier: 'Hario Japan Wholesale', poCount: 4, totalSpend: 4850.00, fulfillmentRate: 96.0, pendingAmount: 1200.00 },
    { supplier: 'Oatly Distribution LLC', poCount: 3, totalSpend: 3950.00, fulfillmentRate: 100.0, pendingAmount: 0 },
    { supplier: 'Monin Gourmet Syrups', poCount: 3, totalSpend: 2850.00, fulfillmentRate: 95.0, pendingAmount: 650.00 },
    { supplier: 'BaristaPro Manufacturing', poCount: 2, totalSpend: 2000.00, fulfillmentRate: 92.0, pendingAmount: 0 },
  ],
  recentPurchases: [
    { poNumber: 'PO-2026-108', supplier: 'Origins Roastery', date: '2026-10-10', itemsCount: 450, totalCost: 5400.00, status: 'Received', paymentStatus: 'Paid' },
    { poNumber: 'PO-2026-107', supplier: 'Hario Japan Wholesale', date: '2026-10-08', itemsCount: 60, totalCost: 1200.00, status: 'Pending', paymentStatus: 'Unpaid' },
    { poNumber: 'PO-2026-106', supplier: 'Oatly Distribution LLC', date: '2026-10-06', itemsCount: 300, totalCost: 1050.00, status: 'Received', paymentStatus: 'Paid' },
    { poNumber: 'PO-2026-105', supplier: 'Monin Gourmet Syrups', date: '2026-10-04', itemsCount: 85, totalCost: 650.00, status: 'Partial', paymentStatus: 'Partial' },
    { poNumber: 'PO-2026-104', supplier: 'BaristaPro Manufacturing', date: '2026-10-01', itemsCount: 40, totalCost: 800.00, status: 'Received', paymentStatus: 'Paid' },
  ],
};

// Export to CSV utility helper
export function exportTableToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [
    headers.join(','),
    ...rows.map(row => 
      row.map(val => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
