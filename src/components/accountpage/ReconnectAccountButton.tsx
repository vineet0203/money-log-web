"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useCreateLinkToken, useResetItemStatus } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

export function ReconnectAccountButton({ itemId, className = '' }: { itemId: string, className?: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  const createLinkToken = useCreateLinkToken();
  const resetItemStatus = useResetItemStatus();

  const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token, metadata) => {
    // In update mode, public_token doesn't need to be exchanged.
    // Just reset the item status in our database!
    enqueueSnackbar('Restoring connection...', { variant: 'info' });
    resetItemStatus.mutate(itemId, {
      onSuccess: () => {
        enqueueSnackbar('Account reconnected successfully!', { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar('Failed to reset account status. Please try again.', { variant: 'error' });
      }
    });
  }, [resetItemStatus, itemId, enqueueSnackbar]);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready && isInitializing) {
      open();
      setIsInitializing(false);
    }
  }, [ready, isInitializing, open]);

  const isLoading = isInitializing || createLinkToken.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (token && ready) {
      open();
      return;
    }

    setIsInitializing(true);
    createLinkToken.mutate({ item_id: itemId }, {
      onSuccess: (data) => {
        setToken(data.link_token);
      },
      onError: () => {
        setIsInitializing(false);
        enqueueSnackbar('Failed to initialize reconnect', { variant: 'error' });
      }
    });
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading || resetItemStatus.isPending}
      className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors disabled:opacity-50 text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 ${className}`}
    >
      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
      <span>{isLoading ? 'Loading...' : 'Reconnect'}</span>
    </button>
  );
}
