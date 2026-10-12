"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, UploadCloud, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetCategories } from '@/hooks/queries/categories';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional()
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function AddTransactionForm() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  
  const { data: categories = [] } = useGetCategories();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      notes: ''
    }
  });

  const transactionType = watch('type');

  useEffect(() => {
    setHeaderData("Add Transaction", "Log a new income or expense.", true);
  }, [setHeaderData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const onSubmit = (data: TransactionFormValues) => {
    // Simulate save
    console.log(data);
    router.push('/transactions');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Form Side */}
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full md:w-2/3 flex flex-col border-b md:border-b-0 md:border-r border-slate-100">
            <div className="p-8 space-y-6">
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      value="expense"
                      {...register('type')}
                      className="w-4 h-4 text-[#159A1D] focus:ring-[#159A1D]"
                    />
                    <span className="font-bold text-slate-900">Expense</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      value="income"
                      {...register('type')}
                      className="w-4 h-4 text-[#159A1D] focus:ring-[#159A1D]"
                    />
                    <span className="font-bold text-slate-900">Income</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input 
                    label="Title / Description"
                    type="text" 
                    required={true}
                    placeholder="e.g. Office Rent"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                </div>
                
                <div>
                  <Input 
                    label="Amount ($)"
                    type="number" 
                    step="0.01"
                    min="0"
                    required={true}
                    placeholder="0.00"
                    error={errors.amount?.message}
                    {...register('amount')}
                  />
                </div>

                <div>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker 
                        label="Date"
                        value={field.value}
                        required={true}
                        onChange={field.onChange}
                        error={errors.date?.message}
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select 
                        label="Category"
                        value={field.value}
                        required={true}
                        onChange={field.onChange}
                        placeholder="Select a category"
                        options={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
                        error={errors.category?.message}
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#4F627A] mb-1.5">Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Optional notes..."
                    {...register('notes')}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm resize-none custom-scrollbar"
                  />
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
              <Button variant="secondary" type="button" onClick={() => router.push('/transactions')} className="gap-2">
                <ArrowLeft size={18} />
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <CheckCircle size={18} />
                Save Transaction
              </Button>
            </div>
          </form>

          {/* Receipt Upload Side */}
          <div className="w-full md:w-1/3 bg-slate-50 p-8 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Attach Receipt (Optional)</h3>
            
            {!previewUrl ? (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer relative min-h-[200px]">
                <UploadCloud className="mx-auto text-[#159A1D] mb-3" size={32} />
                <p className="text-sm text-slate-900 font-semibold mb-1">Click to upload</p>
                <p className="text-xs text-[#849AB4]">PNG, JPG, PDF (max 5MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  id="tx-receipt-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="tx-receipt-upload" className="absolute inset-0 cursor-pointer"></label>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between mb-4 shadow-sm">
                  <span className="text-xs font-medium text-slate-900 truncate pr-4">{file?.name || 'Uploaded File'}</span>
                  <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-slate-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white flex justify-center items-center min-h-[200px]">
                  <img src={previewUrl} alt="Preview" className="object-contain max-h-full max-w-full p-2" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
