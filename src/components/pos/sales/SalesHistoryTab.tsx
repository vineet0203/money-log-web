"use client";

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  Printer, 
  Eye, 
  User, 
  CreditCard, 
  Banknote, 
  Smartphone,
  RotateCcw,
  ArrowLeftRight,
  ShieldAlert,
  CheckCircle2,
  Check,
  Search,
  Plus
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PosSearchInput, PosStatusBadge, PosReceipt, PosReceiptData, printThermalReceipt } from '@/components/pos/common';
import { Button } from '@/components/ui/button';
import { useGetPosOrders, useGetPosOrderById, PosOrder } from '@/hooks/queries/posOrders';
import { useCheckReturnEligibility, useCreatePosReturn, useCreatePosExchange } from '@/hooks/queries/posReturns';
import { useGetPosProducts, PosProduct, PosProductVariant } from '@/hooks/queries/posProducts';
import { usePosSettings } from '@/components/pos/settings/PosSettingsContext';
import { useSnackbar } from 'notistack';

export default function SalesHistoryTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { receiptSettings } = usePosSettings();
  const currencySymbol = receiptSettings.currencySymbol || '$';

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [returnModalOrderId, setReturnModalOrderId] = useState<number | null>(null);
  const [exchangeModalOrderId, setExchangeModalOrderId] = useState<number | null>(null);

  // Return modal local form state
  const [returnItems, setReturnItems] = useState<{ [variantId: number]: number }>({});
  const [refundMode, setRefundMode] = useState<'Store Credit' | 'Cash' | 'Card' | 'UPI'>('Store Credit');
  const [returnReason, setReturnReason] = useState('Customer Return');
  const [returnNotes, setReturnNotes] = useState('');

  // Exchange modal local form state
  const [exchangeReturnedItems, setExchangeReturnedItems] = useState<{ [variantId: number]: number }>({});
  const [exchangeReplacementItems, setExchangeReplacementItems] = useState<Array<{
    variant_id: number;
    item_name: string;
    unit_price: number;
    quantity: number;
  }>>([]);
  const [productSearch, setProductSearch] = useState('');
  const [exchangePaymentMode, setExchangePaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Store Credit'>('Cash');
  const [exchangeNotes, setExchangeNotes] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Fetch orders
  const { data: ordersResponse, isLoading } = useGetPosOrders({
    search: searchTerm,
    page,
    limit,
  });

  const orders = useMemo(() => ordersResponse?.data || [], [ordersResponse]);

  // Order Details for View Receipt modal
  const { data: orderDetails } = useGetPosOrderById(selectedOrderId || undefined);

  // Order details & eligibility for Return modal
  const { data: returnOrderDetails, isLoading: isReturnOrderLoading } = useGetPosOrderById(returnModalOrderId || undefined);
  const { data: returnEligibility, isLoading: isCheckingReturnElig, error: returnEligError } = useCheckReturnEligibility(returnModalOrderId);

  // Order details & eligibility for Exchange modal
  const { data: exchangeOrderDetails, isLoading: isExchangeOrderLoading } = useGetPosOrderById(exchangeModalOrderId || undefined);
  const { data: exchangeEligibility, isLoading: isCheckingExchangeElig, error: exchangeEligError } = useCheckReturnEligibility(exchangeModalOrderId);

  // Catalog products for replacement selection in Exchange
  const { data: productsData } = useGetPosProducts({ search: productSearch, limit: 10 });
  const catalogProducts = useMemo(() => productsData?.data || [], [productsData]);

  // Mutations
  const createReturnMutation = useCreatePosReturn();
  const createExchangeMutation = useCreatePosExchange();

  // Receipt format for viewing
  const receiptData: PosReceiptData | null = useMemo(() => {
    if (!orderDetails) return null;
    return {
      orderNumber: orderDetails.order_number,
      title: 'Tax Invoice / Receipt',
      date: orderDetails.created_at || orderDetails.order_date,
      registerLabel: orderDetails.register_label || 'Terminal #01',
      customerName: orderDetails.customer_name || 'Walk-in Customer',
      customerPhone: orderDetails.customer_phone,
      items: (orderDetails.items || []).map((it) => ({
        id: it.id,
        name: it.item_name,
        sku: it.sku,
        qty: Number(it.quantity),
        price: Number(it.unit_price),
        total: Number(it.total_amount),
      })),
      subtotal: Number(orderDetails.subtotal),
      discountTotal: Number(orderDetails.discount_total || 0),
      taxTotal: Number(orderDetails.tax_total || 0),
      grandTotal: Number(orderDetails.grand_total),
      paymentMode: orderDetails.payments?.[0]?.payment_mode || orderDetails.payment_mode || 'Cash',
      paymentReference: orderDetails.payments?.[0]?.reference_number || undefined,
    };
  }, [orderDetails]);

  // Handle return qty change
  const handleReturnQtyChange = (variantId: number, maxQty: number, qty: number) => {
    const safeQty = Math.max(0, Math.min(maxQty, qty));
    setReturnItems(prev => {
      if (safeQty === 0) {
        const next = { ...prev };
        delete next[variantId];
        return next;
      }
      return { ...prev, [variantId]: safeQty };
    });
  };

  // Calculated return refund
  const calculatedReturnRefund = useMemo(() => {
    if (!returnOrderDetails?.items) return 0;
    let sum = 0;
    for (const item of returnOrderDetails.items) {
      const q = returnItems[item.variant_id] || 0;
      if (q > 0) {
        sum += Number(item.unit_price) * q;
      }
    }
    return Number(sum.toFixed(2));
  }, [returnOrderDetails, returnItems]);

  // Submit Return
  const handleSubmitReturn = async () => {
    if (!returnModalOrderId || !returnEligibility?.is_eligible || calculatedReturnRefund <= 0) return;

    try {
      const returned_items = Object.entries(returnItems).map(([variantId, qty]) => {
        const item = returnOrderDetails?.items?.find(i => i.variant_id === parseInt(variantId, 10));
        return {
          variant_id: parseInt(variantId, 10),
          item_name: item?.item_name || 'Item',
          unit_price: Number(item?.unit_price || 0),
          quantity: qty,
        };
      });

      const itemsSummary = returnOrderDetails?.items
        ?.filter(i => (returnItems[i.variant_id] || 0) > 0)
        ?.map(i => `${i.item_name} (x${returnItems[i.variant_id]})`)
        ?.join(', ') || 'Returned Items';

      await createReturnMutation.mutateAsync({
        original_order_id: returnModalOrderId,
        refund_amount: calculatedReturnRefund,
        refund_mode: refundMode,
        reason: returnReason,
        items_summary: itemsSummary,
        notes: returnNotes.trim() || undefined,
        returned_items,
      });

      enqueueSnackbar(
        `Return recorded! Refund of ${currencySymbol}${calculatedReturnRefund.toFixed(2)} processed, sales order status updated, and stock restocked.`,
        { variant: 'success' }
      );
      setReturnModalOrderId(null);
      setReturnItems({});
      setReturnNotes('');
    } catch (err: unknown) {
      console.error('Return error:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      enqueueSnackbar(msg || 'Failed to process return', { variant: 'error' });
    }
  };

  // Exchange calculations
  const handleExchangeReturnQtyChange = (variantId: number, maxQty: number, qty: number) => {
    const safeQty = Math.max(0, Math.min(maxQty, qty));
    setExchangeReturnedItems(prev => {
      if (safeQty === 0) {
        const next = { ...prev };
        delete next[variantId];
        return next;
      }
      return { ...prev, [variantId]: safeQty };
    });
  };

  const exchangeReturnedTotal = useMemo(() => {
    if (!exchangeOrderDetails?.items) return 0;
    let sum = 0;
    for (const item of exchangeOrderDetails.items) {
      const q = exchangeReturnedItems[item.variant_id] || 0;
      if (q > 0) {
        sum += Number(item.unit_price) * q;
      }
    }
    return Number(sum.toFixed(2));
  }, [exchangeOrderDetails, exchangeReturnedItems]);

  const exchangeReplacementTotal = useMemo(() => {
    return Number(exchangeReplacementItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0).toFixed(2));
  }, [exchangeReplacementItems]);

  const priceDifference = useMemo(() => {
    return Number((exchangeReplacementTotal - exchangeReturnedTotal).toFixed(2));
  }, [exchangeReplacementTotal, exchangeReturnedTotal]);

  const handleAddReplacement = (product: PosProduct, variant: PosProductVariant) => {
    if (!variant.id) return;
    setExchangeReplacementItems(prev => {
      const existing = prev.find(i => i.variant_id === variant.id);
      if (existing) {
        return prev.map(i => i.variant_id === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          variant_id: variant.id!,
          item_name: `${product.name} (${variant.title})`,
          unit_price: Number(variant.selling_price) || 0,
          quantity: 1,
        },
      ];
    });
  };

  const handleRemoveReplacement = (variantId: number) => {
    setExchangeReplacementItems(prev => prev.filter(i => i.variant_id !== variantId));
  };

  // Submit Exchange
  const handleSubmitExchange = async () => {
    if (!exchangeModalOrderId || !exchangeEligibility?.is_eligible || exchangeReplacementItems.length === 0) return;

    try {
      const returned_items = Object.entries(exchangeReturnedItems).map(([variantId, qty]) => {
        const found = exchangeOrderDetails?.items?.find(i => i.variant_id === parseInt(variantId, 10));
        return {
          variant_id: parseInt(variantId, 10),
          item_name: found?.item_name || 'Item',
          quantity: qty,
          unit_price: Number(found?.unit_price || 0),
        };
      });

      await createExchangeMutation.mutateAsync({
        original_order_id: exchangeModalOrderId,
        returned_items,
        replacement_items: exchangeReplacementItems,
        price_difference: priceDifference,
        payment_mode: exchangePaymentMode,
        notes: exchangeNotes.trim() || undefined,
      });

      enqueueSnackbar(
        `Exchange completed successfully! Sales order status updated to 'exchanged' and inventory stocks synchronized.`,
        { variant: 'success' }
      );
      setExchangeModalOrderId(null);
      setExchangeReturnedItems({});
      setExchangeReplacementItems([]);
      setExchangeNotes('');
    } catch (err: unknown) {
      console.error('Exchange error:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      enqueueSnackbar(msg || 'Failed to process exchange', { variant: 'error' });
    }
  };

  const columns: Column<PosOrder>[] = [
    {
      header: 'Invoice #',
      key: 'order_number',
      cell: (row) => (
        <span className="font-mono font-bold text-slate-800">
          #{row.order_number}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      key: 'created_at',
      cell: (row) => {
        const d = new Date(row.created_at || row.order_date);
        return (
          <div className="flex flex-col text-xs">
            <span className="text-slate-800 font-medium">
              {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-slate-400 font-mono">
              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Customer',
      key: 'customer_name',
      cell: (row) => (
        <div className="flex flex-col text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <User size={12} className="text-slate-400" />
            <span>{row.customer_name || 'Walk-in Customer'}</span>
          </div>
          {row.customer_phone && (
            <span className="text-[10.5px] text-slate-400 font-mono pl-4">
              {row.customer_phone}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Items',
      key: 'items_count',
      cell: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.items_count} {row.items_count === 1 ? 'item' : 'items'}
        </span>
      ),
    },
    {
      header: 'Payment',
      key: 'payment_mode',
      cell: (row) => {
        const mode = row.payment_mode || 'Cash';
        const isCash = mode === 'Cash';
        const isCard = mode === 'Card';
        const isUpi = mode === 'UPI';

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isCash
                ? 'bg-emerald-50 text-emerald-700'
                : isCard
                ? 'bg-blue-50 text-blue-700'
                : isUpi
                ? 'bg-purple-50 text-purple-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isCash && <Banknote size={12} />}
            {isCard && <CreditCard size={12} />}
            {isUpi && <Smartphone size={12} />}
            <span>{mode}</span>
          </span>
        );
      },
    },
    {
      header: 'Total Paid',
      key: 'grand_total',
      cell: (row) => (
        <span className="font-bold text-slate-900 font-mono text-sm">
          {currencySymbol}{Number(row.grand_total).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status || 'completed'} />,
    },
    {
      header: 'Actions',
      key: 'id',
      cell: (row) => {
        const isRefunded = row.status === 'refunded';

        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedOrderId(row.id)}
              className="p-1.5 text-slate-500 hover:text-[#159A1D] hover:bg-emerald-50 rounded-lg transition-colors"
              title="View & Print Receipt"
            >
              <Eye size={15} />
            </button>

            <button
              type="button"
              disabled={isRefunded}
              onClick={() => {
                setReturnModalOrderId(row.id);
                setReturnItems({});
              }}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={isRefunded ? 'Already fully refunded' : 'Return & Refund'}
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              disabled={isRefunded}
              onClick={() => {
                setExchangeModalOrderId(row.id);
                setExchangeReturnedItems({});
                setExchangeReplacementItems([]);
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={isRefunded ? 'Already fully refunded' : 'Exchange Items'}
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Sales History & Invoices</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log of completed orders, thermal receipts, returns, and inventory exchanges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PosSearchInput
            placeholder="Search invoice # or customer..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            className="w-64"
          />
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No sales orders found yet. Complete a sale in New Sale to see it here."
        onRowClick={(row) => setSelectedOrderId(row.id)}
        pagination={ordersResponse?.pagination ? {
          currentPage: ordersResponse.pagination.page,
          totalPages: ordersResponse.pagination.totalPages,
          totalItems: ordersResponse.pagination.total,
          itemsPerPage: ordersResponse.pagination.limit,
          itemName: 'sales orders',
          onPageChange: (newPage) => setPage(newPage),
          itemsPerPageOptions: [10, 15, 25, 50],
          onItemsPerPageChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        } : undefined}
      />

      {/* ======================================================== */}
      {/* 1. View Receipt Modal                                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        title={`Receipt #${orderDetails?.order_number || selectedOrderId || ''}`}
        cancelText="Close"
      >
        {receiptData ? (
          <div className="space-y-4">
            <PosReceipt
              data={receiptData}
              mode="static"
              id="pos-history-receipt"
              settings={orderDetails?.receipt_config || receiptSettings}
            />

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 no-print flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={orderDetails?.status === 'refunded'}
                  onClick={() => {
                    const id = selectedOrderId;
                    setSelectedOrderId(null);
                    setReturnModalOrderId(id);
                    setReturnItems({});
                  }}
                  className="gap-1.5 text-rose-600 hover:bg-rose-50 border-rose-200 text-xs font-semibold"
                >
                  <RotateCcw size={13} />
                  <span>Return / Refund</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={orderDetails?.status === 'refunded'}
                  onClick={() => {
                    const id = selectedOrderId;
                    setSelectedOrderId(null);
                    setExchangeModalOrderId(id);
                    setExchangeReturnedItems({});
                    setExchangeReplacementItems([]);
                  }}
                  className="gap-1.5 text-blue-600 hover:bg-blue-50 border-blue-200 text-xs font-semibold"
                >
                  <ArrowLeftRight size={13} />
                  <span>Exchange Items</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => printThermalReceipt('pos-history-receipt')}
                className="gap-1.5 text-slate-700 font-semibold text-xs"
              >
                <Printer size={14} />
                <span>Print Thermal Receipt</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex justify-center text-slate-400">
            <div className="h-5 w-5 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 2. Process Return & Refund Modal                         */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(returnModalOrderId)}
        onClose={() => {
          setReturnModalOrderId(null);
          setReturnItems({});
          setReturnNotes('');
        }}
        title={`Process Return #${returnOrderDetails?.order_number || ''}`}
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-1">
          {isCheckingReturnElig || isReturnOrderLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-500">
              <div className="h-6 w-6 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Verifying return policy window & order items...</span>
            </div>
          ) : returnEligError || !returnEligibility ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-3">
              <div className="flex items-start gap-2 text-rose-800">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Unable to verify order return eligibility</p>
                  <p className="text-slate-600 mt-0.5">
                    {(returnEligError as unknown as { response?: { data?: { error?: string } } })?.response?.data?.error || 
                     'Order details or return policy could not be loaded. Please ensure the backend is running.'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setReturnModalOrderId(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Policy Eligibility Status Card */}
              <div className={`p-3.5 rounded-xl border ${
                returnEligibility.is_eligible
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-start gap-2.5">
                  {returnEligibility.is_eligible ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-sm">
                      {returnEligibility.is_eligible ? 'Eligible for Return & Refund' : 'Return Window Expired'}
                    </p>
                    <p className="text-[11.5px] leading-relaxed">
                      {returnEligibility.policy_message}
                    </p>
                    <div className="pt-1.5 flex gap-4 text-[11px] font-mono text-slate-600">
                      <span>Purchased: {new Date(returnEligibility.order_date).toLocaleDateString()}</span>
                      <span>Elapsed: {returnEligibility.days_elapsed} days</span>
                      <span>Policy: {returnEligibility.return_window_days} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {returnEligibility.is_eligible ? (
                <>
                  {/* Select Items to Return */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 block">
                        Select Specific Variant to Return:
                      </label>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        Locked to Sale Price
                      </span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                      {returnOrderDetails?.items?.map(item => {
                        const currentQty = returnItems[item.variant_id] || 0;
                        const maxQty = Number(item.quantity);
                        const unitPrice = Number(item.unit_price);
                        const itemRefundTotal = currentQty * unitPrice;

                        return (
                          <div 
                            key={item.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900">{item.item_name}</span>
                                  {item.variant_title && (
                                    <span className="text-[10.5px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                      {item.variant_title}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  {item.sku && <span>SKU: {item.sku}</span>}
                                  {item.barcode && <span>• Barcode: <span className="font-mono text-slate-700">{item.barcode}</span></span>}
                                  <span>• Sold Qty: {maxQty}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  Sale Price: {currencySymbol}{unitPrice.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Price at time of sale</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-600 font-medium">Return Qty:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={maxQty}
                                  value={currentQty}
                                  onChange={e => handleReturnQtyChange(item.variant_id, maxQty, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 text-center font-bold font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                                />
                                <span className="text-[10.5px] text-slate-400">/ {maxQty} max</span>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-bold text-slate-800 font-mono">
                                  Refund: {currencySymbol}{itemRefundTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Return Reason & Mode */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reason for Return</label>
                      <select
                        value={returnReason}
                        onChange={e => setReturnReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      >
                        <option value="Customer Return">Customer Return</option>
                        <option value="Defective / Damaged">Defective / Damaged</option>
                        <option value="Wrong Item Received">Wrong Item Received</option>
                        <option value="Customer Changed Mind">Customer Changed Mind</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Refund Method</label>
                      <select
                        value={refundMode}
                        onChange={e => setRefundMode(e.target.value as 'Store Credit' | 'Cash' | 'Card' | 'UPI')}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      >
                        <option value="Store Credit">Store Credit (Recommended)</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card Refund</option>
                        <option value="UPI">UPI Refund</option>
                      </select>
                    </div>
                  </div>

                  {/* Return Notes */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Return Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={returnNotes}
                      onChange={e => setReturnNotes(e.target.value)}
                      placeholder="Add return notes, reason details, condition of returned goods..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D] resize-none"
                    />
                  </div>

                  {/* Total Refund Box */}
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Total Refund Amount:</span>
                      <span className="text-[11px] text-slate-500">Sales order will update & inventory restocks</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-rose-600">
                      {currencySymbol}{calculatedReturnRefund.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReturnModalOrderId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={calculatedReturnRefund <= 0 || createReturnMutation.isPending}
                      onClick={handleSubmitReturn}
                      className="gap-2 font-bold"
                    >
                      {createReturnMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={15} />
                          <span>Complete Return ({currencySymbol}{calculatedReturnRefund.toFixed(2)})</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-rose-700 font-semibold">
                    According to store settings, returns cannot be processed after the {returnEligibility.return_window_days}-day limit.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReturnModalOrderId(null)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 3. Process Exchange Modal                                */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(exchangeModalOrderId)}
        onClose={() => {
          setExchangeModalOrderId(null);
          setExchangeReturnedItems({});
          setExchangeReplacementItems([]);
          setExchangeNotes('');
        }}
        title={`Exchange Items for Invoice #${exchangeOrderDetails?.order_number || ''}`}
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-1">
          {isCheckingExchangeElig || isExchangeOrderLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-500">
              <div className="h-6 w-6 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Verifying exchange policy window & order items...</span>
            </div>
          ) : exchangeEligError || !exchangeEligibility ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-3">
              <div className="flex items-start gap-2 text-rose-800">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Unable to verify order exchange eligibility</p>
                  <p className="text-slate-600 mt-0.5">
                    {(exchangeEligError as unknown as { response?: { data?: { error?: string } } })?.response?.data?.error || 
                     'Order details or exchange policy could not be loaded. Please ensure the backend is running.'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setExchangeModalOrderId(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Eligibility Banner */}
              <div className={`p-3.5 rounded-xl border ${
                exchangeEligibility.is_eligible
                  ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-start gap-2.5">
                  {exchangeEligibility.is_eligible ? (
                    <ArrowLeftRight size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-sm">
                      {exchangeEligibility.is_eligible ? 'Eligible for Product Exchange' : 'Exchange Window Expired'}
                    </p>
                    <p className="text-[11.5px] leading-relaxed">
                      {exchangeEligibility.policy_message}
                    </p>
                    <div className="pt-1.5 flex gap-4 text-[11px] font-mono text-slate-600">
                      <span>Purchased: {new Date(exchangeEligibility.order_date).toLocaleDateString()}</span>
                      <span>Elapsed: {exchangeEligibility.days_elapsed} days</span>
                      <span>Policy Window: {exchangeEligibility.return_window_days} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {exchangeEligibility.is_eligible ? (
                <>
                  {/* Step A: Items Being Returned */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 block">
                        1. Specific Variant Customer is Returning (Restocked):
                      </label>
                      <span className="font-mono font-bold text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Credit at Sale Price: -{currencySymbol}{exchangeReturnedTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                      {exchangeOrderDetails?.items?.map(item => {
                        const currentQty = exchangeReturnedItems[item.variant_id] || 0;
                        const maxQty = Number(item.quantity);
                        const unitPrice = Number(item.unit_price);
                        const itemReturnCredit = currentQty * unitPrice;

                        return (
                          <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-900">{item.item_name}</span>
                                  {item.variant_title && (
                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                      {item.variant_title}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-500">
                                  {item.sku && <span>SKU: {item.sku}</span>}
                                  {item.barcode && <span>• Barcode: <span className="font-mono text-slate-700">{item.barcode}</span></span>}
                                  <span>• Sold: {maxQty}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="inline-block text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Sale Price: {currencySymbol}{unitPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500">Return Qty:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={maxQty}
                                  value={currentQty}
                                  onChange={e => handleExchangeReturnQtyChange(item.variant_id, maxQty, parseInt(e.target.value) || 0)}
                                  className="w-14 px-1.5 py-0.5 text-center font-bold font-mono border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                                />
                                <span className="text-[10px] text-slate-400">/ {maxQty} sold</span>
                              </div>

                              <span className="font-bold font-mono text-rose-600 text-xs">
                                Credit: -{currencySymbol}{itemReturnCredit.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step B: Replacement Items */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        2. Replacement Items Given (Stock Deducted):
                      </label>
                      <span className="font-mono font-bold text-xs text-emerald-700">
                        Total: +{currencySymbol}{exchangeReplacementTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Replacement Search */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search replacement products & variants..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </div>

                    {/* Search Results Dropdown / Picker */}
                    {productSearch.trim() && catalogProducts.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-1 bg-white shadow-md space-y-1 text-xs">
                        {catalogProducts.map(prod => (
                          <div key={prod.id} className="p-1.5 hover:bg-slate-50 rounded">
                            <span className="font-bold text-slate-800 block text-[11px]">{prod.name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prod.variants?.filter(v => v.is_active !== false).map(v => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => handleAddReplacement(prod, v)}
                                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded text-[10.5px] font-medium border border-slate-200 flex items-center gap-1"
                                >
                                  <Plus size={10} />
                                  <span>{v.title} ({currencySymbol}{Number(v.selling_price).toFixed(2)})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chosen Replacement Items List */}
                    <div className="min-h-16 max-h-32 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50 text-xs">
                      {exchangeReplacementItems.length === 0 ? (
                        <p className="text-center py-4 text-slate-400 text-[11px]">
                          Search and click a variant above to add as replacement item.
                        </p>
                      ) : (
                        exchangeReplacementItems.map(item => (
                          <div key={item.variant_id} className="p-1.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{item.item_name} (x{item.quantity})</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900">
                                {currencySymbol}{(item.unit_price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveReplacement(item.variant_id)}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Price Difference Summary */}
                  <div className="p-3 bg-slate-100 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total Returned Credit (Original Sale Price):</span>
                      <span className="font-mono font-bold text-rose-600">-{currencySymbol}{exchangeReturnedTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total Replacement Value (Catalog Price):</span>
                      <span className="font-mono font-bold text-emerald-700">+{currencySymbol}{exchangeReplacementTotal.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold">
                      <div>
                        <span className="text-slate-800 block text-xs font-bold">
                          {priceDifference > 0 ? 'Customer Pays Difference:' : priceDifference < 0 ? 'Store Refund to Customer:' : 'Even Exchange:'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {priceDifference > 0 ? 'Customer takes higher value items' : priceDifference < 0 ? 'Customer takes lower value items' : 'Equal value exchange'}
                        </span>
                      </div>

                      <span className={`text-base font-bold font-mono ${
                        priceDifference > 0 ? 'text-[#159A1D]' : priceDifference < 0 ? 'text-rose-600' : 'text-slate-700'
                      }`}>
                        {priceDifference > 0 ? `+${currencySymbol}${priceDifference.toFixed(2)}` : priceDifference < 0 ? `-${currencySymbol}${Math.abs(priceDifference).toFixed(2)}` : `${currencySymbol}0.00`}
                      </span>
                    </div>
                  </div>

                  {/* Payment / Refund Mode for Difference */}
                  {priceDifference !== 0 && (
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Payment Tender for Difference:</span>
                      <select
                        value={exchangePaymentMode}
                        onChange={e => setExchangePaymentMode(e.target.value as 'Cash' | 'Card' | 'UPI' | 'Store Credit')}
                        className="px-2 py-1 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Store Credit">Store Credit</option>
                      </select>
                    </div>
                  )}

                  {/* Exchange Notes */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Exchange Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={exchangeNotes}
                      onChange={e => setExchangeNotes(e.target.value)}
                      placeholder="Add exchange notes, reason details, customer remarks..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D] resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeModalOrderId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={exchangeReplacementItems.length === 0 || createExchangeMutation.isPending}
                      onClick={handleSubmitExchange}
                      className="gap-2 font-bold"
                    >
                      {createExchangeMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          <span>Complete Exchange</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-rose-700 font-semibold">
                    According to store settings, exchanges cannot be processed after the {exchangeEligibility.return_window_days}-day limit.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExchangeModalOrderId(null)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
