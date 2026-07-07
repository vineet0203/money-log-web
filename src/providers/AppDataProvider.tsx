"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AppDataContextType {
  title: string;
  description?: string;
  setHeaderData: (title: string, description?: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string | undefined>(undefined);

  const setHeaderData = useCallback((newTitle: string, newDescription?: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
  }, []);

  return (
    <AppDataContext.Provider value={{ title, description, setHeaderData }}>
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
