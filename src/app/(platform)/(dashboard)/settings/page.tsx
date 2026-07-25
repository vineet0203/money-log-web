"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

export default function SettingsPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Settings", "Manage your application preferences and settings.", false);
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12 space-y-6">
      <NotificationSettings />
    </div>
  );
}
