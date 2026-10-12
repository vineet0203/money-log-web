"use client";

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  ScanBarcode, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  User, 
  QrCode, 
  Smartphone,
  Printer
} from 'lucide-react';
import { usePosSettings } from '@/components/pos/settings/PosSettingsContext';
import { PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Premium Espresso Blend', category: 'Coffee', price: 18.50, stock: 45, sku: 'COF-001', image: 'bg-amber-800' },
  { id: 2, name: 'Ceramic Pour-Over Dripper', category: 'Equipment', price: 24.00, stock: 12, sku: 'EQP-102', image: 'bg-slate-400' },
  { id: 3, name: 'Oat Milk Barista Edition', category: 'Dairy', price: 5.50, stock: 80, sku: 'DRY-201', image: 'bg-amber-200' },
  { id: 4, name: 'Ethiopia Yirgacheffe Beans', category: 'Coffee', price: 22.00, stock: 30, sku: 'COF-002', image: 'bg-amber-700' },
  { id: 5, name: 'Digital Coffee Scale', category: 'Equipment', price: 35.00, stock: 8, sku: 'EQP-105', image: 'bg-slate-700' },
  { id: 6, name: 'Reusable Coffee Filter', category: 'Equipment', price: 12.00, stock: 25, sku: 'EQP-109', image: 'bg-zinc-400' },
  { id: 7, name: 'Cold Brew Blend (1kg)', category: 'Coffee', price: 26.50, stock: 19, sku: 'COF-003', image: 'bg-amber-900' },
  { id: 8, name: 'Stainless Steel Milk Pitcher', category: 'Equipment', price: 16.00, stock: 15, sku: 'EQP-112', image: 'bg-slate-500' },
  { id: 9, name: 'Organic Almond Milk', category: 'Dairy', price: 4.75, stock: 42, sku: 'DRY-204', image: 'bg-stone-300' },
  { id: 10, name: 'Canvas Barista Apron', category: 'Accessories', price: 29.00, stock: 14, sku: 'ACC-301', image: 'bg-emerald-800' },
];

const CATEGORIES = ['All', 'Coffee', 'Equipment', 'Dairy', 'Accessories'];

