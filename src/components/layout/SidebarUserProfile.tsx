"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGetProfile } from '@/hooks/queries/user';
import { useLogout } from '@/hooks/queries/auth';
import { Loader2, LogOut, User, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { useQueryClient } from '@tanstack/react-query';

interface SidebarUserProfileProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

export function SidebarUserProfile({ isCollapsed, isMobileOpen }: SidebarUserProfileProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const logoutMutation = useLogout();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setIsLogoutModalOpen(false);
        router.push('/login');
      },
      onError: () => {
        // Fallback: forcefully clear cookies via middleware killswitch if backend network fails
        queryClient.clear();
        setIsLogoutModalOpen(false);
        window.location.href = '/login?clear=1';
      }
    });
  };

  return (
    <div className="p-4 border-t border-slate-800/50 flex-shrink-0 relative" ref={menuRef}>
      {isOpen && (
        <div className={`absolute ${isCollapsed && !isMobileOpen ? 'left-4 w-64' : 'left-4 right-4'} bottom-[100%] mb-2 bg-[#1E293B] border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2`}>
          <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#159A1D] flex items-center justify-center text-white font-bold tracking-wide flex-shrink-0 shadow-inner">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getInitials(profile?.name)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {isLoading ? 'Loading...' : (profile?.name || 'User')}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile?.email || profile?.phone_number || 'No email provided'}
              </p>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <Link 
              href="/account/summary"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <User size={16} />
              Profile
            </Link>
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button 
              onClick={() => {
                setIsOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700/30 transition-all hover:bg-slate-700/50 ${isCollapsed ? 'md:justify-center' : ''}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#159A1D] flex items-center justify-center text-white font-bold tracking-wide flex-shrink-0 shadow-md">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : getInitials(profile?.name)}
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {isLoading ? 'Loading...' : (profile?.name || 'User')}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {profile?.email || 'No email provided'}
              </p>
            </div>
            <div className="text-slate-500">
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </>
        )}
      </button>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onSubmit={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out of Moneylog? You will need to verify your phone number to sign back in."
        submitText="Yes, Log Out"
        cancelText="Cancel"
        isSubmitDisabled={logoutMutation.isPending}
      >
        <p className="text-slate-600">
          This will securely end your current session across this browser.
        </p>
      </Modal>
    </div>
  );
}
