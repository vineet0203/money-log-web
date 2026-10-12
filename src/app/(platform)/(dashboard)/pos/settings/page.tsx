import PosSettingsManager from '@/components/pos/settings/PosSettingsManager';

export const metadata = {
  title: 'POS Settings | MoneyLog POS',
  description: 'Configure store name, receipt branding, UPI QR codes, tax rates, and checkout settings.',
};

export default function PosSettingsPage() {
  return <PosSettingsManager />;
}
