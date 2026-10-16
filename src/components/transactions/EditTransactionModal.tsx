"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import AddTransactionForm from '@/components/balance/AddTransactionForm';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
}: EditTransactionModalProps) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaction"
      description="Update transaction details, category, notes, or attached receipt."
      maxWidth="max-w-4xl"
      hideFooter={true}
    >
      <AddTransactionForm
        transaction={transaction}
        onSuccess={onClose}
        onCancel={onClose}
        isModal={true}
      />
    </Modal>
  );
}
