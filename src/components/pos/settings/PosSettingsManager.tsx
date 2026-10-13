"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { PosSettingsProvider } from './PosSettingsContext';
import { InvoiceReceiptSettingsTab } from './InvoiceReceiptSettingsTab';

export default function PosSettingsManager() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData(
      "POS Settings", 
      "Configure store branding, invoice & receipt styling, taxation, currency, and UPI QR codes.", 
      false
    );
  }, [setHeaderData]);

  return (
    <PosSettingsProvider>
      <div className="mx-auto space-y-6 pb-12">
        <InvoiceReceiptSettingsTab />
      </div>
    </PosSettingsProvider>
  );
}
