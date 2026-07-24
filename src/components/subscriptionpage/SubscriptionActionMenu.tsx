import React, { useState } from 'react';
import { Eye, XCircle, CheckCircle, CreditCard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, MenuItemType } from '@/components/ui/Menu';
import { Modal } from '@/components/ui/Modal';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

interface Props {
  subscriptionId: string;
  status: 'active' | 'cancelled';
}

export function SubscriptionActionMenu({ subscriptionId, status }: Props) {
  const queryClient = useQueryClient();
  const [modalAction, setModalAction] = useState<'cancel' | 'reactivate' | 'paid' | null>(null);

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

  const handleStatusUpdate = (newStatus: 'active' | 'cancelled') => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleMarkAsPaid = () => {
    // Future implementation for marking as paid
    setModalAction(null);
    alert('Marked as paid!');
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
    { isDivider: true },
    {
      label: 'Mark as Paid',
      icon: <CreditCard size={16} />,
      onClick: () => setModalAction('paid'),
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
          modalAction === 'cancel' ? 'Cancel Subscription' :
          modalAction === 'reactivate' ? 'Reactivate Subscription' :
          'Mark as Paid'
        }
        submitText="Confirm"
        onSubmit={() => {
          if (modalAction === 'cancel') handleStatusUpdate('cancelled');
          else if (modalAction === 'reactivate') handleStatusUpdate('active');
          else if (modalAction === 'paid') handleMarkAsPaid();
        }}
        isSubmitDisabled={updateStatusMutation.isPending}
      >
        <p className="text-slate-600 font-medium">
          {modalAction === 'cancel' ? 'Are you sure you want to cancel this subscription? This action will mark it as inactive.' :
           modalAction === 'reactivate' ? 'Are you sure you want to reactivate this subscription?' :
           'Are you sure you want to mark this subscription as paid for the current billing cycle?'}
        </p>
      </Modal>
    </>
  );
}
