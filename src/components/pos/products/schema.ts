import { z } from 'zod';

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Variant name is required'),
  sku: z.string().trim().min(1, 'Variant SKU is required'),
  barcode: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  mrp: z.coerce.number().min(0, 'MRP cannot be negative'),
  sellingPrice: z.coerce.number().gt(0, 'Selling price must be greater than $0'),
  stock: z.coerce.number().int('Stock count must be an integer').min(0, 'Stock count cannot be negative'),
  minStockAlert: z.coerce.number().int('Alert threshold must be an integer').min(0, 'Alert threshold cannot be negative').default(5),
  attributes: z.record(z.string(), z.string()).optional(),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  brand: z.string().trim().min(1, 'Brand is required'),
  unit: z.string().trim().default('pcs').optional(),
  status: z.enum(['Active', 'Draft', 'Out of Stock']),
  description: z.string().trim().optional(),
  variants: z
    .array(variantSchema)
    .min(1, 'Product must have at least one variant'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
