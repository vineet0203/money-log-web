"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import NewSaleTab from './NewSaleTab';
import SalesHistoryTab from './SalesHistoryTab';
import ReturnsTab from './ReturnsTab';
import ExchangesTab from './ExchangesTab';

import { PosTabs } from '@/components/pos/common';
import { ShoppingCart, Receipt, RotateCcw, RefreshCw } from 'lucide-react';

export default function PosSalesManager() {
  const { setHeaderData } = useAppData();
  const [activeTab, setActiveTab] = useState('New Sale');

  useEffect(() => {
    setHeaderData("Sales & Returns");
  }, [setHeaderData]);

  const tabs = [
    { id: 'New Sale', label: 'New Sale', icon: ShoppingCart },
    { id: 'Sales History', label: 'Sales History', icon: Receipt },
    { id: 'Returns & Refunds', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'Exchanges', label: 'Exchanges', icon: RefreshCw },
  ];

  return (
    <div className="mx-auto space-y-6 pb-12">
      {/* Tabs */}
      <PosTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="">
        {activeTab === 'New Sale' && <NewSaleTab />}
        {activeTab === 'Sales History' && <SalesHistoryTab />}
        
        {activeTab === 'Returns & Refunds' && <ReturnsTab />}
        {activeTab === 'Exchanges' && <ExchangesTab />}
      </div>
    </div>
  );
}
