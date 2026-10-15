"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Supplier,
  PurchaseOrder,
  PurchaseBill,
  GoodsReceivingRecord,
  SupplierPayment,
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
import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  usePurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePOStatusMutation,
  usePurchaseBillsQuery,
  useCreatePurchaseBillMutation,
  useGoodsReceiptsQuery,
  useProcessGRNMutation,
  useSupplierPaymentsQuery,
  useRecordPaymentMutation,
  useSupplierMetricsQuery,
} from '@/hooks/queries/posSuppliers';

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
  isLoading: boolean;
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
  // Query hooks
  const { data: dbSuppliers, isLoading: isSuppliersLoading } = useSuppliersQuery();
  const { data: dbPOs, isLoading: isPOsLoading } = usePurchaseOrdersQuery();
  const { data: dbBills, isLoading: isBillsLoading } = usePurchaseBillsQuery();
  const { data: dbGRNs, isLoading: isGRNsLoading } = useGoodsReceiptsQuery();
  const { data: dbPayments, isLoading: isPaymentsLoading } = useSupplierPaymentsQuery();
  const { data: dbMetrics, isLoading: isMetricsLoading } = useSupplierMetricsQuery();

  // Mutations
  const createSupplierMutation = useCreateSupplierMutation();
  const updateSupplierMutation = useUpdateSupplierMutation();
  const deleteSupplierMutation = useDeleteSupplierMutation();
  const createPOMutation = useCreatePurchaseOrderMutation();
  const updatePOStatusMutation = useUpdatePOStatusMutation();
  const createBillMutation = useCreatePurchaseBillMutation();
  const processGRNMutation = useProcessGRNMutation();
  const recordPaymentMutation = useRecordPaymentMutation();

  // Real local state initialized empty (no mock data)
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchases, setPurchases] = useState<PurchaseBill[]>([]);
  const [goodsReceivingRecords, setGoodsReceivingRecords] = useState<GoodsReceivingRecord[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);

  // Sync from DB queries when available
  useEffect(() => {
    if (dbSuppliers !== undefined) {
      setSuppliers(dbSuppliers);
    }
  }, [dbSuppliers]);

  useEffect(() => {
    if (dbPOs !== undefined) {
      setPurchaseOrders(dbPOs);
    }
  }, [dbPOs]);

  useEffect(() => {
    if (dbBills !== undefined) {
      setPurchases(dbBills);
    }
  }, [dbBills]);

  useEffect(() => {
    if (dbGRNs !== undefined) {
      setGoodsReceivingRecords(dbGRNs);
    }
  }, [dbGRNs]);

  useEffect(() => {
    if (dbPayments !== undefined) {
      setPayments(dbPayments);
    }
  }, [dbPayments]);

  // Compute key summary metrics (prefer DB aggregated metrics if available)
  const metrics = useMemo(() => {
    if (dbMetrics) {
      return dbMetrics;
    }

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
  }, [dbMetrics, suppliers, purchaseOrders, purchases, goodsReceivingRecords]);

  // 1. Add Supplier
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

    // Backend mutation in background
    createSupplierMutation.mutate(data, {
      onSuccess: (saved) => {
        if (saved?.id) {
          setSuppliers(prev => prev.map(s => s.id === newSupplier.id ? { ...s, id: String(saved.id) } : s));
        }
      }
    });

    return newSupplier;
  };

  // 2. Update Supplier
  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    updateSupplierMutation.mutate({
      id,
      data: {
        name: data.name,
        code: data.code,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        status: data.status,
      } as Partial<SupplierFormData>
    });
  };

  // 3. Delete Supplier
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    deleteSupplierMutation.mutate(id);
  };

  // 4. Create Purchase Order
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

    // Backend mutation
    createPOMutation.mutate(data, {
      onSuccess: (saved) => {
        if (saved?.id) {
          setPurchaseOrders(prev => prev.map(p => p.id === newPO.id ? { ...p, id: String(saved.id), poNumber: saved.poNumber || p.poNumber } : p));
        }
      }
    });

    return newPO;
  };

  // 5. Create Purchase Bill (WITH INVENTORY RESTOCKING IN BACKEND)
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

    // Backend mutation: passes isReceived=true so inventory is automatically replenished in MySQL
    createBillMutation.mutate({
      ...data,
      isReceived: true,
    }, {
      onSuccess: (saved) => {
        if (saved?.id) {
          setPurchases(prev => prev.map(b => b.id === newBill.id ? { ...b, id: String(saved.id), billNumber: saved.billNumber || b.billNumber } : b));
        }
      }
    });

    return newBill;
  };

  // 6. Update PO Status
  const updatePOStatus = (id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    updatePOStatusMutation.mutate({ id, status });
  };

  // 7. Process Goods Receiving (GRN) - REPLENISHES INVENTORY IN BACKEND
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

    // Backend mutation: restocks stock_quantity in MySQL
    processGRNMutation.mutate({
      ...data,
      supplierId: po?.supplierId || suppliers[0]?.id || '1',
      poId: po?.id,
    } as any, {
      onSuccess: (saved) => {
        if (saved?.id) {
          setGoodsReceivingRecords(prev => prev.map(g => g.id === newGRN.id ? { ...g, id: String(saved.id), grnNumber: saved.grnNumber || g.grnNumber } : g));
        }
      }
    });

    return newGRN;
  };

  // 8. Record Supplier Payment
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

    // Backend mutation
    recordPaymentMutation.mutate(data);

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
        isLoading: isSuppliersLoading,
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
