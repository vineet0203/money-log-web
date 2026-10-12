export interface ProductVariant {
  id: string;
  productId: number;
  sku: string;
  barcode?: string;
  name: string;
  attributes: Record<string, string>; // e.g., { Size: 'Medium', Color: 'Black' } or { Volume: '500ml', Flavor: 'Vanilla' }
  costPrice: number;
  mrp: number;
  sellingPrice: number;
  stock: number;
  minStockAlert?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  costPrice: number;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  minStockAlert: number;
  unit: string; // 'pcs' | 'kg' | 'pack' | 'box'
  status: 'Active' | 'Draft' | 'Out of Stock';
  hasVariants: boolean;
  variants?: ProductVariant[];
  description?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Coffee', description: 'Freshly roasted whole beans and ground coffee', productCount: 4, status: 'Active' },
  { id: 'cat-2', name: 'Equipment', description: 'Brewing gear, drippers, scales, and accessories', productCount: 3, status: 'Active' },
  { id: 'cat-3', name: 'Dairy & Milks', description: 'Plant-based and dairy milk alternatives', productCount: 2, status: 'Active' },
  { id: 'cat-4', name: 'Syrups & Flavors', description: 'Specialty coffee syrups and flavor infusions', productCount: 2, status: 'Active' },
  { id: 'cat-5', name: 'Accessories', description: 'Barista aprons, reusable cups, and tools', productCount: 2, status: 'Active' },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'br-1', name: 'AeroGrind', description: 'Precision grinders and brew equipment', productCount: 3, status: 'Active' },
  { id: 'br-2', name: 'BaristaPro', description: 'Professional grade barista accessories', productCount: 3, status: 'Active' },
  { id: 'br-3', name: 'Hario', description: 'World-renowned Japanese glassware and pour-overs', productCount: 2, status: 'Active' },
  { id: 'br-4', name: 'Oatly', description: 'Premium barista-edition oat milk', productCount: 1, status: 'Active' },
  { id: 'br-5', name: 'Monin', description: 'Gourmet syrups and flavorings', productCount: 2, status: 'Active' },
  { id: 'br-6', name: 'Origins Roastery', description: 'Single origin and specialty coffee beans', productCount: 2, status: 'Active' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Premium Espresso Blend',
    sku: 'COF-001',
    barcode: '890123456701',
    category: 'Coffee',
    brand: 'Origins Roastery',
    costPrice: 12.00,
    mrp: 22.00,
    sellingPrice: 18.50,
    discountPercent: 15.9,
    stock: 45,
    minStockAlert: 10,
    unit: 'pack',
    status: 'Active',
    hasVariants: true,
    variants: [
      { id: 'v-1-1', productId: 1, sku: 'COF-001-250G', name: '250g Whole Bean', attributes: { Size: '250g' }, costPrice: 6.00, mrp: 12.00, sellingPrice: 10.00, stock: 25 },
      { id: 'v-1-2', productId: 1, sku: 'COF-001-500G', name: '500g Whole Bean', attributes: { Size: '500g' }, costPrice: 12.00, mrp: 22.00, sellingPrice: 18.50, stock: 20 },
      { id: 'v-1-3', productId: 1, sku: 'COF-001-1KG', name: '1kg Bulk Pack', attributes: { Size: '1kg' }, costPrice: 22.00, mrp: 40.00, sellingPrice: 34.00, stock: 10 },
    ],
    description: 'Dark roasted rich espresso blend with chocolate and caramel notes.',
    createdAt: '2026-10-01',
  },
  {
    id: 2,
    name: 'Ceramic Pour-Over Dripper',
    sku: 'EQP-102',
    barcode: '890123456702',
    category: 'Equipment',
    brand: 'Hario',
    costPrice: 15.00,
    mrp: 30.00,
    sellingPrice: 24.00,
    discountPercent: 20.0,
    stock: 12,
    minStockAlert: 5,
    unit: 'pcs',
    status: 'Active',
    hasVariants: true,
    variants: [
      { id: 'v-2-1', productId: 2, sku: 'EQP-102-WHT', name: 'White / Size 02', attributes: { Color: 'White', Size: '02 (1-4 cups)' }, costPrice: 15.00, mrp: 30.00, sellingPrice: 24.00, stock: 7 },
      { id: 'v-2-2', productId: 2, sku: 'EQP-102-RED', name: 'Red / Size 02', attributes: { Color: 'Red', Size: '02 (1-4 cups)' }, costPrice: 15.00, mrp: 30.00, sellingPrice: 24.00, stock: 5 },
    ],
    description: 'Iconic conical ceramic dripper for clean and balanced extraction.',
    createdAt: '2026-10-02',
  },
  {
    id: 3,
    name: 'Oat Milk Barista Edition',
    sku: 'DRY-201',
    barcode: '890123456703',
    category: 'Dairy & Milks',
    brand: 'Oatly',
    costPrice: 3.50,
    mrp: 6.50,
    sellingPrice: 5.50,
    discountPercent: 15.4,
    stock: 80,
    minStockAlert: 20,
    unit: 'pack',
    status: 'Active',
    hasVariants: false,
    variants: [
      { id: 'v-3-1', productId: 3, sku: 'DRY-201', name: 'Standard (1L)', attributes: { Volume: '1L' }, costPrice: 3.50, mrp: 6.50, sellingPrice: 5.50, stock: 80, minStockAlert: 20 },
    ],
    description: 'Foamable oat drink formulated specifically for coffee latte art.',
    createdAt: '2026-10-03',
  },
  {
    id: 4,
    name: 'Ethiopia Yirgacheffe Beans',
    sku: 'COF-002',
    barcode: '890123456704',
    category: 'Coffee',
    brand: 'Origins Roastery',
    costPrice: 14.00,
    mrp: 26.00,
    sellingPrice: 22.00,
    discountPercent: 15.4,
    stock: 30,
    minStockAlert: 8,
    unit: 'pack',
    status: 'Active',
    hasVariants: false,
    variants: [
      { id: 'v-4-1', productId: 4, sku: 'COF-002', name: '250g Whole Bean', attributes: { Size: '250g' }, costPrice: 14.00, mrp: 26.00, sellingPrice: 22.00, stock: 30, minStockAlert: 8 },
    ],
    description: 'Floral and citrus notes with a bright, tea-like body.',
    createdAt: '2026-10-04',
  },
  {
    id: 5,
    name: 'Digital Precision Coffee Scale',
    sku: 'EQP-105',
    barcode: '890123456705',
    category: 'Equipment',
    brand: 'AeroGrind',
    costPrice: 20.00,
    mrp: 42.00,
    sellingPrice: 35.00,
    discountPercent: 16.7,
    stock: 8,
    minStockAlert: 10,
    unit: 'pcs',
    status: 'Active',
    hasVariants: false,
    variants: [
      { id: 'v-5-1', productId: 5, sku: 'EQP-105', name: 'Standard (0.1g)', attributes: {}, costPrice: 20.00, mrp: 42.00, sellingPrice: 35.00, stock: 8, minStockAlert: 10 },
    ],
    description: 'High precision 0.1g digital scale with integrated brew timer.',
    createdAt: '2026-10-05',
  },
  {
    id: 6,
    name: 'Artisan Flavored Coffee Syrup',
    sku: 'SYR-301',
    barcode: '890123456706',
    category: 'Syrups & Flavors',
    brand: 'Monin',
    costPrice: 7.00,
    mrp: 15.00,
    sellingPrice: 12.50,
    discountPercent: 16.7,
    stock: 35,
    minStockAlert: 12,
    unit: 'bottle',
    status: 'Active',
    hasVariants: true,
    variants: [
      { id: 'v-6-1', productId: 6, sku: 'SYR-301-VAN', name: 'French Vanilla (750ml)', attributes: { Flavor: 'French Vanilla', Volume: '750ml' }, costPrice: 7.00, mrp: 15.00, sellingPrice: 12.50, stock: 15 },
      { id: 'v-6-2', productId: 6, sku: 'SYR-301-CAR', name: 'Salted Caramel (750ml)', attributes: { Flavor: 'Salted Caramel', Volume: '750ml' }, costPrice: 7.00, mrp: 15.00, sellingPrice: 12.50, stock: 12 },
      { id: 'v-6-3', productId: 6, sku: 'SYR-301-HAZ', name: 'Roasted Hazelnut (750ml)', attributes: { Flavor: 'Roasted Hazelnut', Volume: '750ml' }, costPrice: 7.00, mrp: 15.00, sellingPrice: 12.50, stock: 8 },
    ],
    description: 'Premium cane sugar syrups crafted for espresso and cold drinks.',
    createdAt: '2026-10-06',
  },
  {
    id: 7,
    name: 'Canvas Barista Work Apron',
    sku: 'ACC-301',
    barcode: '890123456707',
    category: 'Accessories',
    brand: 'BaristaPro',
    costPrice: 16.00,
    mrp: 35.00,
    sellingPrice: 29.00,
    discountPercent: 17.1,
    stock: 14,
    minStockAlert: 5,
    unit: 'pcs',
    status: 'Active',
    hasVariants: true,
    variants: [
      { id: 'v-7-1', productId: 7, sku: 'ACC-301-M-BLK', name: 'Medium / Black Canvas', attributes: { Size: 'Medium', Color: 'Black' }, costPrice: 16.00, mrp: 35.00, sellingPrice: 29.00, stock: 8 },
      { id: 'v-7-2', productId: 7, sku: 'ACC-301-L-BRN', name: 'Large / Tan Brown', attributes: { Size: 'Large', Color: 'Tan Brown' }, costPrice: 16.00, mrp: 35.00, sellingPrice: 29.00, stock: 6 },
    ],
    description: 'Heavy duty waxed canvas apron with leather cross-back straps.',
    createdAt: '2026-10-07',
  },
  {
    id: 8,
    name: 'Reusable Stainless Steel Filter',
    sku: 'EQP-109',
    barcode: '890123456708',
    category: 'Equipment',
    brand: 'AeroGrind',
    costPrice: 6.50,
    mrp: 16.00,
    sellingPrice: 12.00,
    discountPercent: 25.0,
    stock: 0,
    minStockAlert: 10,
    unit: 'pcs',
    status: 'Out of Stock',
    hasVariants: false,
    variants: [
      { id: 'v-8-1', productId: 8, sku: 'EQP-109', name: 'Standard Cone', attributes: {}, costPrice: 6.50, mrp: 16.00, sellingPrice: 12.00, stock: 0, minStockAlert: 10 },
    ],
    description: 'Eco-friendly ultra-fine mesh filter for rich aromatic oils.',
    createdAt: '2026-10-08',
  }
];
