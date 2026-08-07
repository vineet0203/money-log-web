"use client";

import React from 'react';
import { Plus } from 'lucide-react';

export function AddAccountButton() {
  const handleAddAccount = () => {
    // Logic for opening modal or navigating to Plaid Link will go here
    console.log("Add account clicked from button component");
  };

  return (
    <button 
      onClick={handleAddAccount}
      className="bg-[#159A1D] hover:bg-green-700 transition-colors rounded-xl px-4 py-2 flex items-center gap-2 text-white shadow-sm font-semibold text-sm whitespace-nowrap"
    >
      <Plus size={18} strokeWidth={2.5} />
      Add Account
    </button>
  );
}
