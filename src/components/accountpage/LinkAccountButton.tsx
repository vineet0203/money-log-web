"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Landmark } from 'lucide-react';
import { useCreateLinkToken, useExchangePublicToken, useSyncAllTransactions } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

export function LinkAccountButton() {
  const [token, setToken] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();
  const syncTransactions = useSyncAllTransactions();

  // Fetch link token on mount
  useEffect(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: (data) => {
        setToken(data.link_token);
      },
      onError: () => {
        console.error("Failed to fetch Plaid link token");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <button 
      onClick={() => open()} 
      disabled={!ready}
      className="flex items-center gap-2 bg-[#159A1D] hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
    >
      <Landmark size={18} />
      <span>Link Account</span>
    </button>
  );
}
