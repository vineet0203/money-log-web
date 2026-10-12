"use client";

import React, { useState } from 'react';
import { usePosSettings } from './PosSettingsContext';
import { PosGeneralSettings } from './types';
import { 
  Percent, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Check, 
  Save, 
  RotateCcw, 
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TaxPaymentsTab() {
  const { generalSettings, updateGeneralSettings, resetToDefaults } = usePosSettings();
  const [formData, setFormData] = useState<PosGeneralSettings>(generalSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = <K extends keyof PosGeneralSettings>(key: K, value: PosGeneralSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneralSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Section 1: Sales Tax & Currency */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Percent size={14} className="text-[#159A1D]" />
            Taxation & Currency Configuration
          </h4>
          <span className="text-[11px] text-slate-400">Global sales calculations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Default Sales Tax Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.defaultTaxRate}
                onChange={e => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-400">Applied automatically to cart totals.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Currency Symbol</label>
            <input
              type="text"
              maxLength={4}
              value={formData.currencySymbol}
              onChange={e => handleChange('currencySymbol', e.target.value)}
              placeholder="$"
              className="w-full px-3 py-2 text-xs sm:text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 text-center"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Currency Code</label>
            <select
              value={formData.currencyCode}
              onChange={e => handleChange('currencyCode', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div className="sm:col-span-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTaxInclusive}
                onChange={e => handleChange('isTaxInclusive', e.target.checked)}
                className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Tax-Inclusive Product Pricing (MRP / Gross)</span>
                <span className="text-[11px] text-slate-500">
                  When enabled, shelf sticker prices already include tax. When disabled, tax is added at checkout.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Payment Tenders */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#159A1D]" />
            Enabled Payment Tenders at Checkout
          </h4>
          <span className="text-[11px] text-slate-400">Available buttons on register</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
            formData.enableCash
              ? 'border-[#159A1D] bg-emerald-50/30 text-slate-900 shadow-2xs'
              : 'border-slate-200 text-slate-400 hover:border-slate-300'
          }`}>
            <Banknote size={26} className={formData.enableCash ? 'text-[#159A1D]' : 'text-slate-400'} />
            <span className="font-bold text-xs">Cash Payment</span>
            <input
              type="checkbox"
              checked={formData.enableCash}
              onChange={e => handleChange('enableCash', e.target.checked)}
              className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4 mt-1"
            />
          </label>

          <label className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
            formData.enableCard
              ? 'border-[#159A1D] bg-emerald-50/30 text-slate-900 shadow-2xs'
              : 'border-slate-200 text-slate-400 hover:border-slate-300'
          }`}>
            <CreditCard size={26} className={formData.enableCard ? 'text-[#159A1D]' : 'text-slate-400'} />
            <span className="font-bold text-xs">Credit & Debit Cards</span>
            <input
              type="checkbox"
              checked={formData.enableCard}
              onChange={e => handleChange('enableCard', e.target.checked)}
              className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4 mt-1"
            />
          </label>

          <label className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
            formData.enableUpi
              ? 'border-[#159A1D] bg-emerald-50/30 text-slate-900 shadow-2xs'
              : 'border-slate-200 text-slate-400 hover:border-slate-300'
          }`}>
            <Smartphone size={26} className={formData.enableUpi ? 'text-[#159A1D]' : 'text-slate-400'} />
            <span className="font-bold text-xs">UPI QR Code & Mobile</span>
            <input
              type="checkbox"
              checked={formData.enableUpi}
              onChange={e => handleChange('enableUpi', e.target.checked)}
              className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4 mt-1"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Register & Cash Drawer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Store size={14} className="text-[#159A1D]" />
            Register Station & Cash Drawer
          </h4>
          <span className="text-[11px] text-slate-400">Shift reconciliation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Register Station Name</label>
            <input
              type="text"
              value={formData.registerName}
              onChange={e => handleChange('registerName', e.target.value)}
              placeholder="e.g. Front Counter Register #01"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Opening Cash Drawer Float ($)</label>
            <input
              type="number"
              step="10"
              min="0"
              value={formData.cashDrawerFloat}
              onChange={e => handleChange('cashDrawerFloat', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            resetToDefaults();
            setFormData(generalSettings);
          }}
          className="gap-1.5"
        >
          <RotateCcw size={14} />
          Reset Defaults
        </Button>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
              <Check size={15} />
              Settings Saved!
            </span>
          )}
          <Button
            type="submit"
            className="gap-2"
          >
            <Save size={16} />
            Save Tax & Payment Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
