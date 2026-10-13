"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  PosReceiptSettings, 
  PosGeneralSettings, 
  DEFAULT_RECEIPT_SETTINGS, 
  DEFAULT_GENERAL_SETTINGS 
} from './types';
import { useGetPosSettings, useUpdatePosSettings } from '@/hooks/queries/posSettings';

export interface PosSettingsContextType {
  receiptSettings: PosReceiptSettings;
  generalSettings: PosGeneralSettings;
  isLoading: boolean;
  isSaving: boolean;
  updateReceiptSettings: (updates: Partial<PosReceiptSettings>) => void;
  updateGeneralSettings: (updates: Partial<PosGeneralSettings>) => void;
  saveSettings: (settingsToSave?: Partial<PosReceiptSettings>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
}

const STORAGE_KEY_RECEIPT = 'moneylog_pos_receipt_settings';
const STORAGE_KEY_GENERAL = 'moneylog_pos_general_settings';

const PosSettingsContext = createContext<PosSettingsContextType | undefined>(undefined);

export function PosSettingsProvider({ children }: { children: ReactNode }) {
  // Query backend settings
  const { data: serverSettings, isLoading } = useGetPosSettings();
  const updateMutation = useUpdatePosSettings();

  const [receiptSettings, setReceiptSettings] = useState<PosReceiptSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_RECEIPT);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.taxes || !Array.isArray(parsed.taxes)) {
            parsed.taxes = DEFAULT_RECEIPT_SETTINGS.taxes;
          }
          return { ...DEFAULT_RECEIPT_SETTINGS, ...parsed, currencySymbol: '$', currencyCode: 'USD' };
        }
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
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.taxes || !Array.isArray(parsed.taxes)) {
            parsed.taxes = DEFAULT_GENERAL_SETTINGS.taxes;
          }
          const defaultTaxRate = parsed.taxes.reduce((sum: number, t: any) => sum + (Number(t.percentage) || 0), 0);
          return { ...DEFAULT_GENERAL_SETTINGS, ...parsed, currencySymbol: '$', currencyCode: 'USD', defaultTaxRate };
        }
      } catch (err) {
        console.warn('Failed to parse stored general settings', err);
      }
    }
    return DEFAULT_GENERAL_SETTINGS;
  });

  // When backend settings are loaded, synchronize state and cache
  useEffect(() => {
    if (serverSettings) {
      const mergedReceipt: PosReceiptSettings = {
        ...DEFAULT_RECEIPT_SETTINGS,
        ...serverSettings,
        currencySymbol: '$',
        currencyCode: 'USD',
        taxes: Array.isArray(serverSettings.taxes) && serverSettings.taxes.length > 0
          ? serverSettings.taxes
          : DEFAULT_RECEIPT_SETTINGS.taxes,
      };

      setReceiptSettings(mergedReceipt);

      const taxes = mergedReceipt.taxes;
      const defaultTaxRate = taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);

      const mergedGeneral: PosGeneralSettings = {
        ...DEFAULT_GENERAL_SETTINGS,
        currencySymbol: '$',
        currencyCode: 'USD',
        taxes,
        defaultTaxRate,
        isTaxInclusive: Boolean(serverSettings.isTaxInclusive),
        cashDrawerFloat: Number(serverSettings.cashDrawerFloat) || DEFAULT_GENERAL_SETTINGS.cashDrawerFloat,
      };

      setGeneralSettings(mergedGeneral);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_RECEIPT, JSON.stringify(mergedReceipt));
          localStorage.setItem(STORAGE_KEY_GENERAL, JSON.stringify(mergedGeneral));
        } catch (e) {
          console.warn('Error syncing settings to localStorage', e);
        }
      }
    }
  }, [serverSettings]);

  // Local state update (optimistic / draft update)
  const updateReceiptSettings = (updates: Partial<PosReceiptSettings>) => {
    setReceiptSettings(prev => {
      const next = { ...prev, ...updates, currencySymbol: '$', currencyCode: 'USD' };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_RECEIPT, JSON.stringify(next));
        } catch (e) {
          console.warn('Error saving receipt settings', e);
        }
      }
      return next;
    });

    setGeneralSettings(prev => {
      const synched: Partial<PosGeneralSettings> = {};
      if (updates.taxes !== undefined) {
        synched.taxes = updates.taxes;
        synched.defaultTaxRate = updates.taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
      }
      if (updates.isTaxInclusive !== undefined) synched.isTaxInclusive = updates.isTaxInclusive;
      
      const next = { ...prev, ...synched, currencySymbol: '$', currencyCode: 'USD' };
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

  const updateGeneralSettings = (updates: Partial<PosGeneralSettings>) => {
    setGeneralSettings(prev => {
      const next = { ...prev, ...updates, currencySymbol: '$', currencyCode: 'USD' };
      if (next.taxes && Array.isArray(next.taxes)) {
        next.defaultTaxRate = next.taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_GENERAL, JSON.stringify(next));
        } catch (e) {
          console.warn('Error saving general settings', e);
        }
      }
      return next;
    });

    setReceiptSettings(prev => {
      const synched: Partial<PosReceiptSettings> = {};
      if (updates.taxes !== undefined) synched.taxes = updates.taxes;
      if (updates.isTaxInclusive !== undefined) synched.isTaxInclusive = updates.isTaxInclusive;

      const next = { ...prev, ...synched, currencySymbol: '$', currencyCode: 'USD' };
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

  // Persistent server save
  const saveSettings = async (settingsToSave?: Partial<PosReceiptSettings>): Promise<boolean> => {
    const payload: Partial<PosReceiptSettings> = {
      ...(settingsToSave || receiptSettings),
      currencySymbol: '$',
      currencyCode: 'USD',
    };

    try {
      const saved = await updateMutation.mutateAsync(payload);
      const merged: PosReceiptSettings = {
        ...receiptSettings,
        ...saved,
        currencySymbol: '$',
        currencyCode: 'USD',
      };
      setReceiptSettings(merged);

      const taxes = Array.isArray(merged.taxes) && merged.taxes.length > 0
        ? merged.taxes
        : DEFAULT_GENERAL_SETTINGS.taxes;
      const defaultTaxRate = taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);

      setGeneralSettings(prev => ({
        ...prev,
        currencySymbol: '$',
        currencyCode: 'USD',
        taxes,
        defaultTaxRate,
        isTaxInclusive: Boolean(merged.isTaxInclusive),
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_RECEIPT, JSON.stringify(merged));
          localStorage.setItem(STORAGE_KEY_GENERAL, JSON.stringify({
            ...generalSettings,
            currencySymbol: '$',
            currencyCode: 'USD',
            taxes,
            defaultTaxRate,
            isTaxInclusive: Boolean(merged.isTaxInclusive),
          }));
        } catch (e) {
          console.warn('Error saving settings to storage', e);
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to save POS settings to backend:', error);
      // Still update local state so user doesn't lose current form data
      updateReceiptSettings(payload);
      throw error;
    }
  };

  const resetToDefaults = async (): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync(DEFAULT_RECEIPT_SETTINGS);
    } catch (err) {
      console.warn('Reset on backend failed, resetting locally:', err);
    }

    setReceiptSettings(DEFAULT_RECEIPT_SETTINGS);
    setGeneralSettings(DEFAULT_GENERAL_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_RECEIPT);
      localStorage.removeItem(STORAGE_KEY_GENERAL);
    }
    return true;
  };

  return (
    <PosSettingsContext.Provider
      value={{
        receiptSettings,
        generalSettings,
        isLoading,
        isSaving: updateMutation.isPending,
        updateReceiptSettings,
        updateGeneralSettings,
        saveSettings,
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
    return {
      receiptSettings: DEFAULT_RECEIPT_SETTINGS,
      generalSettings: DEFAULT_GENERAL_SETTINGS,
      isLoading: false,
      isSaving: false,
      updateReceiptSettings: () => {},
      updateGeneralSettings: () => {},
      saveSettings: async () => false,
      resetToDefaults: async () => false,
    };
  }
  return context;
}
