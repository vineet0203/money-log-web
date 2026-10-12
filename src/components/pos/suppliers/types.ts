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

export const CATALOG_ITEMS: CatalogItemOption[] = [
  { productId: 1, sku: 'CB-ETH-250G', name: 'Ethiopian Yirgacheffe Whole Bean (250g)', unit: 'pack', costPrice: 9.50, category: 'Coffee' },
  { productId: 1, sku: 'CB-ETH-1KG', name: 'Ethiopian Yirgacheffe Whole Bean (1kg)', unit: 'pack', costPrice: 32.00, category: 'Coffee' },
  { productId: 2, sku: 'CB-COL-250G', name: 'Colombian Supremo Whole Bean (250g)', unit: 'pack', costPrice: 8.00, category: 'Coffee' },
  { productId: 2, sku: 'CB-COL-1KG', name: 'Colombian Supremo Whole Bean (1kg)', unit: 'pack', costPrice: 28.50, category: 'Coffee' },
  { productId: 3, sku: 'MILK-OAT-1L', name: 'Oatly Barista Edition Oat Milk (1L)', unit: 'box', costPrice: 2.75, category: 'Dairy & Milks' },
  { productId: 4, sku: 'MILK-ALM-1L', name: 'Almond Breeze Barista Almond Milk (1L)', unit: 'box', costPrice: 2.60, category: 'Dairy & Milks' },
  { productId: 5, sku: 'SYR-VAN-750ML', name: 'Monin French Vanilla Syrup (750ml)', unit: 'bottle', costPrice: 6.90, category: 'Syrups & Flavors' },
  { productId: 6, sku: 'SYR-CAR-750ML', name: 'Monin Salted Caramel Syrup (750ml)', unit: 'bottle', costPrice: 6.90, category: 'Syrups & Flavors' },
  { productId: 7, sku: 'FLT-HAR-02', name: 'Hario V60 Paper Filters #02 (100pk)', unit: 'pack', costPrice: 3.80, category: 'Equipment' },
  { productId: 8, sku: 'CUP-TAK-12OZ', name: 'Biodegradable Takeaway Cups 12oz (500ct)', unit: 'box', costPrice: 28.00, category: 'Packaging' },
  { productId: 9, sku: 'CUP-TAK-LID', name: 'Compostable Sipper Lids 12oz (500ct)', unit: 'box', costPrice: 16.50, category: 'Packaging' },
  { productId: 10, sku: 'CLEAN-CAF-900', name: 'Cafiza Espresso Machine Cleaner 900g', unit: 'bottle', costPrice: 14.20, category: 'Maintenance' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Origins Specialty Roasters',
    code: 'SUP-001',
    contactPerson: 'David Chen',
    email: 'orders@originsroasters.com',
    phone: '+1 (555) 234-8901',
    address: '44 Industrial Parkway, Suite 100',
    city: 'Seattle, WA',
    gstTaxNumber: 'US-WA-8839210',
    paymentTerms: 'Net 30',
    bankDetails: {
      bankName: 'Silicon Valley Commercial Bank',
      accountNumber: '9928374610',
      ifscOrSwift: 'SVCBUS33',
      upiId: 'originsroasters@bank'
    },
    categoriesSupplied: ['Coffee'],
    balancePayable: 4250.00,
    status: 'Active',
    rating: 5,
    notes: 'Direct farm-to-cup roaster. Always delivers on Tuesdays and Thursdays.',
    createdAt: '2025-02-15'
  },
  {
    id: 'sup-2',
    name: 'Oatly & Plant Beverages Ltd',
    code: 'SUP-002',
    contactPerson: 'Sara Lindqvist',
    email: 'wholesale@oatlybeverages.com',
    phone: '+1 (555) 678-1234',
    address: '812 Logistics Blvd',
    city: 'Portland, OR',
    gstTaxNumber: 'US-OR-5549021',
    paymentTerms: 'Net 15',
    bankDetails: {
      bankName: 'Northwest Community Bank',
      accountNumber: '4482910394',
      ifscOrSwift: 'NWCBUS44',
      upiId: 'oatlywholesale@bank'
    },
    categoriesSupplied: ['Dairy & Milks'],
    balancePayable: 1120.00,
    status: 'Active',
    rating: 5,
    notes: 'Primary plant-milk supplier. Minimum order 10 cases for free freight.',
    createdAt: '2025-03-01'
  },
  {
    id: 'sup-3',
    name: 'Monin Gourmet Syrups Inc',
    code: 'SUP-003',
    contactPerson: 'Marco Valenti',
    email: 'distribution@moningourmet.com',
    phone: '+1 (555) 890-5678',
    address: '150 Beverage Way',
    city: 'Tampa, FL',
    gstTaxNumber: 'US-FL-1928304',
    paymentTerms: 'Net 30',
    bankDetails: {
      bankName: 'First Southern Bank',
      accountNumber: '8837192034',
      ifscOrSwift: 'FSBNUS22',
    },
    categoriesSupplied: ['Syrups & Flavors'],
    balancePayable: 580.00,
    status: 'Active',
    rating: 4,
    notes: 'Premium gourmet syrups and fruit purees. Bi-weekly restocks.',
    createdAt: '2025-03-20'
  },
  {
    id: 'sup-4',
    name: 'Hario Brew Gear & Parts',
    code: 'SUP-004',
    contactPerson: 'Kenji Takahashi',
    email: 'sales-us@hariobrew.com',
    phone: '+1 (555) 432-8765',
    address: '300 Pacific Trade Center',
    city: 'Los Angeles, CA',
    gstTaxNumber: 'US-CA-7712399',
    paymentTerms: 'Net 60',
    bankDetails: {
      bankName: 'Pacific Rim Alliance Bank',
      accountNumber: '6618294012',
      ifscOrSwift: 'PRABUS66',
    },
    categoriesSupplied: ['Equipment', 'Packaging'],
    balancePayable: 0.00,
    status: 'Active',
    rating: 5,
    notes: 'Authorized distributor of Japanese V60 gear, drippers, and servers.',
    createdAt: '2025-01-10'
  },
  {
    id: 'sup-5',
    name: 'EcoPack Solutions Co',
    code: 'SUP-005',
    contactPerson: 'Rachel Simmons',
    email: 'sales@ecopacksupply.com',
    phone: '+1 (555) 901-4433',
    address: '95 Green Valley Road',
    city: 'Austin, TX',
    gstTaxNumber: 'US-TX-4482190',
    paymentTerms: 'Due on Receipt',
    bankDetails: {
      bankName: 'Texas Metro Trust',
      accountNumber: '3391029482',
      ifscOrSwift: 'TMTRUS77',
      upiId: 'ecopack@upi'
    },
    categoriesSupplied: ['Packaging'],
    balancePayable: 840.00,
    status: 'Active',
    rating: 4,
    notes: 'Biodegradable cups, hot lids, kraft sleeves, and straws.',
    createdAt: '2025-04-05'
  },
  {
    id: 'sup-6',
    name: 'Alpine Dairy Farms Co-op',
    code: 'SUP-006',
    contactPerson: 'Thomas Miller',
    email: 'orders@alpinedairy.com',
    phone: '+1 (555) 321-9870',
    address: '12 Farmhouse Lane',
    city: 'Boise, ID',
    gstTaxNumber: 'US-ID-9920145',
    paymentTerms: 'Cash on Delivery',
    bankDetails: {
      bankName: 'Intermountain Credit Union',
      accountNumber: '1109283746',
      ifscOrSwift: 'ICUNUS88',
    },
    categoriesSupplied: ['Dairy & Milks'],
    balancePayable: 0.00,
    status: 'Inactive',
    rating: 3,
    notes: 'Former whole milk provider. Account paused due to delivery delays.',
    createdAt: '2024-11-12'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-0101',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    orderDate: '2026-10-01',
    expectedDate: '2026-10-08',
    items: [
      {
        id: 'poi-1',
        productId: 1,
        sku: 'CB-ETH-1KG',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 50,
        receivedQty: 50,
        unitCost: 32.00,
        taxPercent: 5,
        lineTotal: 1680.00
      },
      {
        id: 'poi-2',
        productId: 2,
        sku: 'CB-COL-1KG',
        itemName: 'Colombian Supremo Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 60,
        receivedQty: 60,
        unitCost: 28.50,
        taxPercent: 5,
        lineTotal: 1795.50
      }
    ],
    subtotal: 3310.00,
    taxTotal: 165.50,
    shippingFee: 45.00,
    discount: 50.00,
    grandTotal: 3470.50,
    status: 'Received',
    paymentStatus: 'Paid',
    amountPaid: 3470.50,
    notes: 'Harvest lot #24. Inspected and approved by Head Barista.',
    createdAt: '2026-10-01'
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-0102',
    supplierId: 'sup-2',
    supplierName: 'Oatly & Plant Beverages Ltd',
    orderDate: '2026-10-05',
    expectedDate: '2026-10-12',
    items: [
      {
        id: 'poi-3',
        productId: 3,
        sku: 'MILK-OAT-1L',
        itemName: 'Oatly Barista Edition Oat Milk (1L)',
        unit: 'box',
        orderedQty: 240,
        receivedQty: 240,
        unitCost: 2.75,
        taxPercent: 5,
        lineTotal: 693.00
      },
      {
        id: 'poi-4',
        productId: 4,
        sku: 'MILK-ALM-1L',
        itemName: 'Almond Breeze Barista Almond Milk (1L)',
        unit: 'box',
        orderedQty: 120,
        receivedQty: 120,
        unitCost: 2.60,
        taxPercent: 5,
        lineTotal: 327.60
      }
    ],
    subtotal: 972.00,
    taxTotal: 48.60,
    shippingFee: 30.00,
    discount: 0.00,
    grandTotal: 1050.60,
    status: 'Received',
    paymentStatus: 'Partial',
    amountPaid: 500.00,
    notes: 'Case delivery into cold storage warehouse #2.',
    createdAt: '2026-10-05'
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-0103',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    orderDate: '2026-10-09',
    expectedDate: '2026-10-16',
    items: [
      {
        id: 'poi-5',
        productId: 1,
        sku: 'CB-ETH-250G',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 50,
        unitCost: 9.50,
        taxPercent: 5,
        lineTotal: 997.50
      },
      {
        id: 'poi-6',
        productId: 2,
        sku: 'CB-COL-250G',
        itemName: 'Colombian Supremo Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 0,
        unitCost: 8.00,
        taxPercent: 5,
        lineTotal: 840.00
      }
    ],
    subtotal: 1750.00,
    taxTotal: 87.50,
    shippingFee: 35.00,
    discount: 0.00,
    grandTotal: 1872.50,
    status: 'Partial',
    paymentStatus: 'Unpaid',
    amountPaid: 0.00,
    notes: 'Split shipment: First 50 packs arrived Oct 11, remainder expected Friday.',
    createdAt: '2026-10-09'
  },
  {
    id: 'po-104',
    poNumber: 'PO-2026-0104',
    supplierId: 'sup-3',
    supplierName: 'Monin Gourmet Syrups Inc',
    orderDate: '2026-10-10',
    expectedDate: '2026-10-18',
    items: [
      {
        id: 'poi-7',
        productId: 5,
        sku: 'SYR-VAN-750ML',
        itemName: 'Monin French Vanilla Syrup (750ml)',
        unit: 'bottle',
        orderedQty: 48,
        receivedQty: 0,
        unitCost: 6.90,
        taxPercent: 8,
        lineTotal: 357.70
      },
      {
        id: 'poi-8',
        productId: 6,
        sku: 'SYR-CAR-750ML',
        itemName: 'Monin Salted Caramel Syrup (750ml)',
        unit: 'bottle',
        orderedQty: 48,
        receivedQty: 0,
        unitCost: 6.90,
        taxPercent: 8,
        lineTotal: 357.70
      }
    ],
    subtotal: 662.40,
    taxTotal: 53.00,
    shippingFee: 25.00,
    discount: 20.00,
    grandTotal: 720.40,
    status: 'Ordered',
    paymentStatus: 'Unpaid',
    amountPaid: 0.00,
    notes: 'Awaiting dispatch confirmation from Tampa distribution center.',
    createdAt: '2026-10-10'
  },
  {
    id: 'po-105',
    poNumber: 'PO-2026-0105',
    supplierId: 'sup-5',
    supplierName: 'EcoPack Solutions Co',
    orderDate: '2026-10-11',
    expectedDate: '2026-10-17',
    items: [
      {
        id: 'poi-9',
        productId: 8,
        sku: 'CUP-TAK-12OZ',
        itemName: 'Biodegradable Takeaway Cups 12oz (500ct)',
        unit: 'box',
        orderedQty: 20,
        receivedQty: 0,
        unitCost: 28.00,
        taxPercent: 0,
        lineTotal: 560.00
      },
      {
        id: 'poi-10',
        productId: 9,
        sku: 'CUP-TAK-LID',
        itemName: 'Compostable Sipper Lids 12oz (500ct)',
        unit: 'box',
        orderedQty: 20,
        receivedQty: 0,
        unitCost: 16.50,
        taxPercent: 0,
        lineTotal: 330.00
      }
    ],
    subtotal: 890.00,
    taxTotal: 0.00,
    shippingFee: 40.00,
    discount: 30.00,
    grandTotal: 900.00,
    status: 'Draft',
    paymentStatus: 'Unpaid',
    amountPaid: 0.00,
    notes: 'Pending review of remaining cup stock in front bar storage.',
    createdAt: '2026-10-11'
  }
];

