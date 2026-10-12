"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Supplier,
  PurchaseOrder,
  PurchaseBill,
  GoodsReceivingRecord,
  SupplierPayment,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PURCHASE_BILLS,
  INITIAL_GRN_RECORDS,
  INITIAL_SUPPLIER_PAYMENTS,
  PurchaseOrderItem,
  GoodsReceivingItem,
  PurchaseOrderStatus,
} from './types';
import { 
  SupplierFormData, 
  CreatePurchaseFormData, 
  GoodsReceivingFormData, 
  SupplierPaymentFormData 
} from './schema';

interface SuppliersContextType {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  purchases: PurchaseBill[];
  goodsReceivingRecords: GoodsReceivingRecord[];
  payments: SupplierPayment[];
  metrics: {
    totalPayableBalance: number;
    activeSuppliersCount: number;
    openPOsCount: number;
    totalPurchasesValue: number;
    completedGRNsCount: number;
  };
  addSupplier: (data: SupplierFormData) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (data: CreatePurchaseFormData) => PurchaseOrder;
  createPurchaseBill: (data: CreatePurchaseFormData) => PurchaseBill;
  updatePOStatus: (id: string, status: PurchaseOrderStatus) => void;
  processGoodsReceiving: (data: GoodsReceivingFormData) => GoodsReceivingRecord;
  recordSupplierPayment: (data: SupplierPaymentFormData) => SupplierPayment;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [purchases, setPurchases] = useState<PurchaseBill[]>(INITIAL_PURCHASE_BILLS);
  const [goodsReceivingRecords, setGoodsReceivingRecords] = useState<GoodsReceivingRecord[]>(INITIAL_GRN_RECORDS);
  const [payments, setPayments] = useState<SupplierPayment[]>(INITIAL_SUPPLIER_PAYMENTS);

  // Compute key summary metrics
  const metrics = useMemo(() => {
    const totalPayableBalance = suppliers.reduce((sum, s) => sum + s.balancePayable, 0);
    const activeSuppliersCount = suppliers.filter(s => s.status === 'Active').length;
    const openPOsCount = purchaseOrders.filter(po => po.status === 'Draft' || po.status === 'Ordered' || po.status === 'Partial').length;
    const totalPurchasesValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
    const completedGRNsCount = goodsReceivingRecords.filter(g => g.status === 'Completed').length;

    return {
      totalPayableBalance,
      activeSuppliersCount,
      openPOsCount,
      totalPurchasesValue,
      completedGRNsCount,
    };
  }, [suppliers, purchaseOrders, purchases, goodsReceivingRecords]);

