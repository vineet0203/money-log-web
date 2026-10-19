import React, { useState } from 'react';
import { Eye, XCircle, CheckCircle, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, MenuItemType } from '@/components/ui/Menu';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { AddSubscriptionModal } from './AddSubscriptionModal';
import { SubscriptionData, useGetSubscriptionDetails } from '@/hooks/queries/subscriptions';

interface Props {
  type?: 'expense' | 'income';
  subscriptionId: string;
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate?: string;
  billingCycle?: string;
  subscription?: SubscriptionData;
}

export function SubscriptionActionMenu({
  subscriptionId,
  status,
  nextBillingDate,
  billingCycle,
  type = 'expense',
  subscription,
}: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [modalAction, setModalAction] = useState<'cancel' | 'reactivate' | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fallback fetch if full subscription object wasn't passed directly
  const { data: detailsData } = useGetSubscriptionDetails(subscriptionId);
  const resolvedSubscription = subscription || detailsData?.subscription;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'paused' | 'cancelled') => {
      const { data } = await api.put(`/subscriptions/${subscriptionId}`, { status: newStatus });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setModalAction(null);
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleStatusUpdate = (newStatus: 'active' | 'cancelled') => {
    updateStatusMutation.mutate(newStatus);
  };

  const menuItems: MenuItemType[] = [
    {
      label: 'View Details',
      icon: <Eye size={16} />,
      href: `/subscriptions/${subscriptionId}`,
    },
    {
      label: 'Edit Payment',
      icon: <Pencil size={16} />,
      onClick: () => setIsEditModalOpen(true),
    },
    status === 'active'
      ? {
          label: 'Cancel Payment',
          icon: <XCircle size={16} />,
          hoverColor: 'hover:bg-red-50 hover:text-red-600',
          onClick: () => setModalAction('cancel'),
        }
      : {
          label: 'Reactivate',
          icon: <CheckCircle size={16} />,
          hoverColor: 'hover:bg-green-50 hover:text-green-600',
          onClick: () => setModalAction('reactivate'),
        },
  ];

  return (
    <>
      <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-end">
        <Menu items={menuItems} />
      </div>

      {/* Edit Recurring Payment Modal */}
      {resolvedSubscription && (
        <AddSubscriptionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          subscription={resolvedSubscription}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        title={modalAction === 'cancel' ? 'Cancel Payment' : 'Reactivate Payment'}
        submitText="Confirm"
        onSubmit={() => {
          if (modalAction === 'cancel') handleStatusUpdate('cancelled');
          else if (modalAction === 'reactivate') handleStatusUpdate('active');
        }}
        isSubmitDisabled={updateStatusMutation.isPending}
      >
        <p className="text-slate-600 font-medium">
          {modalAction === 'cancel'
            ? 'Are you sure you want to cancel this recurring payment? This action will mark it as inactive.'
            : 'Are you sure you want to reactivate this recurring payment?'}
        </p>
      </Modal>
    </>
  );
}
