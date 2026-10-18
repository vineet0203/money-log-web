"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { ProductsProvider } from './ProductsContext';
import { AllProductsTab } from './AllProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { BrandsTab } from './BrandsTab';
import { ImportExportTab } from './ImportExportTab';
import { 
  Package, 
  Tag, 
  Award, 
  ArrowUpDown 
} from 'lucide-react';

import { PosTabs } from '@/components/pos/common';
import { useQueryTab } from '@/hooks/useQueryTab';

export default function PosProductsManager() {
  const { setHeaderData } = useAppData();
  const [activeTab, setActiveTab] = useQueryTab<string>('tab', 'All Products', [
    'All Products',
    'Categories',
    'Brands',
    'Import / Export'
  ]);

  useEffect(() => {
    setHeaderData("Products & Categories", "Create and maintain your store catalog, pricing, and variants.", false);
  }, [setHeaderData]);

  const tabs = [
    { id: 'All Products', label: 'All Products', icon: Package },
    { id: 'Categories', label: 'Categories', icon: Tag },
    { id: 'Brands', label: 'Brands', icon: Award },
    { id: 'Import / Export', label: 'Import / Export', icon: ArrowUpDown },
  ];

  return (
    <ProductsProvider>
      <div className="mx-auto space-y-6 pb-12">
        {/* Navigation Tabs Bar */}
        <PosTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content Panels */}
        <div>
          {activeTab === 'All Products' && (
            <AllProductsTab />
          )}
          {activeTab === 'Categories' && <CategoriesTab />}
          {activeTab === 'Brands' && <BrandsTab />}
          {activeTab === 'Import / Export' && (
            <ImportExportTab onImportComplete={() => setActiveTab('All Products')} />
          )}
        </div>
      </div>
    </ProductsProvider>
  );
}
