"use client";

import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeftRight, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Check 
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PosStatusBadge, PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { usePosSettings } from '@/components/pos/settings/PosSettingsContext';
import { 
  useGetPosReturns, 
  useGetPosExchanges,
  useCheckReturnEligibility, 
  useCreatePosReturn, 
  useCreatePosExchange,
  PosReturn,
  PosExchange
} from '@/hooks/queries/posReturns';
import { useGetPosOrders, useGetPosOrderById, PosOrder } from '@/hooks/queries/posOrders';
import { useGetPosProducts, PosProduct, PosProductVariant } from '@/hooks/queries/posProducts';
import { useSnackbar } from 'notistack';

export default function ReturnsTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { receiptSettings } = usePosSettings();
  const currencySymbol = receiptSettings.currencySymbol || '$';
  const returnWindowDays = receiptSettings.returnWindowDays ?? 14;

  const [activeView, setActiveView] = useState<'returns' | 'exchanges'>('returns');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processType, setProcessType] = useState<'return' | 'exchange'>('return');
  
  // Selection state inside modal
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  
  // Return & Refund State
  const [selectedItems, setSelectedItems] = useState<{ [variantId: number]: number }>({});
  const [refundMode, setRefundMode] = useState<'Store Credit' | 'Cash' | 'Card' | 'UPI'>('Store Credit');
  const [returnReason, setReturnReason] = useState('Customer Return');
  const [returnNotes, setReturnNotes] = useState('');

  // Exchange State
  const [exchangeReturnedItems, setExchangeReturnedItems] = useState<{ [variantId: number]: number }>({});
  const [exchangeReplacementItems, setExchangeReplacementItems] = useState<
    Array<{ variant_id: number; item_name: string; unit_price: number; quantity: number }>
  >([]);
  const [exchangePaymentMode, setExchangePaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Store Credit'>('Cash');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [exchangeNotes, setExchangeNotes] = useState('');

  // Pagination & details selection state
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsLimit, setReturnsLimit] = useState(15);
  const [exchangesPage, setExchangesPage] = useState(1);
  const [exchangesLimit, setExchangesLimit] = useState(15);

  const [selectedReturnDetails, setSelectedReturnDetails] = useState<PosReturn | null>(null);
  const [selectedExchangeDetails, setSelectedExchangeDetails] = useState<PosExchange | null>(null);

  // Queries
  const { data: returnsData, isLoading: isReturnsLoading } = useGetPosReturns({
    search: searchTerm,
    page: returnsPage,
    limit: returnsLimit,
  });
  const returns = (returnsData?.data as PosReturn[]) || [];

  const { data: exchangesData, isLoading: isExchangesLoading } = useGetPosExchanges({
    search: searchTerm,
    page: exchangesPage,
    limit: exchangesLimit,
  });
  const exchanges = (exchangesData?.data as PosExchange[]) || [];

  const { data: ordersData, isLoading: isOrdersLoading } = useGetPosOrders({ search: orderSearch, limit: 10 });
  const orders = (ordersData?.data as PosOrder[]) || [];

  const { data: selectedOrderDetails, isLoading: isSelectedOrderLoading } = useGetPosOrderById(selectedOrderId ?? undefined);
  const { data: eligibility, isLoading: isCheckingEligibility, error: eligibilityError } = useCheckReturnEligibility(selectedOrderId);

  const { data: productsData } = useGetPosProducts({ search: catalogSearch, limit: 10 });
  const catalogProducts = useMemo(() => productsData?.data || [], [productsData]);

  // Mutations
  const createReturnMutation = useCreatePosReturn();
  const createExchangeMutation = useCreatePosExchange();

  // Reset modal state when closing
  const handleCloseModal = () => {
    setIsProcessModalOpen(false);
    setSelectedOrderId(null);
    setOrderSearch('');
    setSelectedItems({});
    setRefundMode('Store Credit');
    setReturnReason('Customer Return');
    setReturnNotes('');
    setExchangeReturnedItems({});
    setExchangeReplacementItems([]);
    setCatalogSearch('');
    setExchangePaymentMode('Cash');
    setExchangeNotes('');
  };

  // Toggle or update quantity of items to return (Refund flow)
  const handleItemQtyChange = (variantId: number, maxQty: number, qty: number) => {
    const safeQty = Math.max(0, Math.min(maxQty, qty));
    setSelectedItems(prev => {
      if (safeQty === 0) {
        const next = { ...prev };
        delete next[variantId];
        return next;
      }
      return { ...prev, [variantId]: safeQty };
    });
  };

  // Calculate refund amount based on selected items
  const calculatedRefund = useMemo(() => {
    if (!selectedOrderDetails?.items) return 0;
    let sum = 0;
    for (const item of selectedOrderDetails.items) {
      const returnQty = selectedItems[item.variant_id] || 0;
      if (returnQty > 0) {
        sum += Number(item.unit_price) * returnQty;
      }
    }
    return Number(sum.toFixed(2));
  }, [selectedOrderDetails, selectedItems]);

  // Submit Return
  const handleSubmitReturn = async () => {
    if (!selectedOrderId || !eligibility?.is_eligible || calculatedRefund <= 0) return;

    try {
      const returned_items = Object.entries(selectedItems).map(([variantId, qty]) => {
        const item = selectedOrderDetails?.items?.find(it => it.variant_id === parseInt(variantId, 10));
        return {
          variant_id: parseInt(variantId, 10),
          item_name: item?.item_name || 'Item',
          unit_price: Number(item?.unit_price || 0),
          quantity: qty,
        };
      });

      const itemsSummary = selectedOrderDetails?.items
        ?.filter(i => (selectedItems[i.variant_id] || 0) > 0)
        ?.map(i => `${i.item_name} (x${selectedItems[i.variant_id]})`)
        ?.join(', ') || 'Returned Items';

      await createReturnMutation.mutateAsync({
        original_order_id: selectedOrderId,
        refund_amount: calculatedRefund,
        refund_mode: refundMode,
        reason: returnReason,
        items_summary: itemsSummary,
        notes: returnNotes.trim() || undefined,
        returned_items,
      });

      enqueueSnackbar(
        `Return recorded successfully! Refund of ${currencySymbol}${calculatedRefund.toFixed(2)} processed via ${refundMode}.`,
        { variant: 'success' }
      );
      handleCloseModal();
    } catch (err: unknown) {
      console.error('Failed to create return:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      enqueueSnackbar(msg || 'Failed to process return. Please check return policy window.', { variant: 'error' });
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

  const handleAddReplacement = (product: PosProduct, variant: PosProductVariant) => {
    if (!variant.id) return;
    const variantId = variant.id;
    setExchangeReplacementItems(prev => {
      const existing = prev.find(i => i.variant_id === variantId);
      if (existing) {
        return prev.map(i => i.variant_id === variantId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          variant_id: variantId,
          item_name: `${product.name} - ${variant.title}`,
          unit_price: Number(variant.selling_price),
          quantity: 1,
        }
      ];
    });
  };

  const handleRemoveReplacement = (variantId: number) => {
    setExchangeReplacementItems(prev => prev.filter(i => i.variant_id !== variantId));
  };

  const exchangeReturnedTotal = useMemo(() => {
    if (!selectedOrderDetails?.items) return 0;
    let sum = 0;
    for (const item of selectedOrderDetails.items) {
      const q = exchangeReturnedItems[item.variant_id] || 0;
      if (q > 0) sum += Number(item.unit_price) * q;
    }
    return Number(sum.toFixed(2));
  }, [selectedOrderDetails, exchangeReturnedItems]);

  const exchangeReplacementTotal = useMemo(() => {
    let sum = 0;
    for (const item of exchangeReplacementItems) {
      sum += item.unit_price * item.quantity;
    }
    return Number(sum.toFixed(2));
  }, [exchangeReplacementItems]);

  const priceDifference = useMemo(() => {
    return Number((exchangeReplacementTotal - exchangeReturnedTotal).toFixed(2));
  }, [exchangeReplacementTotal, exchangeReturnedTotal]);

  const handleSubmitExchange = async () => {
    if (!selectedOrderId || !eligibility?.is_eligible || exchangeReplacementItems.length === 0) return;

    try {
      const returned_items = Object.entries(exchangeReturnedItems).map(([vId, qty]) => {
        const item = selectedOrderDetails?.items?.find(it => it.variant_id === parseInt(vId, 10));
        return {
          variant_id: parseInt(vId, 10),
          item_name: item?.item_name || 'Item',
          unit_price: item ? Number(item.unit_price) : 0,
          quantity: qty,
        };
      });

      await createExchangeMutation.mutateAsync({
        original_order_id: selectedOrderId,
        returned_items,
        replacement_items: exchangeReplacementItems,
        price_difference: priceDifference,
        payment_mode: exchangePaymentMode,
        notes: exchangeNotes.trim() || undefined,
      });

      enqueueSnackbar(
        'Exchange recorded successfully! Stock and order invoice status updated.',
        { variant: 'success' }
      );
      handleCloseModal();
    } catch (err: unknown) {
      console.error('Failed to create exchange:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      enqueueSnackbar(msg || 'Failed to process exchange. Please check return policy window.', { variant: 'error' });
    }
  };

  // Return Columns
  const returnColumns: Column<PosReturn>[] = [
    { 
      header: 'Return #', 
      key: 'return_number', 
      cell: (row) => <span className="font-mono font-bold text-slate-800">{row.return_number}</span> 
    },
    { 
      header: 'Original Invoice', 
      key: 'original_order_number', 
      cell: (row) => (
        <span className="font-mono text-emerald-700 font-semibold">
          #{row.original_order_number}
        </span>
      ) 
    },
    { 
      header: 'Return Date', 
      key: 'created_at',
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      header: 'Customer', 
      key: 'customer_name',
      cell: (row) => <span className="text-slate-700 font-medium">{row.customer_name}</span>
    },
    { 
      header: 'Returned Items & Sale Price', 
      key: 'items_summary', 
      cell: (row) => {
        if (Array.isArray(row.returned_items) && row.returned_items.length > 0) {
          return (
            <div className="space-y-1 py-0.5">
              {row.returned_items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold text-slate-800 block truncate max-w-[210px]">{item.item_name || `Item #${item.variant_id}`}</span>
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-500 font-mono">Qty: {item.quantity}</span>
                    {item.unit_price ? (
                      <span className="text-rose-700 font-bold font-mono bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded text-[10px]">
                        Taken @ {currencySymbol}{Number(item.unit_price).toFixed(2)} ea
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="max-w-[220px]">
            <span className="text-xs text-slate-700 truncate block font-medium">{row.items_summary || 'N/A'}</span>
            <span className="text-[10px] text-rose-600 font-medium">Refunded at original sale price</span>
          </div>
        );
      }
    },
    { 
      header: 'Refund Amount', 
      key: 'refund_amount', 
      cell: (row) => (
        <span className="font-bold text-rose-600 font-mono text-sm">
          -{currencySymbol}{Number(row.refund_amount).toFixed(2)}
        </span>
      ) 
    },
    { 
      header: 'Refund Mode', 
      key: 'refund_mode',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {row.refund_mode}
        </span>
      )
    },
    { 
      header: 'Notes', 
      key: 'notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 italic truncate max-w-[150px] block" title={row.notes || ''}>
          {row.notes || '-'}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status || 'processed'} />
    },
  ];

  // Exchange Columns
  const exchangeColumns: Column<PosExchange>[] = [
    { 
      header: 'Exchange #', 
      key: 'exchange_number', 
      cell: (row) => <span className="font-mono font-bold text-blue-800">{row.exchange_number}</span> 
    },
    { 
      header: 'Original Invoice', 
      key: 'original_order_number', 
      cell: (row) => (
        <span className="font-mono text-emerald-700 font-semibold">
          #{row.original_order_number}
        </span>
      ) 
    },
    { 
      header: 'Exchange Date', 
      key: 'created_at',
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      header: 'Customer', 
      key: 'customer_name',
      cell: (row) => <span className="text-slate-700 font-medium">{row.customer_name}</span>
    },
    { 
      header: 'Item Taken Back (Credit)', 
      key: 'returned_desc', 
      cell: (row) => {
        if (Array.isArray(row.returned_items) && row.returned_items.length > 0) {
          return (
            <div className="space-y-1 py-0.5">
              {row.returned_items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold text-rose-900 block truncate max-w-[190px]">{item.item_name || `Item #${item.variant_id}`}</span>
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-500 font-mono">Qty: {item.quantity}</span>
                    {item.unit_price ? (
                      <span className="text-rose-700 font-bold font-mono bg-rose-50 border border-rose-200 px-1 rounded text-[10px]">
                        Taken @ {currencySymbol}{Number(item.unit_price).toFixed(2)} (-{currencySymbol}{(Number(item.unit_price) * item.quantity).toFixed(2)})
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="max-w-[180px]">
            <span className="text-xs text-rose-700 truncate block font-medium">{row.returned_desc}</span>
            <span className="text-[10px] text-rose-600 font-medium">Credited at sale price</span>
          </div>
        );
      }
    },
    { 
      header: 'Replacement Given (Value)', 
      key: 'replacement_desc', 
      cell: (row) => {
        if (Array.isArray(row.replacement_items) && row.replacement_items.length > 0) {
          return (
            <div className="space-y-1 py-0.5">
              {row.replacement_items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold text-emerald-900 block truncate max-w-[190px]">{item.item_name || `Item #${item.variant_id}`}</span>
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="text-slate-500 font-mono">Qty: {item.quantity}</span>
                    {item.unit_price ? (
                      <span className="text-emerald-700 font-bold font-mono bg-emerald-50 border border-emerald-200 px-1 rounded text-[10px]">
                        Given @ {currencySymbol}{Number(item.unit_price).toFixed(2)} (+{currencySymbol}{(Number(item.unit_price) * item.quantity).toFixed(2)})
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="max-w-[180px]">
            <span className="text-xs text-emerald-700 truncate block font-medium">{row.replacement_desc}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Valued at catalog price</span>
          </div>
        );
      }
    },
    { 
      header: 'Price Diff', 
      key: 'price_difference', 
      cell: (row) => {
        const diff = Number(row.price_difference);
        return (
          <span className={`font-bold font-mono text-xs ${
            diff > 0 ? 'text-[#159A1D]' : diff < 0 ? 'text-rose-600' : 'text-slate-700'
          }`}>
            {diff > 0 ? `+${currencySymbol}${diff.toFixed(2)}` : diff < 0 ? `-${currencySymbol}${Math.abs(diff).toFixed(2)}` : `${currencySymbol}0.00`}
          </span>
        );
      }
    },
    { 
      header: 'Notes', 
      key: 'notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 italic truncate max-w-[150px] block" title={row.notes || ''}>
          {row.notes || '-'}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status || 'completed'} />
    },
  ];

  return (
    <div className="space-y-4">
      {/* Policy Banner */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#159A1D] text-white rounded-lg shadow-2xs">
            <ShieldCheck size={16} />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              Store Policy: Returns & Exchanges Window ({returnWindowDays} Days)
            </span>
            <p className="text-slate-600 text-[11.5px] mt-0.5">
              {receiptSettings.returnPolicy || `Returns accepted within ${returnWindowDays} days with original receipt.`}
            </p>
          </div>
        </div>

        <Button 
          type="button" 
          size="sm" 
          onClick={() => {
            setProcessType('return');
            setCurrentTimestamp(Date.now());
            setIsProcessModalOpen(true);
          }}
          className="gap-2 font-semibold shadow-xs"
        >
          <RotateCcw size={15} />
          <span>Process Return / Exchange</span>
        </Button>
      </div>

      {/* Main Table Container with Sub-Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView('returns')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'returns'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RotateCcw size={13} className={activeView === 'returns' ? 'text-rose-600' : ''} />
                <span>Returns & Refunds ({returns.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('exchanges')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'exchanges'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight size={13} className={activeView === 'exchanges' ? 'text-blue-600' : ''} />
                <span>Exchanges History ({exchanges.length})</span>
              </button>
            </div>
          </div>

          <div className="w-72">
            <PosSearchInput
              placeholder={activeView === 'returns' ? "Search return # or invoice #..." : "Search exchange # or invoice #..."}
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setReturnsPage(1);
                setExchangesPage(1);
              }}
            />
          </div>
        </div>

        {activeView === 'returns' ? (
          <DataTable 
            data={returns} 
            columns={returnColumns} 
            isLoading={isReturnsLoading}
            emptyMessage="No returns recorded yet. Click 'Process Return / Exchange' to start."
            onRowClick={(row) => setSelectedReturnDetails(row)}
            pagination={returnsData?.pagination ? {
              currentPage: returnsData.pagination.page,
              totalPages: returnsData.pagination.totalPages,
              totalItems: returnsData.pagination.total,
              itemsPerPage: returnsData.pagination.limit,
              itemName: 'returns',
              onPageChange: (p) => setReturnsPage(p),
              itemsPerPageOptions: [10, 15, 25, 50],
              onItemsPerPageChange: (l) => {
                setReturnsLimit(l);
                setReturnsPage(1);
              },
            } : undefined}
          />
        ) : (
          <DataTable 
            data={exchanges} 
            columns={exchangeColumns} 
            isLoading={isExchangesLoading}
            emptyMessage="No exchanges recorded yet."
            onRowClick={(row) => setSelectedExchangeDetails(row)}
            pagination={exchangesData?.pagination ? {
              currentPage: exchangesData.pagination.page,
              totalPages: exchangesData.pagination.totalPages,
              totalItems: exchangesData.pagination.total,
              itemsPerPage: exchangesData.pagination.limit,
              itemName: 'exchanges',
              onPageChange: (p) => setExchangesPage(p),
              itemsPerPageOptions: [10, 15, 25, 50],
              onItemsPerPageChange: (l) => {
                setExchangesLimit(l);
                setExchangesPage(1);
              },
            } : undefined}
          />
        )}
      </div>

      {/* ======================================================== */}
      {/* Process Return & Policy Verification Modal               */}
      {/* ======================================================== */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={handleCloseModal}
        title={processType === 'return' ? "Process Return & Refund" : "Process Item Exchange"}
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-1">
          {/* Action Switcher inside Modal */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setProcessType('return')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                processType === 'return' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw size={13} className="text-rose-600" />
              <span>Return & Refund</span>
            </button>
            <button
              type="button"
              onClick={() => setProcessType('exchange')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                processType === 'exchange' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight size={13} className="text-blue-600" />
              <span>Product Exchange</span>
            </button>
          </div>

          {/* Step 1: Select Original Order */}
          {!selectedOrderId ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Search and select the original sales invoice below to verify return window eligibility:
              </p>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type invoice # (e.g. INV-10001) or customer name..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                />
              </div>

              {/* Order Selection List */}
              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {isOrdersLoading ? (
                  <div className="py-8 flex justify-center text-slate-400">
                    <div className="h-5 w-5 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No orders match your search.
                  </p>
                ) : (
                  orders.map(order => {
                    const orderDate = new Date(order.order_date);
                    const daysAgo = Math.max(0, Math.floor((currentTimestamp - orderDate.getTime()) / (1000 * 60 * 60 * 24)));
                    const isWithin = returnWindowDays > 0 && daysAgo <= returnWindowDays;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="p-3 bg-white border border-slate-200 hover:border-[#159A1D] rounded-xl cursor-pointer transition-all hover:shadow-xs flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 font-mono">
                              #{order.order_number}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isWithin 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isWithin ? `${daysAgo}d ago (Eligible)` : `${daysAgo}d ago (Window Expired)`}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span>Customer: {order.customer_name}</span>
                            <span>•</span>
                            <span>{orderDate.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold font-mono text-slate-900 block text-sm">
                            {currencySymbol}{Number(order.grand_total).toFixed(2)}
                          </span>
                          <span className="text-[11px] text-[#159A1D] font-semibold flex items-center gap-1 justify-end">
                            Select <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Policy Verification & Action Form */
            <div className="space-y-4">
              {/* Selected Order Summary Header */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Selected Order:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    #{selectedOrderDetails?.order_number || eligibility?.order_number}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Customer: {selectedOrderDetails?.customer_name || eligibility?.customer_name}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOrderId(null);
                    setSelectedItems({});
                    setExchangeReturnedItems({});
                    setExchangeReplacementItems([]);
                  }}
                  className="text-xs h-7"
                >
                  Change Order
                </Button>
              </div>

              {/* Policy Eligibility Box */}
              {isCheckingEligibility || isSelectedOrderLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="h-5 w-5 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Verifying return policy window & order items...</span>
                </div>
              ) : eligibilityError || !eligibility ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2 text-rose-800">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Unable to verify order eligibility</p>
                      <p className="text-slate-600 mt-0.5">
                        {(eligibilityError as unknown as { response?: { data?: { error?: string } } })?.response?.data?.error || 
                         'Order details or return policy could not be loaded.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-3.5 rounded-xl border ${
                  eligibility.is_eligible 
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {eligibility.is_eligible ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-sm">
                        {eligibility.is_eligible ? 'Order is Eligible for Return / Exchange' : 'Return Window Expired'}
                      </p>
                      <p className="text-[11.5px] leading-relaxed">
                        {eligibility.policy_message}
                      </p>
                      <div className="pt-1.5 flex gap-4 text-[11px] font-mono text-slate-600">
                        <span>Purchased: {new Date(eligibility.order_date).toLocaleDateString()}</span>
                        <span>Elapsed: {eligibility.days_elapsed} days</span>
                        <span>Policy Window: {eligibility.return_window_days} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Content: Only if Eligible */}
              {eligibility?.is_eligible ? (
                processType === 'return' ? (
                  /* ============ RETURN & REFUND FLOW ============ */
                  <>
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
                        {selectedOrderDetails?.items?.map(item => {
                          const currentQty = selectedItems[item.variant_id] || 0;
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
                                    onChange={e => handleItemQtyChange(item.variant_id, maxQty, parseInt(e.target.value) || 0)}
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
                          <option value="Size / Variant Exchange">Size / Variant Exchange</option>
                          <option value="Expired Product">Expired Product</option>
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
                          <option value="Card">Original Card</option>
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

                    <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Total Refund Due:</span>
                        <span className="text-[11px] text-slate-500">Inventory will be automatically restocked</span>
                      </div>
                      <span className="text-lg font-bold font-mono text-rose-600">
                        {currencySymbol}{calculatedRefund.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={calculatedRefund <= 0 || createReturnMutation.isPending}
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
                            <span>Complete Return ({currencySymbol}{calculatedRefund.toFixed(2)})</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* ============ EXCHANGE FLOW ============ */
                  <>
                    {/* Items Being Returned */}
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
                        {selectedOrderDetails?.items?.map(item => {
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

                    {/* Replacement Items */}
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
                          value={catalogSearch}
                          onChange={e => setCatalogSearch(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                        />
                      </div>

                      {/* Search Results Dropdown */}
                      {catalogSearch.trim() && catalogProducts.length > 0 && (
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

                      {/* Selected Replacement Items */}
                      <div className="min-h-14 max-h-28 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50 text-xs">
                        {exchangeReplacementItems.length === 0 ? (
                          <p className="text-center py-3 text-slate-400 text-[11px]">
                            Search and select a replacement variant from catalog above.
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

                    {/* Payment Mode if diff != 0 */}
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

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCloseModal}
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
                )
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-rose-700 font-semibold">
                    According to store settings, returns cannot be processed after the {eligibility?.return_window_days}-day limit.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCloseModal}
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
      {/* Return Details Modal (On row click)                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(selectedReturnDetails)}
        onClose={() => setSelectedReturnDetails(null)}
        title={`Return Details — #${selectedReturnDetails?.return_number || ''}`}
        cancelText="Close"
      >
        {selectedReturnDetails && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Top Summary Card */}
            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Refund Amount</span>
                <span className="text-xl font-bold font-mono text-rose-600">
                  -{currencySymbol}{Number(selectedReturnDetails.refund_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg font-semibold">
                  {selectedReturnDetails.refund_mode}
                </span>
                <PosStatusBadge status={selectedReturnDetails.status || 'processed'} />
              </div>
            </div>

            {/* Order & Return Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10.5px]">Original Invoice</span>
                <span className="font-mono font-bold text-slate-800">#{selectedReturnDetails.original_order_number}</span>
                {selectedReturnDetails.order_date && (
                  <span className="text-[10.5px] text-slate-500 block">
                    Bought: {new Date(selectedReturnDetails.order_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">Customer</span>
                <span className="font-bold text-slate-800 block">{selectedReturnDetails.customer_name || 'Walk-in Customer'}</span>
                <span className="text-[10.5px] text-slate-500">
                  Processed: {new Date(selectedReturnDetails.created_at).toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block text-[10.5px]">Reason for Return</span>
                <span className="font-semibold text-slate-700">{selectedReturnDetails.reason || 'Customer Return'}</span>
              </div>
            </div>

            {/* Returned Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 block text-xs">
                  Items Returned & Restocked (Credited @ Sale Price):
                </label>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Original Invoice Price
                </span>
              </div>

              {Array.isArray(selectedReturnDetails.returned_items) && selectedReturnDetails.returned_items.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {selectedReturnDetails.returned_items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-semibold text-slate-900 block text-xs">{item.item_name || `Item #${item.variant_id}`}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>Qty Returned: <strong className="text-slate-800 font-mono">{item.quantity}</strong></span>
                          {item.unit_price ? (
                            <span>• Taken Back @ <strong className="text-rose-700 font-mono">{currencySymbol}{Number(item.unit_price).toFixed(2)} ea</strong> (Sale Price)</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {item.unit_price ? (
                          <>
                            <span className="font-mono font-bold text-rose-600 text-sm block">
                              -{currencySymbol}{(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Refund Credit</span>
                          </>
                        ) : (
                          <span className="font-mono font-bold text-slate-700 text-xs">x{item.quantity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 font-medium">{selectedReturnDetails.items_summary || 'Returned items'}</span>
                  <span className="text-[10.5px] text-slate-400 block">Refund calculated at original sale price</span>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {selectedReturnDetails.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block text-[11px] mb-0.5">Return Notes:</span>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedReturnDetails.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* Exchange Details Modal (On row click)                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(selectedExchangeDetails)}
        onClose={() => setSelectedExchangeDetails(null)}
        title={`Exchange Details — #${selectedExchangeDetails?.exchange_number || ''}`}
        cancelText="Close"
      >
        {selectedExchangeDetails && (() => {
          const diff = Number(selectedExchangeDetails.price_difference);
          return (
            <div className="space-y-4 pt-1 text-xs">
              {/* Top Summary Card */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 ${
                diff > 0
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : diff < 0
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-blue-50/80 border-blue-200 text-blue-900'
              }`}>
                <div>
                  <span className="text-slate-500 block text-[11px]">
                    {diff > 0 ? 'Customer Paid Difference' : diff < 0 ? 'Store Refunded Difference' : 'Even Exchange'}
                  </span>
                  <span className={`text-xl font-bold font-mono ${
                    diff > 0 ? 'text-[#159A1D]' : diff < 0 ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {diff > 0 ? `+${currencySymbol}${diff.toFixed(2)}` : diff < 0 ? `-${currencySymbol}${Math.abs(diff).toFixed(2)}` : `${currencySymbol}0.00`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {diff !== 0 && (
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-semibold">
                      Tender: {selectedExchangeDetails.payment_mode || 'Cash'}
                    </span>
                  )}
                  <PosStatusBadge status={selectedExchangeDetails.status || 'completed'} />
                </div>
              </div>

              {/* Order & Exchange Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Original Invoice</span>
                  <span className="font-mono font-bold text-slate-800">#{selectedExchangeDetails.original_order_number}</span>
                  {selectedExchangeDetails.order_date && (
                    <span className="text-[10.5px] text-slate-500 block">
                      Purchased: {new Date(selectedExchangeDetails.order_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Customer</span>
                  <span className="font-bold text-slate-800 block">{selectedExchangeDetails.customer_name || 'Walk-in Customer'}</span>
                  <span className="text-[10.5px] text-slate-500">
                    Exchanged: {new Date(selectedExchangeDetails.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items Breakdown: 2 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Returned Items */}
                <div className="p-3 bg-rose-50/40 border border-rose-200/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 block text-xs">
                      1. Items Taken Back (Restocked):
                    </span>
                    <span className="text-[10px] text-rose-700 bg-rose-100/70 font-semibold px-1.5 py-0.5 rounded">
                      Sale Price Credit
                    </span>
                  </div>
                  {Array.isArray(selectedExchangeDetails.returned_items) && selectedExchangeDetails.returned_items.length > 0 ? (
                    <div className="divide-y divide-rose-100 bg-white border border-rose-200 rounded-lg overflow-hidden">
                      {selectedExchangeDetails.returned_items.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-[11.5px]">
                          <div>
                            <span className="font-semibold text-slate-900 block">{item.item_name}</span>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 mt-0.5">
                              <span>Qty Taken: <strong className="font-mono text-slate-800">{item.quantity}</strong></span>
                              {item.unit_price ? (
                                <span>• Taken @ <strong className="font-mono text-rose-700">{currencySymbol}{Number(item.unit_price).toFixed(2)} ea</strong> (Sale Price)</span>
                              ) : null}
                            </div>
                          </div>
                          {item.unit_price ? (
                            <span className="font-mono font-bold text-rose-600 shrink-0">
                              -{currencySymbol}{(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-rose-200 text-xs">
                      {selectedExchangeDetails.returned_desc}
                    </p>
                  )}
                </div>

                {/* 2. Replacement Items */}
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 block text-xs">
                      2. Replacement Items Given (Deducted):
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-semibold px-1.5 py-0.5 rounded">
                      Catalog Price Value
                    </span>
                  </div>
                  {Array.isArray(selectedExchangeDetails.replacement_items) && selectedExchangeDetails.replacement_items.length > 0 ? (
                    <div className="divide-y divide-emerald-100 bg-white border border-emerald-200 rounded-lg overflow-hidden">
                      {selectedExchangeDetails.replacement_items.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-[11.5px]">
                          <div>
                            <span className="font-semibold text-slate-900 block">{item.item_name}</span>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 mt-0.5">
                              <span>Qty Given: <strong className="font-mono text-slate-800">{item.quantity}</strong></span>
                              {item.unit_price ? (
                                <span>• Given @ <strong className="font-mono text-emerald-700">{currencySymbol}{Number(item.unit_price).toFixed(2)} ea</strong> (Catalog Price)</span>
                              ) : null}
                            </div>
                          </div>
                          {item.unit_price ? (
                            <span className="font-mono font-bold text-emerald-700 shrink-0">
                              +{currencySymbol}{(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-emerald-200 text-xs">
                      {selectedExchangeDetails.replacement_desc}
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Exchange Pricing Breakdown */}
              <div className="p-3 bg-slate-100/80 rounded-xl space-y-1.5 text-xs border border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Value Taken Back (Sale Price Credit):</span>
                  <span className="font-mono font-bold text-rose-600">
                    -{currencySymbol}{
                      (selectedExchangeDetails.returned_items?.reduce((sum, it) => sum + (Number(it.unit_price || 0) * it.quantity), 0) || 0).toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Value Given to Customer (Catalog Price):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{currencySymbol}{
                      (selectedExchangeDetails.replacement_items?.reduce((sum, it) => sum + (Number(it.unit_price || 0) * it.quantity), 0) || 0).toFixed(2)
                    }
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold">
                  <div>
                    <span className="text-slate-800 block text-xs font-bold">
                      {diff > 0 ? 'Net Extra Paid by Customer:' : diff < 0 ? 'Net Store Refund to Customer:' : 'Even Exchange Balance:'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tender Mode: {selectedExchangeDetails.payment_mode || 'Cash'}
                    </span>
                  </div>
                  <span className={`text-base font-bold font-mono ${
                    diff > 0 ? 'text-[#159A1D]' : diff < 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}>
                    {diff > 0 ? `+${currencySymbol}${diff.toFixed(2)}` : diff < 0 ? `-${currencySymbol}${Math.abs(diff).toFixed(2)}` : `${currencySymbol}0.00`}
                  </span>
                </div>
              </div>

              {/* Notes Section */}
              {selectedExchangeDetails.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900 block text-[11px] mb-0.5">Exchange Notes:</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedExchangeDetails.notes}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