export const INITIAL_PURCHASE_BILLS: PurchaseBill[] = [
  {
    id: 'bill-201',
    billNumber: 'BILL-2026-0081',
    supplierInvoiceNo: 'INV-OR-8821',
    poNumber: 'PO-2026-0101',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    billDate: '2026-10-02',
    dueDate: '2026-11-01',
    items: [
      {
        id: 'bi-1',
        productId: 1,
        sku: 'CB-ETH-1KG',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 50,
        receivedQty: 50,
        unitCost: 32.00,
        taxPercent: 5,
        lineTotal: 1680.00
      },
      {
        id: 'bi-2',
        productId: 2,
        sku: 'CB-COL-1KG',
        itemName: 'Colombian Supremo Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 60,
        receivedQty: 60,
        unitCost: 28.50,
        taxPercent: 5,
        lineTotal: 1795.50
      }
    ],
    subtotal: 3310.00,
    taxTotal: 165.50,
    shippingFee: 45.00,
    discount: 50.00,
    grandTotal: 3470.50,
    amountPaid: 3470.50,
    balanceDue: 0.00,
    paymentStatus: 'Paid',
    paymentTerms: 'Net 30',
    notes: 'Fully settled via corporate Wire Transfer.',
    createdAt: '2026-10-02'
  },
  {
    id: 'bill-202',
    billNumber: 'BILL-2026-0082',
    supplierInvoiceNo: 'OAT-US-4920',
    poNumber: 'PO-2026-0102',
    supplierId: 'sup-2',
    supplierName: 'Oatly & Plant Beverages Ltd',
    billDate: '2026-10-06',
    dueDate: '2026-10-21',
    items: [
      {
        id: 'bi-3',
        productId: 3,
        sku: 'MILK-OAT-1L',
        itemName: 'Oatly Barista Edition Oat Milk (1L)',
        unit: 'box',
        orderedQty: 240,
        receivedQty: 240,
        unitCost: 2.75,
        taxPercent: 5,
        lineTotal: 693.00
      },
      {
        id: 'bi-4',
        productId: 4,
        sku: 'MILK-ALM-1L',
        itemName: 'Almond Breeze Barista Almond Milk (1L)',
        unit: 'box',
        orderedQty: 120,
        receivedQty: 120,
        unitCost: 2.60,
        taxPercent: 5,
        lineTotal: 327.60
      }
    ],
    subtotal: 972.00,
    taxTotal: 48.60,
    shippingFee: 30.00,
    discount: 0.00,
    grandTotal: 1050.60,
    amountPaid: 500.00,
    balanceDue: 550.60,
    paymentStatus: 'Partial',
    paymentTerms: 'Net 15',
    notes: '$500 advance paid on dispatch. Balance due Oct 21.',
    createdAt: '2026-10-06'
  },
  {
    id: 'bill-203',
    billNumber: 'BILL-2026-0083',
    supplierInvoiceNo: 'INV-OR-8910',
    poNumber: 'PO-2026-0103',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    billDate: '2026-10-09',
    dueDate: '2026-11-08',
    items: [
      {
        id: 'bi-5',
        productId: 1,
        sku: 'CB-ETH-250G',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 50,
        unitCost: 9.50,
        taxPercent: 5,
        lineTotal: 997.50
      },
      {
        id: 'bi-6',
        productId: 2,
        sku: 'CB-COL-250G',
        itemName: 'Colombian Supremo Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 0,
        unitCost: 8.00,
        taxPercent: 5,
        lineTotal: 840.00
      }
    ],
    subtotal: 1750.00,
    taxTotal: 87.50,
    shippingFee: 35.00,
    discount: 0.00,
    grandTotal: 1872.50,
    amountPaid: 0.00,
    balanceDue: 1872.50,
    paymentStatus: 'Unpaid',
    paymentTerms: 'Net 30',
    notes: 'Invoice received with split delivery consignment.',
    createdAt: '2026-10-09'
  },
  {
    id: 'bill-204',
    billNumber: 'BILL-2026-0084',
    supplierInvoiceNo: 'ECO-TX-9901',
    poNumber: undefined,
    supplierId: 'sup-5',
    supplierName: 'EcoPack Solutions Co',
    billDate: '2026-10-08',
    dueDate: '2026-10-08',
    items: [
      {
        id: 'bi-7',
        productId: 8,
        sku: 'CUP-TAK-12OZ',
        itemName: 'Biodegradable Takeaway Cups 12oz (500ct)',
        unit: 'box',
        orderedQty: 15,
        receivedQty: 15,
        unitCost: 28.00,
        taxPercent: 0,
        lineTotal: 420.00
      },
      {
        id: 'bi-8',
        productId: 9,
        sku: 'CUP-TAK-LID',
        itemName: 'Compostable Sipper Lids 12oz (500ct)',
        unit: 'box',
        orderedQty: 15,
        receivedQty: 15,
        unitCost: 16.50,
        taxPercent: 0,
        lineTotal: 247.50
      }
    ],
    subtotal: 667.50,
    taxTotal: 0.00,
    shippingFee: 25.00,
    discount: 0.00,
    grandTotal: 692.50,
    amountPaid: 0.00,
    balanceDue: 692.50,
    paymentStatus: 'Unpaid',
    paymentTerms: 'Due on Receipt',
    notes: 'Urgent weekend emergency cup replenishment.',
    createdAt: '2026-10-08'
  }
];

