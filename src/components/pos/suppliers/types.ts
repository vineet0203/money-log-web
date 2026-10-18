export interface SupplierBankDetails {
  bankName: string;
  accountNumber: string;
  ifscOrSwift: string;
  upiId?: string;
}

export type PaymentTerm = 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60' | 'Cash on Delivery';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  gstTaxNumber: string;
  paymentTerms: PaymentTerm;
  bankDetails: SupplierBankDetails;
  categoriesSupplied: string[];
  balancePayable: number;
  status: 'Active' | 'Inactive';
  rating: number; // 1 to 5
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId?: number;
  variantId?: string;
  itemName: string;
  sku: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  taxPercent: number;
  lineTotal: number;
}

export type PurchaseOrderStatus = 'Draft' | 'Ordered' | 'Partial' | 'Received' | 'Cancelled';
export type PurchasePaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  status: PurchaseOrderStatus;
  paymentStatus: PurchasePaymentStatus;
  amountPaid: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierInvoiceNo: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  billDate: string;
  dueDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PurchasePaymentStatus;
  paymentTerms: PaymentTerm;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceivingItem {
  id: string;
  sku: string;
  itemName: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  acceptedQty: number;
  unitCost: number;
  batchNumber: string;
  expiryDate: string;
  remarks?: string;
}

export type GRNStatus = 'Completed' | 'Partial Discrepancy' | 'Rejected';

export interface GoodsReceivingRecord {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  status: GRNStatus;
  items: GoodsReceivingItem[];
  totalOrdered: number;
  totalAccepted: number;
  totalDamaged: number;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash' | 'Card';

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  billNumber?: string;
  poNumber?: string;
  paymentDate: string;
  amount: number;
  paymentMode: PaymentMethod;
  referenceNumber: string; // UTR or Cheque No
  notes?: string;
  createdAt: string;
}

export interface CatalogItemOption {
  productId: number;
  variantId?: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  category: string;
}
