"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Landmark, CreditCard, Loader2 } from 'lucide-react';
import { useCreateLinkToken, useExchangePublicToken, useSyncAllTransactions } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

export function LinkAccountButton({ type = 'bank', className = '', onClick }: { type?: 'bank' | 'liabilities' | 'assets', className?: string, onClick?: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();
  const syncTransactions = useSyncAllTransactions();

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

  // When the token is fetched and plaid is ready, open it automatically
  useEffect(() => {
    if (ready && isInitializing) {
      open();
      setIsInitializing(false);
    }
  }, [ready, isInitializing, open]);

  const isLiability = type === 'liabilities';
  const isAssets = type === 'assets';
  const isLoading = isInitializing || createLinkToken.isPending;

  const handleClick = () => {
    if (onClick) onClick();
    
    // If we already fetched a token successfully, just open it
    if (token && ready) {
      open();
      return;
    }

    // Otherwise, fetch it now and show loading
    setIsInitializing(true);
    createLinkToken.mutate(type, {
      onSuccess: (data) => {
        setToken(data.link_token);
      },
      onError: () => {
        setIsInitializing(false);
        enqueueSnackbar('Failed to initialize bank link', { variant: 'error' });
      }
    });
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading || exchangePublicToken.isPending}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 text-white ${
        isLiability ? 'bg-amber-500 hover:bg-amber-600' : isAssets ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#159A1D] hover:bg-green-700'
      } ${className}`}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : isLiability ? <CreditCard size={18} /> : isAssets ? <Landmark size={18} /> : <Landmark size={18} />}
      <span>
        {isLoading 
          ? 'Preparing...' 
          : isLiability 
            ? 'Link Credit Card / Loan' 
            : isAssets 
              ? 'Link Account for Assets' 
              : 'Link Bank Account'}
      </span>
    </button>
  );
}
