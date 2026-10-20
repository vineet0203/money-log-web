"use client";

import React, { useState } from 'react';
import { usePosSettings } from './PosSettingsContext';
import { ReceiptPreview } from './ReceiptPreview';
import { 
  Building2, 
  MapPin, 
  QrCode, 
  Image as ImageIcon, 
  FileText, 
  Save, 
  RotateCcw, 
  Check, 
  Upload, 
  Trash2, 
  Smartphone,
  Eye,
  Percent,
  Plus,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PosReceiptSettings, PosTaxRate, DEFAULT_RECEIPT_SETTINGS } from './types';
import { useGetProfile } from '@/hooks/queries/user';

export function InvoiceReceiptSettingsTab() {
  const { receiptSettings, saveSettings, resetToDefaults, isSaving, isLoading } = usePosSettings();
  const { data: profile } = useGetProfile();
  const currentUserName = profile?.name?.trim() || profile?.email || '';

  // Local draft state for smooth editing and explicit "Save Changes"
  const [formData, setFormData] = useState<PosReceiptSettings>(receiptSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'preview'>('form');

  // Synchronize draft form when settings load or update from server
  React.useEffect(() => {
    setFormData(receiptSettings);
  }, [receiptSettings]);

  const handleChange = <K extends keyof PosReceiptSettings>(key: K, value: PosReceiptSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddTax = () => {
    const newTax: PosTaxRate = {
      id: `tax-${Date.now()}`,
      name: '',
      percentage: 5.0,
    };
    setFormData(prev => ({
      ...prev,
      taxes: [...(prev.taxes || []), newTax],
    }));
  };

  const handleUpdateTax = (id: string, field: 'name' | 'percentage', value: any) => {
    setFormData(prev => ({
      ...prev,
      taxes: (prev.taxes || []).map(t => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  };

  const handleRemoveTax = (id: string) => {
    setFormData(prev => ({
      ...prev,
      taxes: (prev.taxes || []).filter(t => t.id !== id),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleChange('storeLogoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleChange('upiQrImageUrl', reader.result);
          handleChange('upiQrType', 'custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await saveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || err?.message || 'Failed to save settings');
    }
  };

  const handleReset = async () => {
    if (confirm('Reset invoice, receipt, and tax settings to default configuration?')) {
      await resetToDefaults();
      setFormData(DEFAULT_RECEIPT_SETTINGS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Toggle for Form vs Live Preview */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActivePreviewTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activePreviewTab === 'form'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Configuration Form
        </button>
        <button
          type="button"
          onClick={() => setActivePreviewTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePreviewTab === 'preview'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Eye size={14} />
          Live Receipt Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Settings (7 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${activePreviewTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Store Branding & Logo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#159A1D]" />
                  Store Identity & Receipt Branding
                </h4>
                <span className="text-[11px] text-slate-400">Header info on receipts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Store / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={e => handleChange('storeName', e.target.value)}
                    placeholder="e.g. MONEY LOG POS & ROASTERY"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tagline / Sub-heading</label>
                  <input
                    type="text"
                    value={formData.storeTagline}
                    onChange={e => handleChange('storeTagline', e.target.value)}
                    placeholder="e.g. Retail & Specialty Coffee"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Logo Monogram Initial</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.storeLogoInitial}
                    onChange={e => handleChange('storeLogoInitial', e.target.value.toUpperCase())}
                    placeholder="M"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 font-bold text-center"
                  />
                </div>

                {/* Logo Image Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Store Logo (Optional Custom Image)</span>
                    <span className="text-[10px] text-slate-400 font-normal">PNG or JPG, max 1MB</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {formData.storeLogoUrl ? (
                      <div className="relative group bg-white p-2 border border-slate-200 rounded-lg shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={formData.storeLogoUrl} 
                          alt="Logo Preview" 
                          className="h-10 w-24 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('storeLogoUrl', '')}
                          title="Remove custom logo"
                          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-colors shadow-xs"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-10 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-white shrink-0">
                        <ImageIcon size={18} />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-2xs">
                        <Upload size={13} />
                        <span>{formData.storeLogoUrl ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-500 mt-1">
                        If no image is uploaded, the monogram letter badge &quot;{formData.storeLogoInitial || 'M'}&quot; will be printed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cashier / Operator Name */}
                <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <User size={13} className="text-[#159A1D]" />
                      Default Cashier / Operator Name
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={formData.showCashierName !== false}
                        onChange={e => handleChange('showCashierName', e.target.checked)}
                        className="rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]"
                      />
                      <span>Show Cashier on receipt</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.cashierName || ''}
                    onChange={e => handleChange('cashierName', e.target.value)}
                    placeholder={currentUserName ? `Default: ${currentUserName} (Current User)` : 'e.g. John Doe (Leave empty to use current user)'}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 font-medium"
                  />
                  <p className="text-[11px] text-slate-400">
                    Printed on receipts under &quot;Cashier:&quot;. If left blank, your logged-in profile name ({currentUserName || 'current user'}) will be used automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Contact */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#159A1D]" />
                  Store Location & Coordinates
                </h4>
                <span className="text-[11px] text-slate-400">Printed below store header</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Street Address (Line 1)</label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={e => handleChange('addressLine1', e.target.value)}
                    placeholder="e.g. 44 Industrial Parkway, Suite 100"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={e => handleChange('addressLine2', e.target.value)}
                    placeholder="e.g. Market District"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    placeholder="e.g. Seattle"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">State / Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => handleChange('state', e.target.value)}
                    placeholder="e.g. WA"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Postal / Zip Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={e => handleChange('postalCode', e.target.value)}
                    placeholder="e.g. 98101"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="e.g. +1 (555) 234-8901"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="store@moneylogpos.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tax / GST Registration No</label>
                  <input
                    type="text"
                    value={formData.gstTaxNumber}
                    onChange={e => handleChange('gstTaxNumber', e.target.value)}
                    placeholder="e.g. US-WA-8839210"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Taxation Configuration */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Percent size={14} className="text-[#159A1D]" />
                    Taxation Configuration
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure one or multiple tax rates calculated on invoices and printed receipts (Currency: USD $).
                  </p>
                </div>
              </div>

              {/* Tax Rates (Array of Name and Percentage) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block">
                      Applicable Tax Rates ({formData.taxes?.length || 0})
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Configure one or multiple taxes (e.g. Sales Tax, GST, CGST, SGST, VAT)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTax}
                    className="text-xs font-bold text-[#159A1D] hover:text-[#128218] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Plus size={14} /> Add Tax Type
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.taxes || []).map((tax, index) => (
                    <div key={tax.id || index} className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Tax Name</span>
                        <input
                          type="text"
                          value={tax.name}
                          onChange={e => handleUpdateTax(tax.id, 'name', e.target.value)}
                          placeholder="e.g. Sales Tax, GST, CGST"
                          className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                        />
                      </div>

                      <div className="w-28 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Rate (%)</span>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={tax.percentage}
                            onChange={e => handleUpdateTax(tax.id, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 pr-6"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      {(formData.taxes?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTax(tax.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-4"
                          title="Remove tax"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTaxInclusive}
                    onChange={e => handleChange('isTaxInclusive', e.target.checked)}
                    className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Tax-Inclusive Pricing (MRP / Gross)</span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, product sticker prices already include tax. When disabled, tax is calculated on top at checkout.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 4: UPI ID & UPI QR Code Configuration */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-[#159A1D]" />
                    UPI Payment & QR Code Settings
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Displayed during checkout and printed directly on customer receipts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showUpiQrOnReceipt}
                      onChange={e => handleChange('showUpiQrOnReceipt', e.target.checked)}
                      className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                    />
                    <span>Show on Receipt</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    UPI ID / VPA <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={e => handleChange('upiId', e.target.value)}
                    placeholder="e.g. moneylogpos@okaxis"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                  <p className="text-[10px] text-slate-400">
                    Supports Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    UPI Payee / Merchant Name
                  </label>
                  <input
                    type="text"
                    value={formData.upiPayeeName}
                    onChange={e => handleChange('upiPayeeName', e.target.value)}
                    placeholder="e.g. MoneyLog Retail Store"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                  <p className="text-[10px] text-slate-400">
                    Name displayed on customer&apos;s UPI mobile app when scanning.
                  </p>
                </div>

                {/* QR Code Upload Only */}
                <div className="sm:col-span-2 space-y-2 pt-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Bank Standee QR Code Image
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                    {formData.upiQrImageUrl ? (
                      <div className="relative group bg-white p-1 border border-slate-200 rounded-lg shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={formData.upiQrImageUrl} 
                          alt="Custom QR Preview" 
                          className="w-14 h-14 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('upiQrImageUrl', '');
                          }}
                          title="Remove custom QR"
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-0.5 rounded-full hover:bg-rose-600 transition-colors shadow-xs"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-white shrink-0">
                        <QrCode size={22} />
                      </div>
                    )}

                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-2xs">
                        <Upload size={13} />
                        <span>{formData.upiQrImageUrl ? 'Change QR Image' : 'Upload Bank QR Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomQrUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        PNG or JPG format. Upload official bank QR standee image provided by your payment provider.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Header, Footer & Policy */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText size={14} className="text-[#159A1D]" />
                  Receipt Header & Footer Content
                </h4>
                <span className="text-[11px] text-slate-400">Customer disclaimers</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Header Tagline / Guarantee</label>
                  <input
                    type="text"
                    value={formData.receiptHeaderNote}
                    onChange={e => handleChange('receiptHeaderNote', e.target.value)}
                    placeholder="e.g. Quality & Freshness Guaranteed"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Footer Gratitude Note</label>
                  <input
                    type="text"
                    value={formData.receiptFooterNote}
                    onChange={e => handleChange('receiptFooterNote', e.target.value)}
                    placeholder="e.g. Thank you for your purchase! Please visit again."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>

                {/* Return & Exchange Window Configuration */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <RotateCcw size={14} className="text-[#159A1D]" />
                        Return & Exchange Window (Days)
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Orders can only be returned or exchanged within this period from the purchase date.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={365}
                        value={formData.returnWindowDays ?? 14}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          handleChange('returnWindowDays', val);
                          if (val > 0) {
                            handleChange('returnPolicy', `Returns accepted within ${val} days with original receipt.`);
                          } else {
                            handleChange('returnPolicy', 'All sales are final. No returns or exchanges.');
                          }
                        }}
                        className="w-16 px-2.5 py-1 text-center font-bold font-mono text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#159A1D]"
                      />
                      <span className="text-xs font-semibold text-slate-600">Days</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80 flex-wrap">
                    <span className="text-[10.5px] font-medium text-slate-400">Presets:</span>
                    {[7, 14, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          handleChange('returnWindowDays', days);
                          handleChange('returnPolicy', `Returns accepted within ${days} days with original receipt.`);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                          formData.returnWindowDays === days
                            ? 'bg-[#159A1D] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('returnWindowDays', 0);
                        handleChange('returnPolicy', 'All sales are final. No returns or exchanges.');
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                        formData.returnWindowDays === 0
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      No Returns
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Exchange & Return Policy Disclaimer</label>
                    <span className="text-[10.5px] text-slate-400">Printed on receipt footer</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.returnPolicy}
                    onChange={e => handleChange('returnPolicy', e.target.value)}
                    placeholder="e.g. Returns accepted within 14 days with original receipt."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>
              </div>
            </div>

            {/* Save Error Alert */}
            {saveError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between">
                <span>{saveError}</span>
                <button
                  type="button"
                  onClick={() => setSaveError(null)}
                  className="text-rose-500 hover:text-rose-700 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleReset}
                  className="gap-1.5"
                >
                  <RotateCcw size={14} />
                  Reset Defaults
                </Button>

                {isLoading && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#159A1D]" />
                    Syncing with server...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <Check size={15} />
                    Settings Saved!
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Thermal Receipt Preview (5 cols) */}
        <div className={`lg:col-span-5 sticky top-6 ${activePreviewTab === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye size={14} className="text-[#159A1D]" />
                  Live Real-Time Receipt Preview
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual layout generated on customer thermal slips & UPI checkout.
                </p>
              </div>
            </div>

            <ReceiptPreview 
              settings={formData} 
              mode="interactive"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
