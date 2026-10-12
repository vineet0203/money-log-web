"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { PosSettingsProvider } from './PosSettingsContext';
import { InvoiceReceiptSettingsTab } from './InvoiceReceiptSettingsTab';
import { TaxPaymentsTab } from './TaxPaymentsTab';
import { 
  Receipt, 
  Percent
} from 'lucide-react';

import { PosTabs } from '@/components/pos/common';

export default function PosSettingsManager() {
  const { setHeaderData } = useAppData();
  const [activeTab, setActiveTab] = useState('Invoice & Receipt');

  useEffect(() => {
    setHeaderData(
      "POS Settings", 
      "Configure store branding, invoice & receipt styling, UPI QR codes, tax rates, and checkout parameters.", 
      false
    );
  }, [setHeaderData]);

  const tabs = [
    { id: 'Invoice & Receipt', label: 'Invoice & Receipt', icon: Receipt },
    { id: 'Tax & Payments', label: 'Tax & Payments', icon: Percent },
  ];

  return (
    <PosSettingsProvider>
      <div className="mx-auto space-y-6 pb-12">
        {/* Navigation Tabs Bar */}
        <PosTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Panels */}
        <div>
          {activeTab === 'Invoice & Receipt' && <InvoiceReceiptSettingsTab />}
          {activeTab === 'Tax & Payments' && <TaxPaymentsTab />}
        </div>
      </div>
    </PosSettingsProvider>
  );
}
