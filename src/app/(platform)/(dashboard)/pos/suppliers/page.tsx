import PosSuppliersManager from '@/components/pos/suppliers/PosSuppliersManager';

export const metadata = {
  title: 'Suppliers & Purchases | MoneyLog POS',
  description: 'Manage suppliers, purchase orders, goods receiving (GRN), and vendor payments.',
};

export default function PosSuppliersPage() {
  return <PosSuppliersManager />;
}
