"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetSubscriptionDetails } from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { useCreateTransaction } from '@/hooks/queries/transactions';
import { Camera, ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSnackbar } from 'notistack';

// Helper to render dynamic icon
const DynamicIcon = ({ name, size = 18, color = "currentColor" }: { name: string, size?: number, color?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
};

export default function SubscriptionPaymentPage() {
  const { setHeaderData } = useAppData();
  const params = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  const id = params?.id as string;
  const { data: subData, isLoading: subLoading } = useGetSubscriptionDetails(id);
  const { data: categories } = useGetCategories();
  const createTxMutation = useCreateTransaction();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    setHeaderData("Make Payment", "Record a manual payment for this subscription.", true);
  }, [setHeaderData]);

  // Pre-fill form when subscription data loads
  useEffect(() => {
    if (subData?.subscription && !title) {
      setTitle(subData.subscription.name);
      setCategoryId(subData.subscription.category_id);
      setDescription(`Manual payment for ${subData.subscription.name}`);
    }
  }, [subData, title]);

  if (subLoading) {
    return <div className="p-8 text-center text-slate-500">Loading subscription details...</div>;
  }

  if (!subData?.subscription) {
    return <div className="p-8 text-center text-red-500">Subscription not found.</div>;
  }

  const { subscription } = subData;
  const amountStr = parseFloat(subscription.amount).toFixed(2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('amount', subscription.amount); // use exact amount from sub
    formData.append('type', type);
    // current date YYYY-MM-DD
    formData.append('date', new Date().toISOString().split('T')[0]);
    if (categoryId) formData.append('category_id', categoryId.toString());
    if (description) formData.append('description', description);
    formData.append('subscription_id', subscription.id.toString());
    
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    createTxMutation.mutate(formData, {
      onSuccess: () => {
        enqueueSnackbar('Payment recorded successfully!', { variant: 'success' });
        router.replace(`/subscriptions/${id}`);
      },
      onError: () => {
        enqueueSnackbar('Failed to record payment.', { variant: 'error' });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-12 flex flex-col items-center">
      
      {/* AMOUNT HEADER */}
      <div className="flex flex-col items-center justify-center my-8">
        <span className="text-slate-500 font-extrabold text-sm uppercase tracking-wider mb-1">Amount</span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-slate-800">$</span>
          <span className="text-5xl font-extrabold text-slate-400/90">{amountStr}</span>
        </div>
      </div>

      {/* PAYMENT FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 w-full flex flex-col gap-6">
        
        {/* TITLE */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#F3F7FA] border-0 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#159A1D]/20 outline-none transition-all"
            placeholder="e.g. Apple Music"
          />
        </div>

        {/* TRANSACTION TYPE */}
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Transaction Type</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${type === 'expense' ? 'border-red-400' : 'border-slate-300'}`}>
                {type === 'expense' && <div className="w-2.5 h-2.5 rounded-full bg-red-400" />}
              </div>
              <span className={`font-bold text-sm ${type === 'expense' ? 'text-slate-800' : 'text-slate-400'}`}>Expense</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${type === 'income' ? 'border-blue-400' : 'border-slate-300'}`}>
                {type === 'income' && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
              </div>
              <span className={`font-bold text-sm ${type === 'income' ? 'text-slate-800' : 'text-slate-400'}`}>Income</span>
            </label>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="flex flex-col gap-2 mt-2 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
          <div className="relative">
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-[#F3F7FA] border-0 rounded-2xl px-5 py-4 pr-12 text-slate-800 font-bold appearance-none focus:ring-2 focus:ring-[#159A1D]/20 outline-none transition-all"
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={20} />
            </div>
            {/* If category is selected, show its icon over the select box for styling */}
            {categoryId && categories && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {(() => {
                  const cat = categories.find(c => c.id === categoryId);
                  return cat ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-80" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      <DynamicIcon name={cat.icon_name} size={16} />
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            {/* Adjust padding if icon is present */}
            <style jsx>{`
              select { padding-left: ${categoryId ? '3.5rem' : '1.25rem'}; }
            `}</style>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#F3F7FA] border-0 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#159A1D]/20 outline-none transition-all resize-none"
            placeholder="Add a note..."
          />
        </div>

        {/* RECEIPT UPLOAD */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receipt (Optional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#F3F7FA] border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
          >
            {receiptPreview ? (
              <img src={receiptPreview} alt="Receipt preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : null}
            
            <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500 z-10 backdrop-blur-sm">
              <Camera size={24} />
            </div>
            <div className="flex flex-col items-center z-10">
              <span className="font-extrabold text-slate-700">{receiptPreview ? 'Change Receipt Image' : 'Upload Receipt Image'}</span>
              <span className="text-xs font-bold text-slate-400 mt-1">JPG, PNG</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={createTxMutation.isPending}
          className="w-full bg-[#159A1D] hover:bg-[#118218] text-white rounded-[20px] py-4 mt-4 font-extrabold text-[17px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {createTxMutation.isPending && <Loader2 size={20} className="animate-spin" />}
          Pay
        </button>

      </form>
    </div>
  );
}