export const INITIAL_GRN_RECORDS: GoodsReceivingRecord[] = [
  {
    id: 'grn-301',
    grnNumber: 'GRN-2026-0041',
    poNumber: 'PO-2026-0101',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    receivedDate: '2026-10-07',
    receivedBy: 'Marcus Vance (Warehouse Lead)',
    status: 'Completed',
    totalOrdered: 110,
    totalAccepted: 110,
    totalDamaged: 0,
    items: [
      {
        id: 'grni-1',
        sku: 'CB-ETH-1KG',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 50,
        receivedQty: 50,
        damagedQty: 0,
        acceptedQty: 50,
        unitCost: 32.00,
        batchNumber: 'LOT-ETH-2026-44',
        expiryDate: '2027-04-01',
        remarks: 'Sealed nitrogen foil packaging intact'
      },
      {
        id: 'grni-2',
        sku: 'CB-COL-1KG',
        itemName: 'Colombian Supremo Whole Bean (1kg)',
        unit: 'pack',
        orderedQty: 60,
        receivedQty: 60,
        damagedQty: 0,
        acceptedQty: 60,
        unitCost: 28.50,
        batchNumber: 'LOT-COL-2026-38',
        expiryDate: '2027-04-15',
        remarks: 'Sample cup profile tested: 86.5 Q-score'
      }
    ],
    notes: 'Full delivery accepted without any transit damages.',
    createdAt: '2026-10-07'
  },
  {
    id: 'grn-302',
    grnNumber: 'GRN-2026-0042',
    poNumber: 'PO-2026-0102',
    supplierId: 'sup-2',
    supplierName: 'Oatly & Plant Beverages Ltd',
    receivedDate: '2026-10-11',
    receivedBy: 'Elena Rostova (Store Manager)',
    status: 'Completed',
    totalOrdered: 360,
    totalAccepted: 356,
    totalDamaged: 4,
    items: [
      {
        id: 'grni-3',
        sku: 'MILK-OAT-1L',
        itemName: 'Oatly Barista Edition Oat Milk (1L)',
        unit: 'box',
        orderedQty: 240,
        receivedQty: 240,
        damagedQty: 4,
        acceptedQty: 236,
        unitCost: 2.75,
        batchNumber: 'OAT-B29-OCT',
        expiryDate: '2027-08-20',
        remarks: '4 tetrapaks crushed during palette unloading'
      },
      {
        id: 'grni-4',
        sku: 'MILK-ALM-1L',
        itemName: 'Almond Breeze Barista Almond Milk (1L)',
        unit: 'box',
        orderedQty: 120,
        receivedQty: 120,
        damagedQty: 0,
        acceptedQty: 120,
        unitCost: 2.60,
        batchNumber: 'ALM-B14-SEP',
        expiryDate: '2027-07-30',
        remarks: 'Pristine condition'
      }
    ],
    notes: 'Supplier informed regarding 4 damaged Oat milk units. Credit note issued.',
    createdAt: '2026-10-11'
  },
  {
    id: 'grn-303',
    grnNumber: 'GRN-2026-0043',
    poNumber: 'PO-2026-0103',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    receivedDate: '2026-10-11',
    receivedBy: 'Marcus Vance (Warehouse Lead)',
    status: 'Partial Discrepancy',
    totalOrdered: 200,
    totalAccepted: 50,
    totalDamaged: 0,
    items: [
      {
        id: 'grni-5',
        sku: 'CB-ETH-250G',
        itemName: 'Ethiopian Yirgacheffe Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 50,
        damagedQty: 0,
        acceptedQty: 50,
        unitCost: 9.50,
        batchNumber: 'LOT-ETH-250-99',
        expiryDate: '2027-04-10',
        remarks: 'First consignment of 50 packs received'
      },
      {
        id: 'grni-6',
        sku: 'CB-COL-250G',
        itemName: 'Colombian Supremo Whole Bean (250g)',
        unit: 'pack',
        orderedQty: 100,
        receivedQty: 0,
        damagedQty: 0,
        acceptedQty: 0,
        unitCost: 8.00,
        batchNumber: 'PENDING',
        expiryDate: 'PENDING',
        remarks: 'Awaiting remaining shipment'
      }
    ],
    notes: 'Partial intake. 150 items pending from supplier.',
    createdAt: '2026-10-11'
  }
];

