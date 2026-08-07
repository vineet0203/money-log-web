import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Menu, MenuItemType } from '@/components/ui/Menu';
import { Modal } from '@/components/ui/Modal';
import { useSnackbar } from 'notistack';
import { useDeleteAccount } from '@/hooks/queries/accounts';

interface Props {
  accountId: string;
  provider?: string;
}

export function AccountActionMenu({ accountId, provider }: Props) {
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const deleteAccount = useDeleteAccount();

  const handleDisconnect = () => {
    deleteAccount.mutate(accountId, {
      onSuccess: () => {
        enqueueSnackbar('Account disconnected successfully.', { variant: 'success' });
        setIsDisconnectModalOpen(false);
      },
      onError: () => {
        enqueueSnackbar('Failed to disconnect account.', { variant: 'error' });
      }
    });
  };

  const menuItems: MenuItemType[] = [
    {
      label: 'Disconnect',
      icon: <XCircle size={16} />,
      hoverColor: 'hover:bg-red-50 hover:text-red-600',
      onClick: () => setIsDisconnectModalOpen(true),
    }
  ];

  return (
    <>
      <Menu items={menuItems} />

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        title="Disconnect Account"
        submitText="Disconnect"
        onSubmit={handleDisconnect}
        isSubmitDisabled={deleteAccount.isPending}
      >
        <p className="text-slate-600 font-medium">
          Are you sure you want to disconnect this account? You will lose access to its transaction history.
        </p>
      </Modal>
    </>
  );
}
