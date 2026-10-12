"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  PosReceiptSettings, 
  PosGeneralSettings, 
  DEFAULT_RECEIPT_SETTINGS, 
  DEFAULT_GENERAL_SETTINGS 
} from './types';

interface PosSettingsContextType {
  receiptSettings: PosReceiptSettings;
  generalSettings: PosGeneralSettings;
  updateReceiptSettings: (updates: Partial<PosReceiptSettings>) => void;
  updateGeneralSettings: (updates: Partial<PosGeneralSettings>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_RECEIPT = 'moneylog_pos_receipt_settings';
const STORAGE_KEY_GENERAL = 'moneylog_pos_general_settings';

const PosSettingsContext = createContext<PosSettingsContextType | undefined>(undefined);

export function PosSettingsProvider({ children }: { children: ReactNode }) {
  const [receiptSettings, setReceiptSettings] = useState<PosReceiptSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_RECEIPT);
        if (stored) return { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(stored) };
      } catch (err) {
        console.warn('Failed to parse stored receipt settings', err);
      }
    }
    return DEFAULT_RECEIPT_SETTINGS;
  });

  const [generalSettings, setGeneralSettings] = useState<PosGeneralSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_GENERAL);
        if (stored) return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(stored) };
      } catch (err) {
        console.warn('Failed to parse stored general settings', err);
      }
    }
    return DEFAULT_GENERAL_SETTINGS;
  });

  // Sync with localStorage whenever changed
  const updateReceiptSettings = (updates: Partial<PosReceiptSettings>) => {
    setReceiptSettings(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_RECEIPT, JSON.stringify(next));
        } catch (e) {
          console.warn('Error saving receipt settings', e);
        }
      }
      return next;
    });
  };

  const updateGeneralSettings = (updates: Partial<PosGeneralSettings>) => {
    setGeneralSettings(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_GENERAL, JSON.stringify(next));
        } catch (e) {
          console.warn('Error saving general settings', e);
        }
      }
      return next;
    });
  };

  const resetToDefaults = () => {
    setReceiptSettings(DEFAULT_RECEIPT_SETTINGS);
    setGeneralSettings(DEFAULT_GENERAL_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_RECEIPT);
      localStorage.removeItem(STORAGE_KEY_GENERAL);
    }
  };

  return (
    <PosSettingsContext.Provider
      value={{
        receiptSettings,
        generalSettings,
        updateReceiptSettings,
        updateGeneralSettings,
        resetToDefaults,
      }}
    >
      {children}
    </PosSettingsContext.Provider>
  );
}

export function usePosSettings() {
  const context = useContext(PosSettingsContext);
  if (!context) {
    // Return default values as graceful fallback if outside provider
    return {
      receiptSettings: DEFAULT_RECEIPT_SETTINGS,
      generalSettings: DEFAULT_GENERAL_SETTINGS,
      updateReceiptSettings: () => {},
      updateGeneralSettings: () => {},
      resetToDefaults: () => {},
    };
  }
  return context;
}
