import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AppDataProvider } from '@/providers/AppDataProvider';
import { ProfileGatekeeper } from '@/components/auth/ProfileGatekeeper';
import { PosSettingsProvider } from '@/components/pos/settings/PosSettingsContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <PosSettingsProvider>
        <ProfileGatekeeper>
          <div className="flex flex-col md:flex-row h-screen bg-[#0F172A] overflow-hidden">
            {/* Sidebar Section */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 bg-gray-50 md:rounded-tl-2xl rounded-t-2xl md:rounded-tr-none overflow-hidden relative shadow-2xl flex flex-col mt-2 md:mt-0">
            <div className="flex-1 overflow-y-auto p-4 md:px-8 md:pb-8 md:pt-4 custom-scrollbar">
              <Header />
              <React.Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Loading...</div>}>
                {children}
              </React.Suspense>
            </div>
          </main>
        </div>
        </ProfileGatekeeper>
      </PosSettingsProvider>
    </AppDataProvider>
  );
}
