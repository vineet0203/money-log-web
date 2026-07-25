import React, { useState } from 'react';
import { Eye, XCircle, CheckCircle, CreditCard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, MenuItemType } from '@/components/ui/Menu';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

interface Props {
  subscriptionId: string;
  status: 'active' | 'cancelled';
  nextBillingDate?: string;
  billingCycle?: string;
}

export function SubscriptionActionMenu({ subscriptionId, status, nextBillingDate, billingCycle }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [modalAction, setModalAction] = useState<'cancel' | 'reactivate' | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'cancelled') => {
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

  const handleMarkAsPaid = () => {
    if (nextBillingDate && billingCycle) {
      const today = new Date();
      const nextDate = new Date(nextBillingDate);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const maxDays = billingCycle === 'yearly' ? 30 : 15;
      
      if (diffDays > maxDays) {
        enqueueSnackbar(`Too early! You can only pay up to ${maxDays} days before the due date.`, { variant: 'warning' });
        return;
      }
    }
    router.push(`/subscriptions/${subscriptionId}/pay`);
  };

  const menuItems: MenuItemType[] = [
    {
      label: 'View Details',
      icon: <Eye size={16} />,
      href: `/subscriptions/${subscriptionId}`,
    },
    status === 'active' ? {
      label: 'Cancel Subscription',
      icon: <XCircle size={16} />,
      hoverColor: 'hover:bg-red-50 hover:text-red-600',
      onClick: () => setModalAction('cancel'),
    } : {
      label: 'Reactivate',
      icon: <CheckCircle size={16} />,
      hoverColor: 'hover:bg-green-50 hover:text-green-600',
      onClick: () => setModalAction('reactivate'),
    },
    {
      label: 'Pay',
      icon: <CreditCard size={16} />,
      onClick: handleMarkAsPaid,
    }
  ];

  return (
    <>
      <Menu items={menuItems} />

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        title={
          modalAction === 'cancel' ? 'Cancel Subscription' : 'Reactivate Subscription'
        }
        submitText="Confirm"
        onSubmit={() => {
          if (modalAction === 'cancel') handleStatusUpdate('cancelled');
          else if (modalAction === 'reactivate') handleStatusUpdate('active');
        }}
        isSubmitDisabled={updateStatusMutation.isPending}
      >
        <p className="text-slate-600 font-medium">
          {modalAction === 'cancel' ? 'Are you sure you want to cancel this subscription? This action will mark it as inactive.' :
           'Are you sure you want to reactivate this subscription?'}
        </p>
      </Modal>
    </>
  );
}