export const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [
  {
    id: 'pay-401',
    paymentNumber: 'PAY-2026-0071',
    supplierId: 'sup-1',
    supplierName: 'Origins Specialty Roasters',
    billNumber: 'BILL-2026-0081',
    poNumber: 'PO-2026-0101',
    paymentDate: '2026-10-04',
    amount: 3470.50,
    paymentMode: 'Bank Transfer',
    referenceNumber: 'UTR-SVB-99882104',
    notes: 'Full settlement of PO-2026-0101 invoice.',
    createdAt: '2026-10-04'
  },
  {
    id: 'pay-402',
    paymentNumber: 'PAY-2026-0072',
    supplierId: 'sup-2',
    supplierName: 'Oatly & Plant Beverages Ltd',
    billNumber: 'BILL-2026-0082',
    poNumber: 'PO-2026-0102',
    paymentDate: '2026-10-07',
    amount: 500.00,
    paymentMode: 'UPI',
    referenceNumber: 'UPI-NWB-44019245',
    notes: 'Part advance payment against delivery consignment.',
    createdAt: '2026-10-07'
  },
  {
    id: 'pay-403',
    paymentNumber: 'PAY-2026-0073',
    supplierId: 'sup-3',
    supplierName: 'Monin Gourmet Syrups Inc',
    paymentDate: '2026-09-28',
    amount: 650.00,
    paymentMode: 'Card',
    referenceNumber: 'CC-AUTH-882194',
    notes: 'Monthly syrup subscription order settlement.',
    createdAt: '2026-09-28'
  }
];
