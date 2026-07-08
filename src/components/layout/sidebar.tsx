"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FileText, 
  CircleDollarSign, 
  User, 
  CheckSquare, 
  BarChart3, 
  Target,
  ChevronDown,
  ChevronRight,
  Menu,
  ChevronLeft,
  Bell
} from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Subscription Management",
    icon: ReceiptText,
    items: [
      { title: "Subscriptions", href: "/subscriptions" },
      { title: "Renewal Reminders", href: "/subscriptions/reminders" },
    ]
  },
  {
    title: "Overview",
    icon: FileText,
    items: [
      { title: "Total Balance Tracking", href: "/overview/balance" },
      { title: "Daily Expense Tracking", href: "/overview/expenses" },
    ]
  },
  {
    title: "Transaction Management",
    icon: CircleDollarSign,
    items: [
      { title: "Income Transactions", href: "/transactions/income" },
      { title: "Expense Transactions", href: "/transactions/expense" },
      { title: "Transfer Money Tracking", href: "/transactions/transfer" },
    ]
  },
  {
    title: "Account",
    icon: User,
    items: [
      { title: "Account Summary", href: "/account/summary" },
      { title: "Bank Accounts", href: "/account/banks" },
      { title: "Credit Card Balances", href: "/account/credit-cards" },
      { title: "Investment Accounts", href: "/account/investments" },
    ]
  },
  {
    title: "Payables & Receivables",
    icon: CheckSquare,
    items: [
      { title: "Payables Tracking", href: "/payables/tracking" },
      { title: "Receivables Tracking", href: "/receivables/tracking" },
      { title: "Bills Due Reminder", href: "/payables/bills-due" },
      { title: "Invoice Tracking", href: "/payables/invoices" },
    ]
  },
  {
    title: "Budget & Reports",
    icon: BarChart3,
    items: [
      { title: "Budget Management", href: "/budget/management" },
      { title: "Expense Report", href: "/budget/expense-report" },
      { title: "Monthly Financial Report", href: "/budget/monthly-report" },
      { title: "Daily Balance Report", href: "/budget/daily-balance" },
    ]
  },
  {
    title: "Goals",
    icon: Target,
    items: [
      { title: "Goals Tracking", href: "/goals/tracking" },
    ]
  }
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Subscription Management": true,
    "Overview": true,
    "Transaction Management": true,
    "Account": true,
    "Payables & Receivables": true,
    "Budget & Reports": true,
    "Goals": true,
  });
  const pathname = usePathname();

  const toggleMenu = (title: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const allHrefs = React.useMemo(() => {
    return menuItems.flatMap(item => 
      item.items ? item.items.map(sub => sub.href) : [item.href]
    ).filter(Boolean) as string[];
  }, []);

  const longestMatch = allHrefs
    .filter(href => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  const isPathActive = (href?: string) => {
    return !!href && href === longestMatch;
  };

  return (
    <>
      {/* Mobile Top Header (Visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 px-6 bg-[#0F172A] text-white flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <Image src="/logo/logo.png" alt="Moneylog Logo" width={32} height={32} className="object-contain flex-shrink-0" />
          <Image src="/logo/logo_text.png" alt="Moneylog" width={110} height={28} className="object-contain" />
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile Notification Button */}
          <button className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-300 hover:text-white transition-colors relative">
            <Bell size={20} />
            {/* Notification Dot */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#159A1D] rounded-full border-2 border-[#0F172A]" />
          </button>
          
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-300 hover:text-white transition-colors bg-slate-800/50 rounded-lg border border-slate-700/50">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed md:relative top-0 left-0 h-screen bg-[#0F172A] text-slate-300 transition-all duration-300 z-50 shadow-xl flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16 w-72' : 'w-72'}`}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/50 flex-shrink-0">
          <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            <Image 
              src="/logo/logo.png" 
              alt="Moneylog Logo" 
              width={32} 
              height={32} 
              className="object-contain flex-shrink-0"
            />
            {(!isCollapsed || isMobileOpen) && (
              <Image 
                src="/logo/logo_text.png" 
                alt="Moneylog" 
                width={110} 
                height={28} 
                className="object-contain"
              />
            )}
          </div>
          
          {/* Close button for Mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Collapse button for Desktop */}
          {(!isCollapsed) && (
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="hidden md:block p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Desktop Expand Button */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center mt-2">
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isCollapsed ? 'pt-2 pb-6' : 'py-6'}`}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.href) || (item.items && item.items.some(subItem => isPathActive(subItem.href)));
          const isOpen = openMenus[item.title];

          if (item.href) {
            // Single Link Item
            return (
              <div key={index} className={`px-3 py-2 ${index !== menuItems.length - 1 ? 'border-b border-slate-800/50 mb-2' : ''}`}>
                <div className="relative">
                  {isActive && <div className="absolute -left-3 top-0 bottom-0 w-1 bg-[#159A1D] rounded-r-md" />}
                  <Link 
                    href={item.href}
                    className={`flex text-sm items-center ${isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'} rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-[#159A1D] text-white shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </Link>
                </div>
              </div>
            );
          }

          // Expandable Item
          return (
            <div key={index} className={`px-3 py-2 ${index !== menuItems.length - 1 ? 'border-b border-slate-800/50 mb-2' : ''}`}>
              <div className="relative">
                {isActive && <div className="absolute -left-3 top-0 bottom-0 w-1 bg-[#159A1D] rounded-r-md" />}
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={`w-full flex text-sm items-center ${isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'} rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#159A1D] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.title}</span>
                      <span className={`transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Sub-menu */}
              {!isCollapsed && isOpen && item.items && (
                <div className="mt-2 mb-1 space-y-2 pl-11 pr-3">
                  {item.items.map((subItem, subIndex) => {
                    const isSubActive = isPathActive(subItem.href);
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`flex items-center gap-3 py-1.5 px-3 rounded-lg text-sm transition-colors ${
                          isSubActive ? 'text-white font-medium bg-slate-800/50' : 'text-slate-200 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Green dot for all sub items */}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#159A1D] flex-shrink-0" />
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
        <div className={`flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700/30 transition-all ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-[#159A1D] flex items-center justify-center text-white font-bold tracking-wide flex-shrink-0 shadow-md">
            AR
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">Arjun Reddy</p>
              <p className="text-xs text-slate-500 truncate">Profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
