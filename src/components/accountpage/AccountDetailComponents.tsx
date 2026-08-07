"use client";

import React, { useState } from 'react';
import { Landmark, CreditCard, Wallet, Eye, EyeOff, ShoppingCart, Clock } from 'lucide-react';
import { Account, AccountTransaction } from '@/hooks/queries/accounts';
import { useSnackbar } from 'notistack';

// ─── Account Type Icon ───────────────────────────────────────────────────────
export function AccountTypeIcon({ type, size = 'md' }: { type?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-20 h-20' };
  const iconSize = { sm: 16, md: 24, lg: 32 };

  const getBg = () => {
    switch (type?.toLowerCase()) {
      case 'card':     return 'bg-slate-800';
      case 'bank':     return 'bg-emerald-600';
      default:         return 'bg-indigo-600';
    }
  };

  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'card':     return <CreditCard size={iconSize[size]} className="text-white" />;
      case 'bank':     return <Landmark size={iconSize[size]} className="text-white" />;
      default:         return <Wallet size={iconSize[size]} className="text-white" />;
    }
  };

  return (
    <div className={`${sizeMap[size]} ${getBg()} rounded-2xl flex items-center justify-center shadow-lg`}>
      {getIcon()}
    </div>
  );
}

// ─── Hero Banner ─────────────────────────────────────────────────────────────
interface HeroBannerProps {
  account: Account;
}

export function AccountHeroBanner({ account }: HeroBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const last4 = account.account_number ? account.account_number.slice(-4) : '****';

  const isDepository = account.type === 'bank';
  const isCredit     = account.type === 'card';

  const displayBalance    = isDepository && account.available_balance != null ? account.available_balance : account.balance;
  const balanceLabel      = isDepository && account.available_balance != null ? 'Available Balance' : 'Current Balance';
  const currencyCode      = account.currency || 'USD';

  const formatCurrency = (val?: number | null) => {
    if (val == null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val);
  };

  const lastSynced = account.updated_at
    ? new Date(account.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    : 'Just now';

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative">
      {/* Last Synced */}
      <div className="absolute top-5 left-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Synced</p>
        <p className="text-xs font-bold text-slate-600 mt-0.5">{lastSynced}</p>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-5 flex gap-2">
        <button
          onClick={() => setIsVisible(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center mt-6">
        <AccountTypeIcon type={account.type} size="lg" />
        <h2 className="text-2xl font-extrabold text-slate-800 mt-4 text-center">{account.name}</h2>
        <p className="text-sm font-medium text-slate-400 tracking-[0.2em] mt-1">
          **** **** **** {last4}
        </p>
        {account.provider === 'plaid' && (
          <span className="mt-2 text-[10px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-200 uppercase tracking-wider">
            Linked via Plaid
          </span>
        )}
      </div>

      {/* Balance */}
      <div className="mt-6 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{balanceLabel}</p>
        {isVisible ? (
          <p className="text-4xl font-extrabold text-[#159A1D]">{formatCurrency(displayBalance)}</p>
        ) : (
          <p className="text-4xl font-extrabold text-slate-300 tracking-widest">$***.** </p>
        )}
      </div>
    </div>
  );
}

// ─── Account Info Card ────────────────────────────────────────────────────────
export function AccountInfoCard({ account }: { account: Account }) {
  const currencyCode = account.currency || 'USD';

  const formatCurrency = (val?: number | null) => {
    if (val == null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val);
  };

  const rows = [
    { label: 'Account Name',   value: account.name },
    { label: 'Account Type',   value: account.subtype || account.type },
    { label: 'Account Number', value: account.account_number ? `**** **** **** ${account.account_number.slice(-4)}` : 'N/A' },
    account.holder_name
      ? { label: 'Account Holder', value: account.holder_name }
      : null,
    account.balance != null
      ? { label: 'Current Balance',   value: formatCurrency(account.balance) }
      : null,
    account.available_balance != null
      ? { label: 'Available Balance', value: formatCurrency(account.available_balance) }
      : null,
    { label: 'Currency', value: currencyCode },
    account.provider
      ? { label: 'Provider', value: account.provider === 'plaid' ? 'Plaid (Linked)' : 'Manual' }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-base font-extrabold text-slate-800 mb-4">Account Information</h3>
      <div className="divide-y divide-slate-50">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <span className="text-sm text-slate-500 font-medium">{row.label}</span>
            <span className="text-sm text-slate-800 font-bold capitalize text-right max-w-[55%]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
export function TransactionRow({ txn, isLast }: { txn: AccountTransaction; isLast: boolean }) {
  const isDebit = txn.amount > 0;
  const dateStr = new Date(txn.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`flex items-center gap-4 p-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {txn.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={txn.logo_url} alt={txn.merchant_name || txn.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <ShoppingCart size={18} className="text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-slate-800 font-bold text-sm truncate">{txn.merchant_name || txn.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-400 font-medium">{dateStr}</p>
          {txn.pending && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <Clock size={10} /> Pending
            </span>
          )}
        </div>
      </div>

      <p className={`text-sm font-extrabold shrink-0 ${isDebit ? 'text-red-500' : 'text-emerald-600'}`}>
        {isDebit ? '-' : '+'}
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: txn.currency || 'USD' }).format(Math.abs(txn.amount))}
      </p>
    </div>
  );
}
