"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';

export default function DashboardPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Dashboard", "Welcome back, Arjun! Here is what's happening with your finances today.");
  }, [setHeaderData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Placeholder content cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <h3 className="text-gray-500 font-medium">Total Balance</h3>
          <p className="text-3xl font-bold text-gray-900">$24,500.00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <h3 className="text-gray-500 font-medium">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <h3 className="text-gray-500 font-medium">Monthly Expenses</h3>
          <p className="text-3xl font-bold text-gray-900">$4,230.50</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex items-center justify-center">
        <p className="text-gray-400">Chart Placeholder</p>
      </div>
    </div>
  );
}
