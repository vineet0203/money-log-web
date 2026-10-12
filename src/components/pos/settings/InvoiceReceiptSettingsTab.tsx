"use client";

import React, { useState } from 'react';
import { usePosSettings } from './PosSettingsContext';
import { PosReceiptSettings, PaperWidth } from './types';
import { ReceiptPreview } from './ReceiptPreview';
import { 
  Building2, 
  MapPin, 
  QrCode, 
  Image as ImageIcon, 
  FileText, 
  Printer, 
  Save, 
  RotateCcw, 
  Check, 
  Upload, 
  Trash2, 
  Smartphone,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InvoiceReceiptSettingsTab() {
  const { receiptSettings, updateReceiptSettings, resetToDefaults } = usePosSettings();

  // Local draft state for smooth editing and explicit "Save Changes"
  const [formData, setFormData] = useState<PosReceiptSettings>(receiptSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'preview'>('form');

  const handleChange = <K extends keyof PosReceiptSettings>(key: K, value: PosReceiptSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReceiptSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleReset = () => {
    if (confirm('Reset invoice and receipt settings to default configuration?')) {
      resetToDefaults();
      setFormData(receiptSettings);
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

            {/* Section 3: UPI ID & UPI QR Code Configuration */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-[#159A1D]" />
                    UPI Payment & Dynamic QR Code Settings
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

                {/* QR Code Style Selector */}
                <div className="sm:col-span-2 space-y-3 pt-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    QR Code Display Mode
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      onClick={() => handleChange('upiQrType', 'auto')}
                      className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        formData.upiQrType === 'auto'
                          ? 'border-[#159A1D] bg-emerald-50/40 text-slate-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qrType"
                        checked={formData.upiQrType === 'auto'}
                        onChange={() => handleChange('upiQrType', 'auto')}
                        className="mt-1 text-[#159A1D] focus:ring-[#159A1D]"
                      />
                      <div>
                        <span className="font-bold text-xs block">Auto-Generated Dynamic QR</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Renders dynamic QR from your UPI ID automatically on checkout and prints.
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => handleChange('upiQrType', 'custom')}
                      className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        formData.upiQrType === 'custom'
                          ? 'border-[#159A1D] bg-emerald-50/40 text-slate-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qrType"
                        checked={formData.upiQrType === 'custom'}
                        onChange={() => handleChange('upiQrType', 'custom')}
                        className="mt-1 text-[#159A1D] focus:ring-[#159A1D]"
                      />
                      <div>
                        <span className="font-bold text-xs block">Custom Bank Standee QR Image</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload official bank QR standee image provided by your payment provider.
                        </p>
                      </div>
                    </label>
                  </div>

                  {formData.upiQrType === 'custom' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4 mt-2">
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
                            onClick={() => handleChange('upiQrImageUrl', '')}
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
                          PNG or JPG format. Will be resized cleanly for the thermal print layout.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Header, Footer & Policy */}
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Exchange & Return Policy Disclaimer</label>
                  <textarea
                    rows={2}
                    value={formData.returnPolicy}
                    onChange={e => handleChange('returnPolicy', e.target.value)}
                    placeholder="e.g. Exchange within 7 days with original receipt. Consumables are non-refundable."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Formatting & Print Toggles */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Printer size={14} className="text-[#159A1D]" />
                  Thermal Printer & Layout Preferences
                </h4>
                <span className="text-[11px] text-slate-400">Roll width & content toggles</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Default Receipt Roll Width</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['80mm', '58mm', 'A4'] as PaperWidth[]).map(size => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleChange('paperSize', size)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                          formData.paperSize === size
                            ? 'bg-[#159A1D]/10 border-[#159A1D] text-[#159A1D]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {size === '80mm' ? '80mm (Standard POS)' : size === '58mm' ? '58mm (Mobile POS)' : 'A4 (Full Invoice)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.showTaxBreakdown}
                      onChange={e => handleChange('showTaxBreakdown', e.target.checked)}
                      className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Print Tax Breakdown Row</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.showCashierName}
                      onChange={e => handleChange('showCashierName', e.target.checked)}
                      className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Print Cashier / Register ID</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.showCustomerInfo}
                      onChange={e => handleChange('showCustomerInfo', e.target.checked)}
                      className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Print Customer Name</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.autoPrintReceipt}
                      onChange={e => handleChange('autoPrintReceipt', e.target.checked)}
                      className="rounded text-[#159A1D] focus:ring-[#159A1D] h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Auto-Print upon Checkout</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
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
                  Save Receipt Settings
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
