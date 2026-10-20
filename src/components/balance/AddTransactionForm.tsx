"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, UploadCloud, X, ArrowLeft, Loader2, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetCategories } from '@/hooks/queries/categories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/queries/transactions';
import { useSnackbar } from 'notistack';
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

interface AddTransactionFormProps {
  transaction?: any; // If provided, renders in edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function AddTransactionForm({
  transaction,
  onSuccess,
  onCancel,
  isModal = false,
}: AddTransactionFormProps) {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  const { enqueueSnackbar } = useSnackbar();

  const isEdit = Boolean(transaction?.id);
  const isSubscriptionLinked = Boolean(transaction?.subscription_id);

  const { data: categories = [] } = useGetCategories();
  const createTxMutation = useCreateTransaction();
  const updateTxMutation = useUpdateTransaction();

  const isSubmitting = createTxMutation.isPending || updateTxMutation.isPending;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(transaction?.receipt_url || null);
  const [removeReceipt, setRemoveReceipt] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [pendingSummary, setPendingSummary] = useState<{ title: string; amount: string; type: string } | null>(null);

  const formatInitialDate = (dateVal?: any) => {
    if (!dateVal) return new Date().toISOString().split('T')[0];
    if (typeof dateVal === 'string') {
      return dateVal.split('T')[0].split(' ')[0];
    }
    if (dateVal instanceof Date) {
      return dateVal.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (transaction?.type === 'income' ? 'income' : 'expense') as 'expense' | 'income',
      title: transaction?.title || '',
      amount: transaction?.amount !== undefined ? String(transaction.amount) : '',
      date: formatInitialDate(transaction?.date),
      category: transaction?.category_id ? String(transaction.category_id) : '',
      notes: transaction?.description || transaction?.notes || '',
    },
  });

  // Re-sync form default values if the transaction prop changes
  useEffect(() => {
    if (transaction) {
      reset({
        type: (transaction.type === 'income' ? 'income' : 'expense') as 'expense' | 'income',
        title: transaction.title || '',
        amount: transaction.amount !== undefined ? String(transaction.amount) : '',
        date: formatInitialDate(transaction.date),
        category: transaction.category_id ? String(transaction.category_id) : '',
        notes: transaction.description || transaction.notes || '',
      });
      setPreviewUrl(transaction.receipt_url || null);
      setFile(null);
      setRemoveReceipt(false);
    }
  }, [transaction, reset]);

  useEffect(() => {
    if (!isModal) {
      if (isEdit) {
        setHeaderData("Edit Transaction", "Update transaction details.", true);
      } else {
        setHeaderData("Add Transaction", "Log a new income or expense.", true);
      }
    }
  }, [setHeaderData, isModal, isEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setRemoveReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    setFile(null);
    setPreviewUrl(null);
    if (isEdit && transaction?.receipt_url) {
      setRemoveReceipt(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/transactions');
    }
  };

  const onSubmit = (data: TransactionFormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', isSubscriptionLinked ? String(transaction.amount) : data.amount);
    formData.append('type', isSubscriptionLinked ? transaction.type : data.type);
    formData.append('date', isSubscriptionLinked ? formatInitialDate(transaction.date) : data.date);
    if (data.category) {
      formData.append('category_id', data.category);
    }
    if (data.notes !== undefined) {
      formData.append('description', data.notes);
    }

    if (file) {
      formData.append('receipt', file);
    } else if (isEdit && removeReceipt) {
      formData.append('remove_receipt', 'true');
    }

    if (isEdit && transaction?.id) {
      setPendingFormData(formData);
      setPendingSummary({
        title: data.title,
        amount: data.amount,
        type: data.type,
      });
      setIsConfirmOpen(true);
      return;
    }

    createTxMutation.mutate(formData, {
      onSuccess: () => {
        enqueueSnackbar('Transaction created successfully', { variant: 'success' });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/transactions');
        }
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to create transaction';
        enqueueSnackbar(msg, { variant: 'error' });
      },
    });
  };

  const handleConfirmUpdate = () => {
    if (!pendingFormData || !transaction?.id) return;
    updateTxMutation.mutate(
      { id: transaction.id, formData: pendingFormData },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setPendingFormData(null);
          setPendingSummary(null);
          enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/transactions');
          }
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            'Failed to update transaction';
          enqueueSnackbar(msg, { variant: 'error' });
          setIsConfirmOpen(false);
        },
      }
    );
  };

  const isPdf = previewUrl?.toLowerCase().includes('.pdf') || file?.type === 'application/pdf';

  return (
    <div className={isModal ? 'w-full' : 'space-y-6'}>
      <div
        className={`bg-white rounded-2xl overflow-hidden ${
          isModal ? 'border-0 shadow-none' : 'shadow-sm border border-slate-100'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Form Side */}
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="w-full md:w-2/3 flex flex-col border-b md:border-b-0 md:border-r border-slate-100"
          >
            <div className={isModal ? 'p-6 space-y-5' : 'p-8 space-y-6'}>
              {/* Subscription Lock Notice */}
              {isSubscriptionLinked && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed font-medium">
                    <span className="font-bold">Linked to subscription:</span> Amount,
                    date, and transaction type are locked to maintain recurrence schedule
                    integrity. You can edit the description, category, and receipt. To reverse this
                    payment, use <strong>Undo Payment</strong> from the subscription details.
                  </div>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Transaction Type {isSubscriptionLinked && <span className="text-xs text-slate-400 font-normal">(Locked)</span>}
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center gap-3 p-3.5 border rounded-xl transition-colors ${
                      isSubscriptionLinked
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 cursor-pointer hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="expense"
                      disabled={isSubscriptionLinked}
                      {...register('type')}
                      className="w-4 h-4 text-[#159A1D] focus:ring-[#159A1D] disabled:cursor-not-allowed"
                    />
                    <span className="font-bold text-slate-900 text-sm">Expense</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center gap-3 p-3.5 border rounded-xl transition-colors ${
                      isSubscriptionLinked
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 cursor-pointer hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="income"
                      disabled={isSubscriptionLinked}
                      {...register('type')}
                      className="w-4 h-4 text-[#159A1D] focus:ring-[#159A1D] disabled:cursor-not-allowed"
                    />
                    <span className="font-bold text-slate-900 text-sm">Income</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    label={isSubscriptionLinked ? "Amount ($) - Locked" : "Amount ($)"}
                    type="number"
                    step="0.01"
                    min="0"
                    required={true}
                    disabled={isSubscriptionLinked}
                    placeholder="0.00"
                    error={errors.amount?.message}
                    className={isSubscriptionLinked ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}
                    {...register('amount')}
                  />
                </div>

                <div>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        label={isSubscriptionLinked ? "Date - Locked" : "Date"}
                        value={field.value}
                        required={true}
                        disabled={isSubscriptionLinked}
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
                        options={categories.map((c) => ({
                          value: c.id.toString(),
                          label: c.name,
                        }))}
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

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft size={17} />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle size={17} />
                )}
                {isSubmitting
                  ? 'Saving...'
                  : isEdit
                  ? 'Save Changes'
                  : 'Save Transaction'}
              </Button>
            </div>
          </form>

          {/* Receipt Upload Side */}
          <div className="w-full md:w-1/3 bg-slate-50 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Attach Receipt (Optional)</h3>

            {!previewUrl ? (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer relative min-h-[200px]">
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
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between mb-3 shadow-sm">
                  <span className="text-xs font-semibold text-slate-800 truncate pr-3">
                    {file?.name || 'Attached Receipt'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove receipt"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white flex justify-center items-center min-h-[200px] p-2">
                  {isPdf ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <FileText className="text-[#159A1D] mb-2" size={40} />
                      <span className="text-xs font-bold text-slate-700">PDF Document</span>
                      {previewUrl.startsWith('http') && (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 text-xs text-[#159A1D] underline font-semibold"
                        >
                          Open in new tab
                        </a>
                      )}
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="object-contain max-h-56 max-w-full rounded-lg"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEdit && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => {
            if (!updateTxMutation.isPending) {
              setIsConfirmOpen(false);
            }
          }}
          onConfirm={handleConfirmUpdate}
          title="Save Changes?"
          description={
            <div className="space-y-3 mt-1">
              <p className="text-slate-600 text-sm">
                Are you sure you want to save the updated details for this transaction?
              </p>
              {pendingSummary && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Title:</span>
                    <span className="font-bold text-slate-800">{pendingSummary.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Type:</span>
                    <span
                      className={`font-bold capitalize ${
                        pendingSummary.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {pendingSummary.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Amount:</span>
                    <span
                      className={`font-black ${
                        pendingSummary.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {pendingSummary.type === 'income' ? '+' : '-'}$
                      {parseFloat(pendingSummary.amount || '0').toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          }
          confirmText="Save Changes"
          cancelText="Cancel"
          variant="primary"
          isLoading={updateTxMutation.isPending}
        />
      )}
    </div>
  );
}
