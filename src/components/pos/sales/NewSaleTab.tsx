"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  ScanBarcode, 
  Plus, 
  CreditCard, 
  Banknote, 
  User, 
  Smartphone,
  Printer,
  Check,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Barcode,
  Phone,
} from 'lucide-react';
import { usePosSettings } from '@/components/pos/settings/PosSettingsContext';
import { PosSearchInput, PosReceipt, PosReceiptData, printThermalReceipt } from '@/components/pos/common';
import { Button } from '@/components/ui/button';
import { useGetInfinitePosProducts, useGetPosCategories, PosProduct, PosProductVariant } from '@/hooks/queries/posProducts';
import { useCreatePosOrder, PosOrder, CreatePosOrderPayload } from '@/hooks/queries/posOrders';
import { useSnackbar } from 'notistack';

export interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  variantTitle: string;
  sku: string;
  barcode?: string | null;
  unitPrice: number;
  unitCost: number;
  qty: number;
  maxStock: number;
}

interface ProductVariantGroup {
  product: PosProduct;
  variants: PosProductVariant[];
}

export default function NewSaleTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { receiptSettings } = usePosSettings();
  const currencySymbol = receiptSettings.currencySymbol || '$';

  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTender, setSelectedTender] = useState<'Cash' | 'Card' | 'UPI'>('Cash');

  // Scanner modal state
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scanModalInput, setScanModalInput] = useState('');

  // Customer details modal (direct edit)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Checkout confirmation modal (asks for customer & payment before checkout)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Success / Receipt Modal
  const [completedOrder, setCompletedOrder] = useState<PosOrder | null>(null);

  // Debounce search query so backend pagination triggers smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Backend Infinite Query (Infinite Scroll Pagination inside container)
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isProductsLoading,
  } = useGetInfinitePosProducts({
    search: debouncedSearch.trim() || undefined,
    category_id: activeCategoryId === 'all' ? undefined : activeCategoryId,
    status: 'active',
    limit: 10,
  });

  const { data: categoriesData } = useGetPosCategories();
  const createOrderMutation = useCreatePosOrder();

  // Active Catalog List flattened across all loaded pages
  const catalogProducts: PosProduct[] = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.data) || [];
  }, [infiniteData]);

  const totalProductsCount = infiniteData?.pages[0]?.pagination?.total ?? catalogProducts.length;

  // Dedicated container scroll handler for infinite load on scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 120) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  // Reset scroll to top when category or search changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeCategoryId, debouncedSearch]);

  // Add a specific variant to the sale ticket
  const addVariantToCart = (product: PosProduct, variant: PosProductVariant) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variantId === variant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id || 0,
          productName: product.name,
          variantTitle: variant.title,
          sku: variant.sku || `SKU-${product.id}`,
          barcode: variant.barcode || null,
          unitPrice: Number(variant.selling_price) || 0,
          unitCost: Number(variant.cost_price) || 0,
          qty: 1,
          maxStock: Number(variant.stock_quantity) || 999,
        },
      ];
    });
  };

  const updateQty = (variantId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.variantId === variantId) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (variantId: number) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Barcode quick add scanner handler
  const handleBarcodeSearch = (scannedCode: string) => {
    const code = scannedCode.trim().toLowerCase();
    if (!code) return;

    for (const product of catalogProducts) {
      const variants = product.variants || [];
      const match = variants.find(
        v =>
          (v.barcode && String(v.barcode).toLowerCase() === code) ||
          (v.sku && v.sku.toLowerCase() === code)
      );
      if (match) {
        addVariantToCart(product, match);
        return true;
      }
    }
    return false;
  };

  const handleScanInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanModalInput.trim()) return;
    const found = handleBarcodeSearch(scanModalInput);
    if (found) {
      setScanModalInput('');
      setIsScannerModalOpen(false);
    } else {
      enqueueSnackbar(`No product found with barcode/code: "${scanModalInput}"`, { variant: 'warning' });
    }
  };

  // Intercept Enter key in search box for instant barcode scan support
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const found = handleBarcodeSearch(searchQuery);
      if (found) {
        setSearchQuery('');
      }
    }
  };

  // =========================================================================
  // Product & Variant Hierarchical Filter Logic
  // When user searches for code/barcode/variant title:
  // Shows parent product with ONLY the matching variant(s)
  // When user searches product name:
  // Shows parent product with all its variants
  const filteredProductGroups: ProductVariantGroup[] = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return catalogProducts
      .map(product => {
        // Active variants or fallback standard
        const allVariants: PosProductVariant[] =
          product.variants && product.variants.length > 0
            ? product.variants.filter(v => v.is_active !== false)
            : [
                {
                  id: product.id,
                  product_id: product.id,
                  title: 'Standard',
                  sku: `SKU-${product.id}`,
                  barcode: null,
                  selling_price: product.min_price || 0,
                  cost_price: 0,
                  stock_quantity: product.total_stock || 0,
                  is_active: true,
                } as PosProductVariant,
              ];

        // 1. No search query: return product with all its variants
        if (!q) {
          return {
            product,
            variants: allVariants,
          };
        }

        // 2. Search query is present:
        // Check if specific variants match by barcode, SKU code, or variant title
        const specificMatchingVariants = allVariants.filter(v => {
          const barcodeMatch = v.barcode && String(v.barcode).toLowerCase().includes(q);
          const skuMatch = v.sku && v.sku.toLowerCase().includes(q);
          const titleMatch = v.title && v.title.toLowerCase().includes(q);
          return barcodeMatch || skuMatch || titleMatch;
        });

        // If specific variants match (by barcode/code/title), show the product with ONLY those matching variants!
        if (specificMatchingVariants.length > 0) {
          return {
            product,
            variants: specificMatchingVariants,
          };
        }

        // Otherwise, if parent product name or description matches, show the product with all its variants
        const productNameMatches =
          product.name.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q));

        if (productNameMatches) {
          return {
            product,
            variants: allVariants,
          };
        }

        return {
          product,
          variants: allVariants,
        };
      })
      .filter(Boolean) as ProductVariantGroup[];
  }, [catalogProducts, debouncedSearch]);

  // Calculations
  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cart]);

  const taxes = receiptSettings.taxes && receiptSettings.taxes.length > 0
    ? receiptSettings.taxes
    : [{ id: 'tax-1', name: 'Sales Tax', percentage: 8.0 }];

  const totalTaxPercentage = taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);

  const taxAmount = receiptSettings.isTaxInclusive
    ? (subtotal * totalTaxPercentage) / (100 + totalTaxPercentage)
    : (subtotal * totalTaxPercentage) / 100;

  const grandTotal = receiptSettings.isTaxInclusive
    ? subtotal
    : subtotal + taxAmount;

  // Complete Order & Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const payload: CreatePosOrderPayload = {
        customer_name: customerName.trim() || 'Walk-in Customer',
        customer_phone: customerPhone.trim() || undefined,
        register_label: 'Terminal #01',
        subtotal: Number(subtotal.toFixed(2)),
        discount_total: 0.0,
        tax_total: Number(taxAmount.toFixed(2)),
        grand_total: Number(grandTotal.toFixed(2)),
        payment_mode: selectedTender,
        payment_amount: Number(grandTotal.toFixed(2)),
        payment_reference: selectedTender === 'UPI' ? receiptSettings.upiId : undefined,
        receipt_config: receiptSettings,
        items: cart.map(item => ({
          variant_id: item.variantId,
          item_name: `${item.productName}${item.variantTitle && item.variantTitle !== 'Default' && item.variantTitle !== 'Standard' ? ` (${item.variantTitle})` : ''}`,
          sku: item.sku,
          quantity: item.qty,
          unit_price: item.unitPrice,
          unit_cost: item.unitCost,
          discount_amount: 0,
          tax_amount: Number(((item.unitPrice * item.qty * totalTaxPercentage) / 100).toFixed(2)),
          total_amount: Number((item.unitPrice * item.qty).toFixed(2)),
        })),
      };

      const result = await createOrderMutation.mutateAsync(payload);
      setCompletedOrder(result);
      setIsCheckoutModalOpen(false);
      enqueueSnackbar(`Order #${result.order_number || ''} completed successfully!`, { variant: 'success' });

      if (receiptSettings.autoPrintReceipt) {
        setTimeout(() => {
          printThermalReceipt('pos-completed-receipt');
        }, 500);
      }
    } catch (err: unknown) {
      console.error('Checkout failed:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      enqueueSnackbar(msg || 'Failed to complete sale. Please try again.', { variant: 'error' });
    }
  };

  const handleStartNextSale = () => {
    setCompletedOrder(null);
    clearCart();
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setIsCheckoutModalOpen(false);
  };

  // Structured Receipt Data for Current Sale
  const currentReceiptData: PosReceiptData = useMemo(() => ({
    orderNumber: '#DRAFT-SALE',
    title: 'Tax Invoice / Current Sale',
    date: new Date(),
    registerLabel: 'Terminal #01 (Active)',
    cashierName: 'Store Lead',
    customerName,
    customerPhone: customerPhone || null,
    items: cart.map(item => ({
      id: item.variantId,
      name: item.productName,
      variantTitle: item.variantTitle,
      sku: item.sku,
      barcode: item.barcode,
      price: item.unitPrice,
      qty: item.qty,
      total: item.unitPrice * item.qty,
    })),
    subtotal,
    discountTotal: 0,
    taxTotal: taxAmount,
    taxes: taxes.map(t => ({
      id: t.id,
      name: t.name,
      percentage: t.percentage,
      amount: (subtotal * (Number(t.percentage) || 0)) / 100,
    })),
    grandTotal,
    paymentMode: selectedTender,
    paymentReference: selectedTender === 'UPI' ? receiptSettings.upiId : undefined,
  }), [
    customerName,
    customerPhone,
    cart,
    subtotal,
    taxAmount,
    taxes,
    grandTotal,
    selectedTender,
    receiptSettings.upiId,
  ]);

  // Structured Receipt Data for Completed Sale
  const completedReceiptData: PosReceiptData | null = useMemo(() => {
    if (!completedOrder) return null;
    return {
      orderNumber: completedOrder.order_number,
      title: 'Tax Invoice / Receipt',
      date: completedOrder.created_at || completedOrder.order_date,
      registerLabel: completedOrder.register_label || 'Terminal #01',
      cashierName: 'Store Lead',
      customerName: completedOrder.customer_name || 'Walk-in Customer',
      customerPhone: completedOrder.customer_phone || customerPhone || null,
      items: (completedOrder.items || []).map(item => ({
        id: item.id,
        name: item.item_name,
        sku: item.sku,
        price: Number(item.unit_price),
        qty: Number(item.quantity),
        total: Number(item.total_amount),
      })),
      subtotal: Number(completedOrder.subtotal),
      discountTotal: Number(completedOrder.discount_total || 0),
      taxTotal: Number(completedOrder.tax_total || 0),
      grandTotal: Number(completedOrder.grand_total),
      paymentMode: completedOrder.payment?.payment_mode || completedOrder.payment_mode || selectedTender,
      paymentReference: completedOrder.payment?.reference_number || undefined,
    };
  }, [completedOrder, customerPhone, selectedTender]);

  // Full address format for receipt
  const fullAddress = [
    receiptSettings.addressLine1,
    receiptSettings.addressLine2,
    [receiptSettings.city, receiptSettings.state, receiptSettings.postalCode].filter(Boolean).join(', ')
  ].filter(Boolean).join(', ');

  const currentDateDisplay = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[700px] items-start">
      {/* ======================================================== */}
      {/* Left Column: Product & Variant Tree Hierarchy            */}
      {/* Shows Product -> Nested Variants with Barcodes           */}
      {/* ======================================================== */}
      <div className="flex-1 w-full min-w-0 bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Top Header & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <PosSearchInput
            placeholder="Search by product name, SKU code, or scan barcode..."
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 min-w-[220px]"
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsScannerModalOpen(true)}
              title="Barcode Scanner Quick Input"
              className="gap-2 text-slate-700 hover:text-slate-900 border-slate-200"
            >
              <ScanBarcode size={16} className="text-[#159A1D]" />
              <span className="font-semibold text-xs">Scan Barcode</span>
            </Button>
          </div>
        </div>

        {/* Categories Filter Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/60 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategoryId === 'all'
                ? 'bg-[#159A1D] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Items ({totalProductsCount})
          </button>

          {(categoriesData || []).map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryId === cat.id
                  ? 'bg-[#159A1D] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name} {cat.product_count !== undefined ? `(${cat.product_count})` : ''}
            </button>
          ))}
        </div>

        {/* Products & Variants List */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[480px] p-4 space-y-3"
        >
          {isProductsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="h-6 w-6 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Loading store inventory...</p>
            </div>
          ) : filteredProductGroups.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <ShoppingBag size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">
                {debouncedSearch || activeCategoryId !== 'all'
                  ? 'No matching products or variants'
                  : 'No products in catalog yet'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {debouncedSearch || activeCategoryId !== 'all'
                  ? 'No items match your code, barcode, or category search.'
                  : 'Add products and inventory in the Products tab to start selling.'}
              </p>
            </div>
          ) : (
            filteredProductGroups.map(group => {
              return (
                <div
                  key={group.product.id}
                  className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs transition-all hover:border-slate-300"
                >
                  {/* Product Header Row */}
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#159A1D] shrink-0" />
                      <h4 className="font-bold text-slate-800 text-sm truncate">
                        {group.product.name}
                      </h4>
                      {group.product.category_name && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10.5px] font-medium shrink-0">
                          {group.product.category_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs shrink-0 text-slate-500">
                      <span className="text-[11px] font-medium text-slate-400">
                        {group.variants.length} {group.variants.length === 1 ? 'variant' : 'variants'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        Total Stock: {group.product.total_stock || 0}
                      </span>
                    </div>
                  </div>

                  {/* Variants List Nested Under Product */}
                  <div className="divide-y divide-slate-100">
                    {group.variants.map((v, idx) => {
                      const inCart = cart.find(c => c.variantId === v.id);
                      const isOutOfStock = (v.stock_quantity || 0) <= 0;

                      return (
                        <div
                          key={v.id || idx}
                          onClick={() => !isOutOfStock && addVariantToCart(group.product, v)}
                          className={`px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:bg-emerald-50/30 transition-colors cursor-pointer group ${
                            isOutOfStock ? 'opacity-60 cursor-not-allowed bg-slate-50/30' : ''
                          }`}
                        >
                          {/* Left: Variant Name, Barcode & SKU Code */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono text-xs">↳</span>
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-[#159A1D] transition-colors">
                                {v.title}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1 pl-4 text-[11px]">
                              {/* Barcode badge */}
                              {v.barcode ? (
                                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80 font-medium">
                                  <Barcode size={13} className="text-slate-600" />
                                  <span>{v.barcode}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 italic">
                                  <Barcode size={12} />
                                  <span>No Barcode</span>
                                </span>
                              )}

                              {/* SKU Code */}
                              {v.sku && (
                                <span className="font-mono text-slate-500 text-[10.5px]">
                                  SKU: {v.sku}
                                </span>
                              )}

                              {/* Stock status */}
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  isOutOfStock
                                    ? 'bg-rose-50 text-rose-700'
                                    : (v.stock_quantity || 0) <= 5
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isOutOfStock
                                      ? 'bg-rose-500'
                                      : (v.stock_quantity || 0) <= 5
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                {isOutOfStock ? 'Out of Stock' : `${v.stock_quantity} in stock`}
                              </span>
                            </div>
                          </div>

                          {/* Right: Price & Add Button */}
                          <div
                            className="flex items-center gap-3 shrink-0 ml-auto"
                            onClick={e => e.stopPropagation()}
                          >
                            <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                              ${Number(v.selling_price).toFixed(2)}
                            </span>

                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => addVariantToCart(group.product, v)}
                              className="px-3 py-1.5 bg-[#159A1D] hover:bg-[#128218] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                              {inCart && inCart.qty > 0 && (
                                <span className="bg-white/30 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none min-w-[16px] text-center">
                                  {inCart.qty}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Infinite Scroll Fetching / End of List Indicator */}
          {isFetchingNextPage && (
            <div className="py-3 flex items-center justify-center gap-2 text-xs font-medium text-[#159A1D] bg-white/80 border border-emerald-100 rounded-xl shadow-2xs">
              <div className="h-4 w-4 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
              <span>Loading more products...</span>
            </div>
          )}

          {!hasNextPage && catalogProducts.length > 0 && !isProductsLoading && (
            <div className="py-3 text-center text-[11px] font-medium text-slate-400">
              Showing all {totalProductsCount} products
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Right Column: "Current Sale" Thermal Receipt Format      */}
      {/* Matches the exact UI configured in POS Settings         */}
      {/* ======================================================== */}
      <div className="w-full xl:w-[480px] 2xl:w-[510px] shrink-0 flex flex-col gap-4">
        <PosReceipt
          data={currentReceiptData}
          mode="interactive"
          id="pos-thermal-receipt"
          settings={receiptSettings}
          onEditCustomer={() => setIsCustomerModalOpen(true)}
          onUpdateQty={handleUpdateItemQty}
          onRemoveItem={handleRemoveItem}
        />

        {/* Payment & Action Controls Area */}
        <div className="bg-white border border-slate-200/90 shadow-md rounded-2xl p-4 sm:p-5 font-sans no-print space-y-3.5">
          {/* Total Payable Summary */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Payable
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {cart.reduce((sum, item) => sum + item.qty, 0)} {cart.reduce((sum, item) => sum + item.qty, 0) === 1 ? 'item' : 'items'}
              </span>
            </div>
            <span className="text-xl font-extrabold font-mono text-[#159A1D]">
              {currencySymbol}{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTender('Cash')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedTender === 'Cash'
                    ? 'border-[#159A1D] bg-emerald-50/80 text-[#159A1D] shadow-2xs ring-1 ring-[#159A1D]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote size={15} />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTender('Card')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedTender === 'Card'
                    ? 'border-[#159A1D] bg-emerald-50/80 text-[#159A1D] shadow-2xs ring-1 ring-[#159A1D]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={15} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTender('UPI')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  selectedTender === 'UPI'
                    ? 'border-[#159A1D] bg-emerald-50/80 text-[#159A1D] shadow-2xs ring-1 ring-[#159A1D]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone size={15} />
                <span>UPI</span>
              </button>
            </div>
          </div>

          {/* Bottom Actions: Clear & Checkout */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cart.length === 0 || createOrderMutation.isPending}
              onClick={clearCart}
              className="gap-1 text-slate-500 hover:text-rose-600 border-slate-200"
              title="Clear current cart"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </Button>

            <Button
              type="button"
              disabled={cart.length === 0 || createOrderMutation.isPending}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="flex-1 py-2.5 font-bold text-sm gap-2"
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Sale...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Complete Sale ({currencySymbol}{grandTotal.toFixed(2)})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Barcode Scanner Modal Input                              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isScannerModalOpen}
        onClose={() => {
          setIsScannerModalOpen(false);
          setScanModalInput('');
        }}
        title="Scan or Enter Barcode"
        cancelText="Cancel"
      >
        <form onSubmit={handleScanInputSubmit} className="space-y-4 pt-1">
          <p className="text-xs text-slate-500">
            Scan with a handheld laser scanner or manually type the product barcode / SKU code below:
          </p>

          <PosSearchInput
            autoFocus
            leftIcon={ScanBarcode}
            sizeVariant="md"
            placeholder="e.g. 890123328331 or ESP-250G"
            value={scanModalInput}
            onChange={setScanModalInput}
            inputClassName="font-mono"
            className="w-full"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsScannerModalOpen(false);
                setScanModalInput('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Plus size={15} />
              <span>Add to Ticket</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* Customer Details Modal (Direct edit from ticket)         */}
      {/* ======================================================== */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Customer Details"
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomerName('Walk-in Customer')}
                className="text-xs"
              >
                Walk-in
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Mobile / Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +1 555-0199 or 9876543210"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Saved in sales order record and printed on customer receipt.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              size="sm"
            >
              Save Details
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* Checkout & Customer Details Modal                        */}
      {/* Asks for Customer Name and Number before Checkout        */}
      {/* ======================================================== */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Sale & Customer Details"
        cancelText="Back to Ticket"
      >
        <div className="space-y-4 pt-1">
          {/* Customer Details Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Customer Information
              </span>
              <button
                type="button"
                onClick={() => setCustomerName('Walk-in Customer')}
                className="text-[11px] text-[#159A1D] hover:underline font-semibold"
              >
                Reset to Walk-in
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer Name <span className="text-slate-400 font-normal">(Default: Walk-in Customer)</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. John Doe or Walk-in Customer"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer Mobile / Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="e.g. +1 555-0199 or 9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                />
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Saved in sales order record and printed on customer receipt.
              </p>
            </div>
          </div>

          {/* Payment & Amount Confirmation */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Items in ticket:</span>
              <span className="font-bold text-slate-800">{totalItemsCount} units</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Payment Tender:</span>
              <span className="font-bold text-slate-900">{selectedTender}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-emerald-200/80 font-bold text-sm">
              <span className="text-slate-900">Total Payable:</span>
              <span className="text-[#159A1D] font-mono text-base">{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
              className="gap-1.5 font-bold"
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Sale...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Confirm & Complete Sale (${grandTotal.toFixed(2)})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* Sale Completed & Thermal Printable Receipt Modal        */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(completedOrder)}
        onClose={handleStartNextSale}
        title="Sale Completed Successfully"
        cancelText="Close"
      >
        <div className="space-y-4 text-center">
          {/* Success Banner */}
          <div className="flex flex-col items-center justify-center p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#159A1D] text-white flex items-center justify-center mb-1.5 shadow-sm">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Payment Received!</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Receipt #{completedOrder?.order_number} recorded via {completedOrder?.payment?.payment_mode || selectedTender}.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-left grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Customer:</span>
              <span className="font-semibold text-slate-800 truncate block">
                {completedOrder?.customer_name}
              </span>
              {completedOrder?.customer_phone && (
                <span className="font-mono text-slate-500 text-[10.5px]">
                  {completedOrder.customer_phone}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Total Paid:</span>
              <span className="font-bold text-[#159A1D] font-mono text-sm">
                ${completedOrder?.grand_total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Proper Thermal Receipt UI preview & print target */}
          <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 p-2 bg-slate-50/50 flex justify-center">
            {completedReceiptData && (
              <PosReceipt
                data={completedReceiptData}
                mode="static"
                id="pos-completed-receipt"
                settings={completedOrder?.receipt_config || receiptSettings}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 no-print">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => printThermalReceipt('pos-completed-receipt')}
              className="gap-2 text-slate-700 font-semibold"
            >
              <Printer size={15} />
              <span>Print Receipt</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleStartNextSale}
              className="gap-2"
            >
              <Sparkles size={15} />
              <span>Start Next Sale</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
