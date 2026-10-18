"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { SuppliersProvider } from './SuppliersContext';
import { SuppliersTab } from './SuppliersTab';
import { AllPurchasesTab } from './AllPurchasesTab';
import { CreatePurchaseTab } from './CreatePurchaseTab';
import { PurchaseOrdersTab } from './PurchaseOrdersTab';
import { GoodsReceivingTab } from './GoodsReceivingTab';
import { SupplierPaymentsTab } from './SupplierPaymentsTab';
import { 
  Building2, 
  Receipt, 
  PlusCircle, 
  ShoppingBag, 
  Truck, 
  CreditCard 
} from 'lucide-react';

import { PosTabs } from '@/components/pos/common';
import { useQueryTab } from '@/hooks/useQueryTab';

export default function PosSuppliersManager() {
  const { setHeaderData } = useAppData();
  const [activeTab, setActiveTab] = useQueryTab<string>('tab', 'Suppliers', [
    'Suppliers',
    'All Purchases',
    'Create Purchase',
    'Purchase Orders',
    'Goods Receiving',
    'Supplier Payments',
  ]);

  // Inter-tab parameter state
  const [targetSupplierId, setTargetSupplierId] = useState<string | undefined>(undefined);
  const [targetBillNumber, setTargetBillNumber] = useState<string | undefined>(undefined);
  const [targetPoNumber, setTargetPoNumber] = useState<string | undefined>(undefined);

  useEffect(() => {
    setHeaderData(
      "Suppliers & Purchases", 
      "Replenish inventory catalog, track vendor purchase orders, receive consignments, and manage payables.", 
      false
    );
  }, [setHeaderData]);

  const tabs = [
    { id: 'Suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'All Purchases', label: 'All Purchases', icon: Receipt },
    { id: 'Create Purchase', label: 'Create Purchase', icon: PlusCircle },
    { id: 'Purchase Orders', label: 'Purchase Orders', icon: ShoppingBag },
    { id: 'Goods Receiving', label: 'Goods Receiving', icon: Truck },
    { id: 'Supplier Payments', label: 'Supplier Payments', icon: CreditCard },
  ];

  const handleNavigateToCreatePurchase = (supplierId?: string) => {
    setTargetSupplierId(supplierId);
    setActiveTab('Create Purchase');
  };

  const handleNavigateToRecordPayment = (supplierId?: string, billNumber?: string) => {
    setTargetSupplierId(supplierId);
    setTargetBillNumber(billNumber);
    setActiveTab('Supplier Payments');
  };

  const handleNavigateToReceiveGoods = (poNumber: string) => {
    setTargetPoNumber(poNumber);
    setActiveTab('Goods Receiving');
  };

  return (
    <SuppliersProvider>
      <div className="mx-auto space-y-6 pb-12">
        {/* Navigation Tabs Bar */}
        <PosTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId);
            if (tabId !== 'Create Purchase') setTargetSupplierId(undefined);
            if (tabId !== 'Supplier Payments') setTargetBillNumber(undefined);
            if (tabId !== 'Goods Receiving') setTargetPoNumber(undefined);
          }}
        />

        {/* Tab Content Panels */}
        <div>
          {activeTab === 'Suppliers' && (
            <SuppliersTab
              onNavigateToCreatePurchase={handleNavigateToCreatePurchase}
              onNavigateToRecordPayment={handleNavigateToRecordPayment}
            />
          )}

          {activeTab === 'All Purchases' && (
            <AllPurchasesTab
              onNavigateToCreatePurchase={() => handleNavigateToCreatePurchase()}
              onNavigateToRecordPayment={handleNavigateToRecordPayment}
            />
          )}

          {activeTab === 'Create Purchase' && (
            <CreatePurchaseTab
              key={`create-${targetSupplierId || 'all'}`}
              initialSupplierId={targetSupplierId}
              onSuccessNavigate={(nextTab) => setActiveTab(nextTab)}
            />
          )}

          {activeTab === 'Purchase Orders' && (
            <PurchaseOrdersTab
              onNavigateToCreatePurchase={() => handleNavigateToCreatePurchase()}
              onNavigateToReceiveGoods={handleNavigateToReceiveGoods}
            />
          )}

          {activeTab === 'Goods Receiving' && (
            <GoodsReceivingTab
              key={`grn-${targetPoNumber || 'default'}`}
              initialPoNumber={targetPoNumber}
            />
          )}

          {activeTab === 'Supplier Payments' && (
            <SupplierPaymentsTab
              key={`pay-${targetSupplierId || 'all'}-${targetBillNumber || 'none'}`}
              initialSupplierId={targetSupplierId}
              initialBillNumber={targetBillNumber}
            />
          )}
        </div>
      </div>
    </SuppliersProvider>
  );
}
