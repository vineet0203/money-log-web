"use client";

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Menu, MenuItemType } from '@/components/ui/Menu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteTransaction } from '@/hooks/queries/transactions';
import { useSnackbar } from 'notistack';

interface TransactionActionMenuProps {
  transaction: any;
}

export function TransactionActionMenu({ transaction }: TransactionActionMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const deleteMutation = useDeleteTransaction();

  const isSubscriptionLinked = Boolean(transaction?.subscription_id);

  const handleDelete = () => {
    if (!transaction?.id) return;

    deleteMutation.mutate(transaction.id, {
      onSuccess: () => {
        enqueueSnackbar('Transaction deleted successfully', { variant: 'success' });
        setIsDeleteDialogOpen(false);
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to delete transaction';
        enqueueSnackbar(msg, { variant: 'error' });
      },
    });
  };

  const menuItems: MenuItemType[] = [
    {
      label: 'Edit',
      icon: <Pencil size={15} />,
      href: `/transactions/${transaction.id}/edit`,
    },
    isSubscriptionLinked
      ? {
          label: 'Delete',
          icon: <Trash2 size={15} />,
          disabled: true,
          color: 'text-slate-400',
          title: "Linked to subscription. Use 'Undo Payment' from the subscription details screen.",
        }
      : {
          label: 'Delete',
          icon: <Trash2 size={15} />,
          color: 'text-red-600',
          hoverColor: 'hover:bg-red-50 hover:text-red-600',
          onClick: () => setIsDeleteDialogOpen(true),
        },
  ];

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>
        <Menu items={menuItems} />
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Transaction"
          description={
            <span>
              Are you sure you want to delete{' '}
              <strong className="text-slate-900 font-bold">
                {transaction.title || 'this transaction'}
              </strong>{' '}
              (${Number(transaction.amount || 0).toFixed(2)})? This action cannot be undone.
            </span>
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  );
}
