import PosReportsManager from '@/components/pos/reports/PosReportsManager';

export const metadata = {
  title: 'POS Reports | MoneyLog POS',
  description: 'Owner and manager insights for sales summary, product sales, margins, inventory valuation, cash registers, and purchases.',
};

export default function PosReportsPage() {
  return <PosReportsManager />;
}
