"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Landmark, CreditCard } from 'lucide-react';
import { useCreateLinkToken, useExchangePublicToken, useSyncAllTransactions } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

export function LinkAccountButton({ type = 'bank', className = '', onClick }: { type?: 'bank' | 'liabilities' | 'assets', className?: string, onClick?: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();
  const syncTransactions = useSyncAllTransactions();

  // Fetch link token on mount
  useEffect(() => {
    createLinkToken.mutate(type, {
      onSuccess: (data) => {
        setToken(data.link_token);
      },
      onError: () => {
        console.error("Failed to fetch Plaid link token");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token, metadata) => {
    // Send the public_token to your app server.
    // The metadata object contains info about the institution the user selected and the accounts associated with the login.
    enqueueSnackbar('Connecting your account...', { variant: 'info' });
    
    if (!public_token) return;
    exchangePublicToken.mutate(public_token, {
      onSuccess: () => {
        enqueueSnackbar('Account linked successfully!', { variant: 'success' });
        // Optionally, sync transactions right away
        syncTransactions.mutate();
      },
      onError: () => {
        enqueueSnackbar('Failed to link account. Please try again.', { variant: 'error' });
      }
    });
  }, [exchangePublicToken, syncTransactions, enqueueSnackbar]);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    // onExit: (err, metadata) => { ... },
    // onEvent: (eventName, metadata) => { ... },
  };

  const { open, ready } = usePlaidLink(config);

  const isLiability = type === 'liabilities';
  const isAssets = type === 'assets';

  const handleClick = () => {
    open();
    if (onClick) onClick();
  };

  return (
    <button 
      onClick={handleClick}
      disabled={!ready}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 text-white ${
        isLiability ? 'bg-amber-500 hover:bg-amber-600' : isAssets ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#159A1D] hover:bg-green-700'
      } ${className}`}
    >
      {isLiability ? <CreditCard size={18} /> : isAssets ? <Landmark size={18} /> : <Landmark size={18} />}
      <span>{isLiability ? 'Link Credit Card / Loan' : isAssets ? 'Link Account for Assets' : 'Link Bank Account'}</span>
    </button>
  );
}
