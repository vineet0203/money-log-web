"use client";

import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useSyncAllTransactions } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

export function SyncAccountsButton() {
  const syncTransactions = useSyncAllTransactions();
  const { enqueueSnackbar } = useSnackbar();
  
  const handleSyncAll = () => {
    syncTransactions.mutate(undefined, {
      onSuccess: () => enqueueSnackbar('All accounts synced successfully', { variant: 'success' }),
      onError: () => enqueueSnackbar('Failed to sync accounts', { variant: 'error' })
    });
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSyncAll}
        disabled={syncTransactions.isPending}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {syncTransactions.isPending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        <span className="hidden sm:inline">Sync</span>
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
        Sync balance and transactions
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
}
