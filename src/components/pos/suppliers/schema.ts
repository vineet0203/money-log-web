import { z } from 'zod';

export const supplierFormSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name must be at least 2 characters'),
  code: z.string().trim().min(2, 'Supplier code is required (e.g. SUP-007)'),
  contactPerson: z.string().trim().min(2, 'Contact person name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits'),
  address: z.string().trim().min(3, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  gstTaxNumber: z.string().trim().optional().default(''),
  paymentTerms: z.enum(['Due on Receipt', 'Net 15', 'Net 30', 'Net 60', 'Cash on Delivery']),
  bankName: z.string().trim().min(2, 'Bank name is required'),
  accountNumber: z.string().trim().min(4, 'Account number must be at least 4 digits'),
  ifscOrSwift: z.string().trim().min(4, 'IFSC / SWIFT routing code is required'),
  upiId: z.string().trim().optional().default(''),
  categoriesSupplied: z.array(z.string()).min(1, 'Select at least one product category'),
  status: z.enum(['Active', 'Inactive']),
  notes: z.string().trim().optional().default(''),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

export const purchaseLineItemSchema = z.object({
  id: z.string(),
  productId: z.number().optional(),
  variantId: z.string().optional(),
  sku: z.string().trim().min(1, 'SKU is required'),
  itemName: z.string().trim().min(1, 'Item name is required'),
  unit: z.string().trim().min(1, 'Unit is required').default('pcs'),
  orderedQty: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.coerce.number().min(0.01, 'Cost price must be greater than $0'),
  taxPercent: z.coerce.number().min(0, 'Tax percentage cannot be negative').max(100, 'Tax cannot exceed 100%').default(0),
});

export const createPurchaseSchema = z.object({
  type: z.enum(['PurchaseOrder', 'DirectBill']),
  supplierId: z.string().trim().min(1, 'Please select a supplier'),
  date: z.string().trim().min(1, 'Bill date is required'),
  dueDateOrExpectedDate: z.string().trim().min(1, 'Payment due date is required'),
  supplierInvoiceNo: z.string().trim().optional().default(''),
  paymentTerms: z.enum(['Due on Receipt', 'Net 15', 'Net 30', 'Net 60', 'Cash on Delivery']),
  shippingFee: z.coerce.number().min(0, 'Shipping fee must be 0 or more').default(0),
  discount: z.coerce.number().min(0, 'Discount must be 0 or more').default(0),
  items: z.array(purchaseLineItemSchema).min(1, 'At least one line item is required in the purchase bill'),
  notes: z.string().trim().optional().default(''),
}).refine(data => {
  if (data.date && data.dueDateOrExpectedDate) {
    return new Date(data.dueDateOrExpectedDate) >= new Date(data.date);
  }
  return true;
}, {
  message: 'Payment due date cannot be earlier than bill date',
  path: ['dueDateOrExpectedDate'],
});

export type CreatePurchaseFormData = z.infer<typeof createPurchaseSchema>;

export const receivingLineItemSchema = z.object({
  sku: z.string(),
  itemName: z.string(),
  unit: z.string(),
  orderedQty: z.number(),
  previouslyReceived: z.number().default(0),
  receivedQty: z.coerce.number().min(0, 'Received quantity cannot be negative'),
  damagedQty: z.coerce.number().min(0, 'Damaged quantity cannot be negative'),
  unitCost: z.number(),
  batchNumber: z.string().trim().optional().default(''),
  expiryDate: z.string().trim().optional().default(''),
  remarks: z.string().trim().optional().default(''),
});

export const goodsReceivingFormSchema = z.object({
  poNumber: z.string().min(1, 'Select a purchase order'),
  receivedDate: z.string().min(1, 'Receiving date is required'),
  receivedBy: z.string().trim().min(2, 'Receiver name is required'),
  notes: z.string().trim().optional().default(''),
  items: z.array(receivingLineItemSchema).min(1, 'At least one item is required in GRN'),
});

export type GoodsReceivingFormData = z.infer<typeof goodsReceivingFormSchema>;

export const supplierPaymentFormSchema = z.object({
  supplierId: z.string().min(1, 'Please select a supplier'),
  billNumber: z.string().optional().default(''),
  poNumber: z.string().optional().default(''),
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMode: z.enum(['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Card']),
  referenceNumber: z.string().trim().min(2, 'Transaction / Cheque / UTR reference number is required'),
  notes: z.string().trim().optional().default(''),
});

export type SupplierPaymentFormData = z.infer<typeof supplierPaymentFormSchema>;