export default function NewSaleTab() {
  const { receiptSettings, generalSettings } = usePosSettings();
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalState, setPaymentModalState] = useState<'closed' | 'select' | 'upi'>('closed');
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  }, [cart]);

  const tax = (subtotal * generalSettings.defaultTaxRate) / 100;
  const total = subtotal + tax;

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleScanMock = () => {
    // Quick barcode scan simulation: adds the first coffee item
    const itemToScan = MOCK_PRODUCTS[0];
    addToCart(itemToScan);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[620px]">
      {/* Products Section (Listing View by default) */}
      <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Header / Search & View Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white">
          <PosSearchInput 
            placeholder="Search products by name or SKU..." 
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1 min-w-[200px]"
          />

          <Button 
            variant="outline"
            size="sm"
            onClick={handleScanMock}
            title="Scan barcode to add product"
            className="gap-2"
          >
            <ScanBarcode size={18} className="text-slate-600" />
            <span>Scan</span>
          </Button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/50">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-[#159A1D] text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Table Listing */}
        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map(product => {
                  const inCart = cart.find(item => item.product.id === product.id);
                  return (
                    <tr 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-[#159A1D] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {product.sku}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.stock <= 10 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.stock <= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => addToCart(product)}
                          className="px-3 py-1.5 bg-[#159A1D] hover:bg-[#128218] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Plus size={14} /> 
                          <span>Add</span>
                          {inCart && (
                            <span className="bg-white/25 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none min-w-[16px] text-center">
                              {inCart.qty}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm font-medium">No products match your criteria</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or category filter</p>
              </div>
            )}
          </div>
        </div>

      {/* Cart Section (Wide Current Sale Area) */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-slate-800 text-base">Current Sale</h3>
            {totalItemsCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#159A1D]/10 text-[#159A1D] border border-[#159A1D]/20">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                title="Clear current cart"
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md font-medium transition-colors"
              >
                Clear
              </button>
            )}
            <button 
              onClick={() => {
                const name = window.prompt("Enter customer name:", customerName);
                if (name && name.trim()) setCustomerName(name.trim());
              }}
              title="Click to edit customer name"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:border-[#159A1D] transition-colors cursor-pointer"
            >
              <User size={14} className="text-[#159A1D]" />
              <span>{customerName}</span>
            </button>
          </div>
        </div>

        {/* Cart Items (Wider, Spacious Layout) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <ShoppingCartIcon className="text-slate-300" size={30} />
              </div>
              <p className="font-semibold text-slate-600 text-sm">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1 text-center max-w-[220px]">
                Click items in the product listing on the left to start a sale
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.product.id} 
                className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs"
              >
                {/* Left: Product Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 truncate" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>${item.product.price.toFixed(2)} / ea</span>
                    <span>•</span>
                    <span className="font-mono">{item.product.sku}</span>
                  </div>
                </div>

                {/* Middle: Stepper Controls */}
                <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0">
                  <button 
                    onClick={() => updateQty(item.product.id, -1)} 
                    className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-slate-800">
                    {item.qty}
                  </span>
                  <button 
                    onClick={() => updateQty(item.product.id, 1)} 
                    className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                    title="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Right: Item Total & Delete */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-slate-800 text-sm min-w-[60px] text-right">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => removeItem(item.product.id)} 
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal ({totalItemsCount} items)</span>
              <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-xl text-[#159A1D]">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setPaymentModalState('select')}
            className="w-full py-3 bg-[#159A1D] border border-[#159A1D] rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-[#128218] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
          >
            Pay ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Payment Modals */}
      <Modal 
        isOpen={paymentModalState !== 'closed'} 
        onClose={() => setPaymentModalState('closed')}
        title={paymentModalState === 'select' ? 'Select Payment Method' : 'UPI Payment'}
        cancelText={paymentModalState === 'upi' ? 'Close' : 'Cancel'}
      >
        {paymentModalState === 'select' && (
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => {
                setPaymentModalState('closed');
                clearCart();
              }}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-slate-200 rounded-2xl hover:border-[#159A1D] hover:bg-green-50 transition-all text-slate-700"
            >
              <Banknote size={32} />
              <span className="font-semibold">Cash</span>
            </button>
            <button 
              onClick={() => {
                setPaymentModalState('closed');
                clearCart();
              }}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-slate-200 rounded-2xl hover:border-[#159A1D] hover:bg-green-50 transition-all text-slate-700"
            >
              <CreditCard size={32} />
              <span className="font-semibold">Card</span>
            </button>
            <button 
              onClick={() => setPaymentModalState('upi')}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-[#159A1D] bg-green-50 rounded-2xl hover:bg-green-100 transition-all text-slate-700 shadow-sm"
            >
              <Smartphone size={32} className="text-[#159A1D]" />
              <span className="font-semibold text-[#159A1D]">UPI</span>
            </button>
          </div>
        )}
        
        {paymentModalState === 'upi' && (
          <div className="bg-[#fcffff] border border-slate-200 p-6 sm:p-8 font-sans max-w-[420px] mx-auto relative shadow-sm" style={{ color: '#001c38' }}>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="flex justify-center items-center gap-2 mb-2">
                {receiptSettings.storeLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={receiptSettings.storeLogoUrl}
                    alt="Store Logo"
                    className="max-h-12 max-w-[140px] object-contain rounded"
                  />
                ) : (
                  <div className="w-10 h-10 border-t-2 border-b-2 border-amber-500 relative flex justify-center items-center bg-amber-50/30">
                    <span className="text-2xl font-serif text-[#001c38] font-bold">
                      {receiptSettings.storeLogoInitial || 'M'}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <h1 className="text-[20px] leading-none font-bold tracking-widest text-[#001c38] uppercase">
                    {receiptSettings.storeName || 'MONEY LOG POS'}
                  </h1>
                  {receiptSettings.storeTagline && (
                    <p className="text-[9px] tracking-widest text-amber-500 uppercase font-semibold mt-1">
                      {receiptSettings.storeTagline}
                    </p>
                  )}
                </div>
              </div>

              {receiptSettings.receiptHeaderNote && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600 mb-4">
                  <div className="w-8 h-px bg-amber-200"></div>
                  <span className="italic font-medium">{receiptSettings.receiptHeaderNote}</span>
                  <div className="w-8 h-px bg-amber-200"></div>
                </div>
              )}
              <h2 className="text-xl font-bold uppercase tracking-widest mt-1">Receipt</h2>
            </div>

            {/* Info */}
            <div className="flex justify-between text-[11px] mb-5 font-medium">
              <div className="space-y-1">
                <div className="flex"><span className="w-20 text-slate-500">Receipt No</span><span>: #INV-10048</span></div>
                <div className="flex"><span className="w-20 text-slate-500">Date</span><span>: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
              </div>
              <div className="text-right text-[9px] space-y-0.5 text-slate-600 leading-tight">
                <p className="font-semibold text-[#001c38] text-[10px]">{receiptSettings.storeName}</p>
                {receiptSettings.addressLine1 && (
                  <p>{receiptSettings.addressLine1}{receiptSettings.city ? `, ${receiptSettings.city}` : ''}</p>
                )}
                {receiptSettings.phone && <p>Tel: {receiptSettings.phone}</p>}
                {receiptSettings.gstTaxNumber && <p>Tax ID: {receiptSettings.gstTaxNumber}</p>}
                <p>Customer: {customerName}</p>
                <p>Mode: UPI Payment</p>
              </div>
            </div>

            {/* Table */}
            <div className="mb-4">
              <div className="grid grid-cols-12 bg-slate-100 py-2 px-3 text-[11px] font-bold rounded-sm mb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="space-y-2.5 px-3 text-[11px] max-h-48 overflow-y-auto">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={item.product.id} className="grid grid-cols-12">
                      <div className="col-span-1">{idx + 1}</div>
                      <div className="col-span-5 truncate">{item.product.name}</div>
                      <div className="col-span-2 text-center">{item.qty}</div>
                      <div className="col-span-2 text-right">${item.product.price.toFixed(2)}</div>
                      <div className="col-span-2 text-right">${(item.product.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-12">
                    <div className="col-span-1">1</div>
                    <div className="col-span-5">Premium Espresso Blend</div>
                    <div className="col-span-2 text-center">1</div>
                    <div className="col-span-2 text-right">$18.50</div>
                    <div className="col-span-2 text-right">$18.50</div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-b border-slate-300 py-3 mb-5 px-3">
              <div className="flex justify-end text-[11px] mb-1">
                <span className="w-24 text-right pr-4">Subtotal</span>
                <span className="w-20 text-right">${subtotal > 0 ? subtotal.toFixed(2) : '18.50'}</span>
              </div>
              {receiptSettings.showTaxBreakdown && (
                <div className="flex justify-end text-[11px] mb-2">
                  <span className="w-28 text-right pr-4">Tax ({generalSettings.defaultTaxRate}%)</span>
                  <span className="w-20 text-right">${tax > 0 ? tax.toFixed(2) : '1.48'}</span>
                </div>
              )}
              <div className="flex justify-end text-[13px] font-bold border-t border-slate-300 pt-2">
                <span className="w-32 text-right pr-4">Total Amount</span>
                <span className="w-24 text-right text-[15px] text-[#001c38]">
                  ${total > 0 ? total.toFixed(2) : '19.98'}
                </span>
              </div>
            </div>

            {/* UPI Box */}
            {receiptSettings.showUpiQrOnReceipt && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-5 mb-5 shadow-sm">
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg shrink-0">
                  {receiptSettings.upiQrType === 'custom' && receiptSettings.upiQrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={receiptSettings.upiQrImageUrl}
                      alt="UPI QR Code"
                      className="w-18 h-18 object-contain"
                    />
                  ) : (
                    <QrCode size={75} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1 text-slate-800">
                    Pay to: {receiptSettings.upiPayeeName || receiptSettings.storeName}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="italic font-bold text-slate-800 text-lg leading-none">UPI</span>
                    <div className="flex">
                      <div className="w-2 h-3 bg-green-500 skew-x-[-15deg]"></div>
                      <div className="w-2 h-3 bg-orange-500 skew-x-[-15deg] -ml-0.5"></div>
                    </div>
                  </div>
                  <p className="text-[9.5px] text-slate-500 mb-1.5 font-medium">Scan this QR code or use the UPI ID below</p>
                  <div className="bg-white border border-slate-200 py-1.5 px-3 rounded-md text-[11px] font-mono font-medium inline-block w-full text-center text-slate-700">
                    {receiptSettings.upiId || 'moneylogpos@okaxis'}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[11px] space-y-1 mb-5">
              <div className="text-amber-500 text-lg mb-1 leading-none">❦</div>
              <p className="font-bold">{receiptSettings.receiptFooterNote || 'Thank you for your purchase!'}</p>
              {receiptSettings.returnPolicy ? (
                <p className="text-[8.5px] text-slate-500 italic mt-0.5">{receiptSettings.returnPolicy}</p>
              ) : (
                <p className="text-[9px] uppercase tracking-widest text-slate-500">PLEASE VISIT AGAIN</p>
              )}
            </div>

            {/* Action Buttons: Print & Done */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer size={14} />
                Print Receipt
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setPaymentModalState('closed');
                  clearCart();
                }}
              >
                Complete & New Sale
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const ShoppingCartIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
