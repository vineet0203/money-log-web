export type PaperWidth = '80mm' | '58mm' | 'A4';
export type QrCodeType = 'auto' | 'custom';

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

  // UPI Payments & QR
  upiId: string;
  upiPayeeName: string;
  upiQrType: QrCodeType;
  upiQrImageUrl: string; // optional uploaded custom QR image data URL

  // Header, Footer & Policy
  receiptHeaderNote: string;
  receiptFooterNote: string;
  returnPolicy: string;

  // Format & Printing Preferences
  paperSize: PaperWidth;
  showTaxBreakdown: boolean;
  showCashierName: boolean;
  showCustomerInfo: boolean;
  showUpiQrOnReceipt: boolean;
  autoPrintReceipt: boolean;
}

export interface PosGeneralSettings {
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number;
  isTaxInclusive: boolean;
  enableCash: boolean;
  enableCard: boolean;
  enableUpi: boolean;
  registerName: string;
  cashDrawerFloat: number;
}

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
  upiId: 'moneylogpos@okaxis',
  upiPayeeName: 'MoneyLog Retail Store',
  upiQrType: 'auto',
  upiQrImageUrl: '',
  receiptHeaderNote: 'Quality & Freshness Guaranteed',
  receiptFooterNote: 'Thank you for your purchase! Please visit again.',
  returnPolicy: 'Exchange within 7 days with original receipt. Consumables non-refundable.',
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
  defaultTaxRate: 8.0,
  isTaxInclusive: false,
  enableCash: true,
  enableCard: true,
  enableUpi: true,
  registerName: 'Main Counter Register #01',
  cashDrawerFloat: 250.00,
};
