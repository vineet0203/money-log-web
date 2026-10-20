export type PaperWidth = '80mm' | '58mm' | 'A4';
export type QrCodeType = 'auto' | 'custom';

export interface PosTaxRate {
  id: string;
  name: string;
  percentage: number;
}

export interface PosReceiptSettings {
  // Store Identity & Branding
  storeName: string;
  storeTagline: string;
  storeLogoUrl: string; // custom image url or base64
  storeLogoInitial: string; // fallback monogram letter (e.g. 'M')
  
  // Location & Contact
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  gstTaxNumber: string;

  // Taxation & Currency Configuration
  currencySymbol: string;
  currencyCode: string;
  taxes: PosTaxRate[];
  isTaxInclusive: boolean;

  // UPI Payments & QR
  upiId: string;
  upiPayeeName: string;
  upiQrType: QrCodeType;
  upiQrImageUrl: string; // optional uploaded custom QR image data URL

  // Header, Footer & Policy
  receiptHeaderNote: string;
  receiptFooterNote: string;
  returnPolicy: string;
  returnWindowDays: number;

  // Format & Printing Preferences
  paperSize: PaperWidth;
  showTaxBreakdown: boolean;
  showCashierName: boolean;
  cashierName?: string;
  showCustomerInfo: boolean;
  showUpiQrOnReceipt: boolean;
  autoPrintReceipt: boolean;
  cashDrawerFloat?: number;
}

export interface PosGeneralSettings {
  currencySymbol: string;
  currencyCode: string;
  taxes: PosTaxRate[];
  defaultTaxRate: number;
  isTaxInclusive: boolean;
  enableCash: boolean;
  enableCard: boolean;
  enableUpi: boolean;
  registerName: string;
  cashDrawerFloat: number;
}

export const DEFAULT_TAX_RATES: PosTaxRate[] = [
  { id: 'tax-1', name: 'Sales Tax', percentage: 8.0 }
];

export const DEFAULT_RECEIPT_SETTINGS: PosReceiptSettings = {
  storeName: 'MONEY LOG POS',
  storeTagline: 'Retail & Specialty Store',
  storeLogoUrl: '',
  storeLogoInitial: 'M',
  addressLine1: '44 Industrial Parkway, Suite 100',
  addressLine2: 'Market District',
  city: 'Seattle',
  state: 'WA',
  postalCode: '98101',
  phone: '+1 (555) 234-8901',
  email: 'store@moneylogpos.com',
  website: 'www.moneylogpos.com',
  gstTaxNumber: 'US-WA-8839210',
  currencySymbol: '$',
  currencyCode: 'USD',
  taxes: [
    { id: 'tax-1', name: 'Sales Tax', percentage: 8.0 }
  ],
  isTaxInclusive: false,
  upiId: 'moneylogpos@okaxis',
  upiPayeeName: 'MoneyLog Retail Store',
  upiQrType: 'custom',
  upiQrImageUrl: '',
  receiptHeaderNote: 'Quality & Freshness Guaranteed',
  receiptFooterNote: 'Thank you for your purchase! Please visit again.',
  returnPolicy: 'Returns accepted within 14 days with original receipt.',
  returnWindowDays: 14,
  paperSize: '80mm',
  showTaxBreakdown: true,
  showCashierName: true,
  showCustomerInfo: true,
  showUpiQrOnReceipt: true,
  autoPrintReceipt: false,
};

export const DEFAULT_GENERAL_SETTINGS: PosGeneralSettings = {
  currencySymbol: '$',
  currencyCode: 'USD',
  taxes: [
    { id: 'tax-1', name: 'Sales Tax', percentage: 8.0 }
  ],
  defaultTaxRate: 8.0,
  isTaxInclusive: false,
  enableCash: true,
  enableCard: true,
  enableUpi: true,
  registerName: 'Main Counter Register #01',
  cashDrawerFloat: 250.00,
};
