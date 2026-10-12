import PosProductsManager from '@/components/pos/products/PosProductsManager';

export const metadata = {
  title: 'Products & Categories | MoneyLog POS',
  description: 'Manage store catalog, products, categories, brands, variants, and pricing.',
};

export default function PosProductsPage() {
  return <PosProductsManager />;
}
