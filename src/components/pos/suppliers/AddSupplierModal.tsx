"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Supplier, PaymentTerm } from './types';
import { useSuppliers } from './SuppliersContext';
import { supplierFormSchema } from './schema';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  AlertCircle, 
  Tag, 
  FileText
} from 'lucide-react';
import { Select } from '@/components/pos/common';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export function AddSupplierModal({ isOpen, onClose, supplierToEdit }: AddSupplierModalProps) {
  if (!isOpen) return null;

  return (
    <AddSupplierFormDialog
      isOpen={isOpen}
      onClose={onClose}
      supplierToEdit={supplierToEdit}
      key={supplierToEdit ? `edit-${supplierToEdit.id}` : 'new-supplier'}
    />
  );
}

const AVAILABLE_CATEGORIES = [
  'Coffee',
  'Dairy & Milks',
  'Syrups & Flavors',
  'Equipment',
  'Packaging',
  'Bakery & Pastries',
  'Maintenance',
  'Teas & Beverages'
];

const PAYMENT_TERMS_OPTIONS: PaymentTerm[] = [
  'Due on Receipt',
  'Net 15',
  'Net 30',
  'Net 60',
  'Cash on Delivery'
];

function AddSupplierFormDialog({
  isOpen,
  onClose,
  supplierToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}) {
  const { addSupplier, updateSupplier } = useSuppliers();

  const [name, setName] = useState(supplierToEdit?.name || '');
  const [code, setCode] = useState(supplierToEdit?.code || '');
  const [contactPerson, setContactPerson] = useState(supplierToEdit?.contactPerson || '');
  const [email, setEmail] = useState(supplierToEdit?.email || '');
  const [phone, setPhone] = useState(supplierToEdit?.phone || '');
  const [address, setAddress] = useState(supplierToEdit?.address || '');
  const [city, setCity] = useState(supplierToEdit?.city || '');
  const [gstTaxNumber, setGstTaxNumber] = useState(supplierToEdit?.gstTaxNumber || '');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>(supplierToEdit?.paymentTerms || 'Net 30');
  const [bankName, setBankName] = useState(supplierToEdit?.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(supplierToEdit?.bankDetails?.accountNumber || '');
  const [ifscOrSwift, setIfscOrSwift] = useState(supplierToEdit?.bankDetails?.ifscOrSwift || '');
  const [upiId, setUpiId] = useState(supplierToEdit?.bankDetails?.upiId || '');
  const [categoriesSupplied, setCategoriesSupplied] = useState<string[]>(
    supplierToEdit?.categoriesSupplied || ['Coffee']
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>(supplierToEdit?.status || 'Active');
  const [notes, setNotes] = useState(supplierToEdit?.notes || '');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (cat: string) => {
    if (categoriesSupplied.includes(cat)) {
      if (categoriesSupplied.length > 1) {
        setCategoriesSupplied(categoriesSupplied.filter(c => c !== cat));
      }
    } else {
      setCategoriesSupplied([...categoriesSupplied, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const formData = {
      name,
      code,
      contactPerson,
      email,
      phone,
      address,
      city,
      gstTaxNumber,
      paymentTerms,
      bankName,
      accountNumber,
      ifscOrSwift,
      upiId,
      categoriesSupplied,
      status,
      notes,
    };

    const result = supplierFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (supplierToEdit) {
        updateSupplier(supplierToEdit.id, {
          name: result.data.name,
          code: result.data.code.toUpperCase(),
          contactPerson: result.data.contactPerson,
          email: result.data.email,
          phone: result.data.phone,
          address: result.data.address,
          city: result.data.city,
          gstTaxNumber: result.data.gstTaxNumber,
          paymentTerms: result.data.paymentTerms,
          bankDetails: {
            bankName: result.data.bankName,
            accountNumber: result.data.accountNumber,
            ifscOrSwift: result.data.ifscOrSwift,
            upiId: result.data.upiId || undefined,
          },
          categoriesSupplied: result.data.categoriesSupplied,
          status: result.data.status,
          notes: result.data.notes,
        });
      } else {
        addSupplier(result.data);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {
        const form = document.getElementById('supplier-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }}
      title={supplierToEdit ? 'Edit Supplier' : 'Add New Supplier'}
      description="Enter vendor credentials, settlement payment terms, and banking coordinates."
      submitText={isSubmitting ? 'Saving...' : supplierToEdit ? 'Save Changes' : 'Create Supplier'}
      maxWidth="max-w-3xl"
    >
      <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6 max-h-[72vh] overflow-y-auto px-1 pr-2">
        {/* Error notification banner */}
        {Object.keys(formErrors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please fix the highlighted errors before saving:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-600">
                {Object.values(formErrors).slice(0, 3).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Section 1: Business Identity */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Building2 size={14} className="text-[#159A1D]" />
            Business & Company Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Supplier / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Origins Specialty Roasters"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.name && <p className="text-xs text-rose-500">{formErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Supplier Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. SUP-007"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.code && <p className="text-xs text-rose-500">{formErrors.code}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Contact Representative <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.contactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.contactPerson && <p className="text-xs text-rose-500">{formErrors.contactPerson}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="orders@vendor.com"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                    formErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {formErrors.email && <p className="text-xs text-rose-500">{formErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                    formErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {formErrors.phone && <p className="text-xs text-rose-500">{formErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Address & Tax Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#159A1D]" />
            Location & Tax Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Suite, Street, Industrial Area"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.address && <p className="text-xs text-rose-500">{formErrors.address}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                City / State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Seattle, WA"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.city && <p className="text-xs text-rose-500">{formErrors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tax / GST Registration No</label>
              <input
                type="text"
                value={gstTaxNumber}
                onChange={e => setGstTaxNumber(e.target.value)}
                placeholder="e.g. 29AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
            </div>

            <div>
              <Select
                label="Default Payment Terms"
                value={paymentTerms}
                onChange={val => setPaymentTerms(val as PaymentTerm)}
                options={PAYMENT_TERMS_OPTIONS.map(term => ({ value: term, label: term }))}
              />
            </div>

            <div>
              <Select
                label="Status"
                value={status}
                onChange={val => setStatus(val as 'Active' | 'Inactive')}
                options={[
                  { value: 'Active', label: 'Active Vendor' },
                  { value: 'Inactive', label: 'Inactive / Suspended' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Categories Supplied */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Tag size={14} className="text-[#159A1D]" />
            Supplied Catalog Categories <span className="text-rose-500">*</span>
          </h4>
          <p className="text-xs text-slate-400 mb-3">Select the product lines this supplier distributes.</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CATEGORIES.map(cat => {
              const isSelected = categoriesSupplied.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#159A1D]/10 text-[#159A1D] border-[#159A1D] font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {formErrors.categoriesSupplied && (
            <p className="text-xs text-rose-500 mt-1">{formErrors.categoriesSupplied}</p>
          )}
        </div>

        {/* Section 4: Bank & Settlement Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#159A1D]" />
            Bank & Remittance Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="e.g. JPMorgan Chase / SVB"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.bankName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.bankName && <p className="text-xs text-rose-500">{formErrors.bankName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="e.g. 9988210492"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.accountNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.accountNumber && <p className="text-xs text-rose-500">{formErrors.accountNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                IFSC / SWIFT / Routing Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={ifscOrSwift}
                onChange={e => setIfscOrSwift(e.target.value)}
                placeholder="e.g. CHASUS33"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 ${
                  formErrors.ifscOrSwift ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.ifscOrSwift && <p className="text-xs text-rose-500">{formErrors.ifscOrSwift}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">UPI ID / Virtual Payment Address (Optional)</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. vendor@bank"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Notes & Terms */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText size={14} className="text-[#159A1D]" />
            Internal Notes & Procurement Terms
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Delivery windows, minimum order quantity rules, or special contract clauses..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
          />
        </div>
      </form>
    </Modal>
  );
}
