import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onClick?: () => void;
}

export function AddSubscriptionCard({ onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      className="bg-[#159A1D] hover:bg-green-700 transition-colors rounded-xl p-4 md:p-5 shadow-sm border border-[#159A1D] flex items-center gap-4 text-left w-full h-full"
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Plus className="text-[#159A1D]" size={36} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white">Add Subscription</h3>
        <p className="text-xs text-white/90 mt-1.5 leading-snug">
          Add a new subscription to get started.
        </p>
      </div>
    </button>
  );
}
