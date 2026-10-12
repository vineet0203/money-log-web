"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/providers/AppDataProvider';

export default function AddReceiptForm() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    setHeaderData("Upload New Receipt", "Upload an image or PDF of your receipt.", true);
  }, [setHeaderData]);

  // Handle paste events to upload images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            setFile(pastedFile);
            setPreviewUrl(URL.createObjectURL(pastedFile));
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleScan = () => {
    if (!file) return;
    
    // In a real implementation:
    // 1. Upload `file` to /api/receipts/upload
    // 2. Node.js processes it with PaddleOCR
    // 3. Node.js returns the new receipt ID (e.g. RCP-1003)
    // 4. router.push(`/transactions/receipts/${newId}`)
    
    // For now, simulate routing to our mock "Needs Review" receipt
    router.push('/transactions/receipts/RCP-1001');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 max-w-2xl mx-auto space-y-6">
          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <UploadCloud className="mx-auto text-[#159A1D] mb-4" size={48} />
              <p className="text-base text-slate-900 font-semibold mb-1">Click to upload, drag and drop, or Paste image</p>
              <p className="text-sm text-[#849AB4]">PNG, JPG, PDF (max. 10MB)</p>
              <input 
                type="file" 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.pdf" 
                id="receipt-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="receipt-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 truncate">{file?.name || 'Pasted Image'}</span>
                <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-slate-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex justify-center">
                <img src={previewUrl} alt="Preview" className="object-contain h-full w-full" />
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end">
            <Button onClick={handleScan} disabled={!file} className="w-full sm:w-auto">
              Scan Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
