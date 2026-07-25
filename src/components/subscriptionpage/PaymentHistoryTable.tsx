import React from 'react';
import { History } from 'lucide-react';

interface Transaction {
  id: number;
  title: string;
  date: string;
  amount: string;
  description?: string;
  receipt_url?: string;
}

interface PaymentHistoryTableProps {
  transactions: Transaction[];
}

export function PaymentHistoryTable({ transactions }: PaymentHistoryTableProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No payment history found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold">
            <th className="py-3 px-4 font-extrabold w-[130px]">Date & Time</th>
            <th className="py-3 px-4 font-extrabold">Payment</th>
            <th className="py-3 px-4 font-extrabold w-[250px]">Description</th>
            <th className="py-3 px-4 font-extrabold w-[100px] text-center">Receipt</th>
            <th className="py-3 px-4 font-extrabold text-right w-[100px]">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {transactions.map((tx) => {
            const txDate = new Date(tx.date);
            const dateStr = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = txDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            return (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{dateStr}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{timeStr}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[#E7F8F0] text-[#159A1D] flex items-center justify-center">
                      <History size={14} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-slate-700 truncate max-w-[150px]">
                      {tx.title || 'Subscription Payment'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-[250px]">
                    {tx.description || '-'}
                  </p>
                </td>
                <td className="py-3 px-4 text-center">
                  {tx.receipt_url ? (
                    <a 
                      href={tx.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img 
                        src={tx.receipt_url} 
                        alt="Receipt" 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-extrabold text-slate-900">${parseFloat(tx.amount).toFixed(2)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
