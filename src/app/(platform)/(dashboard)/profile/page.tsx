"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { UserProfileView } from '@/components/profile/UserProfileView';

export default function ProfilePage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("User Profile", "Manage your personal account details, profile photo, and preferences.", false);
  }, [setHeaderData]);

  return <UserProfileView />;
}
