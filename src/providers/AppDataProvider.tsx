"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AppDataContextType {
  title: string;
  description?: string;
  canBack?: boolean;
  setHeaderData: (title: string, description?: string, canBack?: boolean) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [canBack, setCanBack] = useState<boolean>(false);

  const setHeaderData = useCallback((newTitle: string, newDescription?: string, newCanBack: boolean = false) => {
    setTitle(newTitle);
    setDescription(newDescription);
    setCanBack(newCanBack);
  }, []);

  return (
    <AppDataContext.Provider value={{ title, description, canBack, setHeaderData }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
