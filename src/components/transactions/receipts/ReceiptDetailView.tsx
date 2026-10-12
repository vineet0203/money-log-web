"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { mockReceipts } from './ReceiptsList';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetCategories } from '@/hooks/queries/categories';

export default function ReceiptDetailView({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  const { data: categories = [] } = useGetCategories();
  
  // Simulated fetch
  const receiptData = mockReceipts.find(r => r.id === receiptId);
  const [receipt, setReceipt] = useState(receiptData);
  const [isEditing, setIsEditing] = useState(receipt?.status === 'needs_review');

  useEffect(() => {
    if (isEditing) {
      setHeaderData("Verify Receipt Details", `Receipt ID: ${receiptId}`, true);
    } else {
      setHeaderData("Receipt Details", `Receipt ID: ${receiptId}`, true);
    }
  }, [isEditing, receiptId, setHeaderData]);

  // Use the receipt data directly if not editing, otherwise use edit form state
  const [editForm, setEditForm] = useState({
    merchant: receipt?.merchant || '',
    date: receipt?.date || '',
    category: receipt?.category || '',
    tax: receipt?.tax || 0,
    total: receipt?.total || 0,
    receiptNumber: receipt?.receiptNumber || '',
    paymentAccount: receipt?.paymentAccount || 'cash',
    tip: receipt?.tip || 0,
    returnDeadline: receipt?.returnDeadline || '',
    warrantyDate: receipt?.warrantyDate || '',
    isReimbursable: receipt?.isReimbursable || false,
    notes: receipt?.notes || ''
  });

  if (!receipt) {
    return (
      <div className="p-6 text-center text-slate-500">
        Receipt not found.
      </div>
    );
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setReceipt({ ...receipt, ...editForm, status: 'verified' });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Image Preview */}
          <div className="w-full md:w-1/2 p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img 
                src={receipt.imageUrl} 
                alt="Receipt" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Details / Edit Form */}
          <div className="w-full md:w-1/2 flex flex-col md:max-h-[800px] min-h-0">
            <form onSubmit={handleConfirm} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input 
                      label="Merchant Name"
                      type="text" 
                      value={editForm.merchant} 
                      onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                      readOnly={!isEditing}
                      className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                    />
                  </div>
                  <div>
                    <DatePicker 
                      label="Date"
                      value={editForm.date} 
                      onChange={(date) => setEditForm({...editForm, date})}
                      className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Receipt Number"
                      type="text" 
                      value={editForm.receiptNumber}
                      onChange={(e) => setEditForm({...editForm, receiptNumber: e.target.value})}
                      readOnly={!isEditing}
                      placeholder="e.g. 12345-678"
                      className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                    />
                  </div>
                  <div>
                    <Select 
                      label="Category"
                      value={editForm.category} 
                      onChange={(val) => setEditForm({...editForm, category: val})}
                      className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                      options={categories.map(c => ({ value: c.name, label: c.name }))}
                    />
                  </div>
                  <div>
                    <Select 
                      label="Payment Account"
                      value={editForm.paymentAccount}
                      onChange={(val) => setEditForm({...editForm, paymentAccount: val})}
                      className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                      options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'chase', label: 'Chase Sapphire' },
                        { value: 'bofa', label: 'Bank of America' }
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-900 mb-2">Extracted Items</label>
                  <div className="space-y-3">
                    {receipt.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <input type="text" defaultValue={item.description} readOnly={!isEditing} className={`flex-1 bg-transparent text-sm text-slate-900 outline-none font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                        <span className="text-sm text-[#849AB4] w-8 text-right">x{item.quantity}</span>
                        <span className="text-sm text-slate-900 font-bold w-16 text-right">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 md:w-2/3 ml-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#849AB4]">Subtotal</label>
                    <div className="relative w-32 md:w-40">
                      <span className="absolute left-3 top-2.5 text-[#849AB4] font-medium text-sm">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={(editForm.total - editForm.tax - (editForm.tip || 0)).toFixed(2)}
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg pl-6 pr-3 py-2 focus:outline-none shadow-sm text-sm text-right font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#849AB4]">Tax</label>
                    <div className="relative w-32 md:w-40">
                      <span className="absolute left-3 top-2.5 text-[#849AB4] font-medium text-sm">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.tax} 
                        onChange={(e) => setEditForm({...editForm, tax: parseFloat(e.target.value)})}
                        readOnly={!isEditing}
                        className={`w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-[#159A1D] transition-all shadow-sm text-sm text-right font-medium ${!isEditing ? 'opacity-80 bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#849AB4]">Tip</label>
                    <div className="relative w-32 md:w-40">
                      <span className="absolute left-3 top-2.5 text-[#849AB4] font-medium text-sm">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.tip || 0}
                        onChange={(e) => setEditForm({...editForm, tip: parseFloat(e.target.value)})}
                        readOnly={!isEditing}
                        className={`w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-[#159A1D] transition-all shadow-sm text-sm text-right font-medium ${!isEditing ? 'opacity-80 bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <label className="text-base font-bold text-slate-900">Total Amount</label>
                    <div className="relative w-32 md:w-40">
                      <span className="absolute left-3 top-2.5 text-[#849AB4] font-medium text-sm">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.total} 
                        onChange={(e) => setEditForm({...editForm, total: parseFloat(e.target.value)})}
                        readOnly={!isEditing}
                        className={`w-full bg-white border border-slate-200 text-[#159A1D] font-bold rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-[#159A1D] transition-all shadow-sm text-base text-right ${!isEditing ? 'opacity-80 bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <DatePicker 
                        label="Return Deadline"
                        value={editForm.returnDeadline}
                        onChange={(date) => setEditForm({...editForm, returnDeadline: date})} 
                        className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                      />
                    </div>
                    <div>
                      <DatePicker 
                        label="Warranty Date"
                        value={editForm.warrantyDate}
                        onChange={(date) => setEditForm({...editForm, warrantyDate: date})} 
                        className={!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none' : ''}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <input 
                        type="checkbox" 
                        id="reimbursable_edit"
                        checked={editForm.isReimbursable}
                        onChange={(e) => setEditForm({...editForm, isReimbursable: e.target.checked})}
                        disabled={!isEditing} 
                        className="w-5 h-5 rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]" 
                      />
                      <label htmlFor="reimbursable_edit" className={`text-sm font-bold text-slate-900 ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                        Mark as Reimbursable (Business Expense)
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#4F627A] mb-1.5">Notes</label>
                      <textarea 
                        rows={3}
                        value={editForm.notes}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        readOnly={!isEditing}
                        placeholder="Add any extra details or comments..."
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-slate-900 placeholder:text-slate-400 resize-none custom-scrollbar ${!isEditing ? 'opacity-80 bg-slate-50 pointer-events-none border-slate-200' : 'border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0 rounded-br-2xl">
                {isEditing ? (
                  <>
                    <Button variant="secondary" type="button" onClick={() => receipt.status === 'verified' ? setIsEditing(false) : router.push('/transactions/receipts')}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2">
                      <CheckCircle size={18} />
                      Confirm & Save
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" type="button" onClick={() => router.push('/transactions/receipts')} className="gap-2">
                    <ArrowLeft size={18} />
                    Back to List
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