  const addSupplier = (data: SupplierFormData): Supplier => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name,
      code: data.code.toUpperCase(),
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      gstTaxNumber: data.gstTaxNumber || 'N/A',
      paymentTerms: data.paymentTerms,
      bankDetails: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscOrSwift: data.ifscOrSwift,
        upiId: data.upiId || undefined,
      },
      categoriesSupplied: data.categoriesSupplied,
      balancePayable: 0,
      status: data.status,
      rating: 5,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const createPurchaseOrder = (data: CreatePurchaseFormData): PurchaseOrder => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 101).padStart(4, '0')}`;
    
    let subtotal = 0;
    let taxTotal = 0;

    const items: PurchaseOrderItem[] = data.items.map((item, idx) => {
      const itemSubtotal = item.orderedQty * item.unitCost;
      const itemTax = (itemSubtotal * item.taxPercent) / 100;
      subtotal += itemSubtotal;
      taxTotal += itemTax;

      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: item.productId,
        variantId: item.variantId,
        itemName: item.itemName,
        sku: item.sku,
        unit: item.unit,
        orderedQty: item.orderedQty,
        receivedQty: 0,
        unitCost: item.unitCost,
        taxPercent: item.taxPercent,
        lineTotal: itemSubtotal + itemTax,
      };
    });

    const grandTotal = Math.max(0, subtotal + taxTotal + data.shippingFee - data.discount);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: data.supplierId,
      supplierName: supplier?.name || 'Unknown Supplier',
      orderDate: data.date,
      expectedDate: data.dueDateOrExpectedDate,
      items,
      subtotal,
      taxTotal,
      shippingFee: data.shippingFee,
      discount: data.discount,
      grandTotal,
      status: 'Ordered',
      paymentStatus: 'Unpaid',
      amountPaid: 0,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  };

  const createPurchaseBill = (data: CreatePurchaseFormData): PurchaseBill => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    const billNumber = `BILL-${new Date().getFullYear()}-${String(purchases.length + 85).padStart(4, '0')}`;
    
    let subtotal = 0;
    let taxTotal = 0;

    const items: PurchaseOrderItem[] = data.items.map((item, idx) => {
      const itemSubtotal = item.orderedQty * item.unitCost;
      const itemTax = (itemSubtotal * item.taxPercent) / 100;
      subtotal += itemSubtotal;
      taxTotal += itemTax;

      return {
        id: `bi-${Date.now()}-${idx}`,
        productId: item.productId,
        variantId: item.variantId,
        itemName: item.itemName,
        sku: item.sku,
        unit: item.unit,
        orderedQty: item.orderedQty,
        receivedQty: item.orderedQty,
        unitCost: item.unitCost,
        taxPercent: item.taxPercent,
        lineTotal: itemSubtotal + itemTax,
      };
    });

    const grandTotal = Math.max(0, subtotal + taxTotal + data.shippingFee - data.discount);

    const newBill: PurchaseBill = {
      id: `bill-${Date.now()}`,
      billNumber,
      supplierInvoiceNo: data.supplierInvoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      supplierId: data.supplierId,
      supplierName: supplier?.name || 'Unknown Supplier',
      billDate: data.date,
      dueDate: data.dueDateOrExpectedDate,
      items,
      subtotal,
      taxTotal,
      shippingFee: data.shippingFee,
      discount: data.discount,
      grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
      paymentStatus: 'Unpaid',
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Increase supplier's outstanding balance
    if (supplier) {
      updateSupplier(supplier.id, {
        balancePayable: supplier.balancePayable + grandTotal,
      });
    }

    setPurchases(prev => [newBill, ...prev]);
    return newBill;
  };

  const updatePOStatus = (id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
  };

  const processGoodsReceiving = (data: GoodsReceivingFormData): GoodsReceivingRecord => {
    const po = purchaseOrders.find(p => p.poNumber === data.poNumber);
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(goodsReceivingRecords.length + 44).padStart(4, '0')}`;

    let totalOrdered = 0;
    let totalAccepted = 0;
    let totalDamaged = 0;

    const grnItems: GoodsReceivingItem[] = data.items.map((item, idx) => {
      const accepted = Math.max(0, item.receivedQty - item.damagedQty);
      totalOrdered += item.orderedQty;
      totalAccepted += accepted;
      totalDamaged += item.damagedQty;

      return {
        id: `grni-${Date.now()}-${idx}`,
        sku: item.sku,
        itemName: item.itemName,
        unit: item.unit,
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        damagedQty: item.damagedQty,
        acceptedQty: accepted,
        unitCost: item.unitCost,
        batchNumber: item.batchNumber || `BATCH-${new Date().getFullYear()}-${idx + 1}`,
        expiryDate: item.expiryDate || 'N/A',
        remarks: item.remarks,
      };
    });

    const isDiscrepancy = totalDamaged > 0 || totalAccepted < totalOrdered;
    const grnStatus = isDiscrepancy ? 'Partial Discrepancy' : 'Completed';

    const newGRN: GoodsReceivingRecord = {
      id: `grn-${Date.now()}`,
      grnNumber,
      poNumber: data.poNumber,
      supplierId: po?.supplierId || 'sup-unknown',
      supplierName: po?.supplierName || 'Unknown Supplier',
      receivedDate: data.receivedDate,
      receivedBy: data.receivedBy,
      status: grnStatus,
      items: grnItems,
      totalOrdered,
      totalAccepted,
      totalDamaged,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Update PO items received counts and overall PO status
    if (po) {
      const updatedPoItems = po.items.map(poItem => {
        const receivedItem = data.items.find(i => i.sku === poItem.sku);
        if (receivedItem) {
          const newReceivedTotal = poItem.receivedQty + receivedItem.receivedQty;
          return {
            ...poItem,
            receivedQty: newReceivedTotal,
          };
        }
        return poItem;
      });

      const allItemsFullyReceived = updatedPoItems.every(i => i.receivedQty >= i.orderedQty);
      const someItemsReceived = updatedPoItems.some(i => i.receivedQty > 0);

      const nextStatus: PurchaseOrderStatus = allItemsFullyReceived 
        ? 'Received' 
        : someItemsReceived 
          ? 'Partial' 
          : po.status;

      setPurchaseOrders(prev => prev.map(p => p.id === po.id ? {
        ...p,
        items: updatedPoItems,
        status: nextStatus,
      } : p));
    }

    setGoodsReceivingRecords(prev => [newGRN, ...prev]);
    return newGRN;
  };

  const recordSupplierPayment = (data: SupplierPaymentFormData): SupplierPayment => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payments.length + 74).padStart(4, '0')}`;

    const newPayment: SupplierPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      supplierId: data.supplierId,
      supplierName: supplier?.name || 'Unknown Supplier',
      billNumber: data.billNumber || undefined,
      poNumber: data.poNumber || undefined,
      paymentDate: data.paymentDate,
      amount: data.amount,
      paymentMode: data.paymentMode,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Deduct from supplier balance
    if (supplier) {
      const updatedBalance = Math.max(0, supplier.balancePayable - data.amount);
      updateSupplier(supplier.id, { balancePayable: updatedBalance });
    }

    // If applied to a purchase bill, update its status
    if (data.billNumber) {
      setPurchases(prev => prev.map(bill => {
        if (bill.billNumber === data.billNumber) {
          const newPaid = bill.amountPaid + data.amount;
          const newDue = Math.max(0, bill.grandTotal - newPaid);
          const paymentStatus = newDue <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return {
            ...bill,
            amountPaid: newPaid,
            balanceDue: newDue,
            paymentStatus,
          };
        }
        return bill;
      }));
    }

    // If applied to a PO, update PO payment status
    if (data.poNumber) {
      setPurchaseOrders(prev => prev.map(po => {
        if (po.poNumber === data.poNumber) {
          const newPaid = po.amountPaid + data.amount;
          const paymentStatus = newPaid >= po.grandTotal ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return {
            ...po,
            amountPaid: newPaid,
            paymentStatus,
          };
        }
        return po;
      }));
    }

    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        purchaseOrders,
        purchases,
        goodsReceivingRecords,
        payments,
        metrics,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        createPurchaseBill,
        updatePOStatus,
        processGoodsReceiving,
        recordSupplierPayment,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SuppliersProvider');
  }
  return context;
}
