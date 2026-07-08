import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  cancelText?: string;
  submitText?: string;
  isSubmitDisabled?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  cancelText = 'Cancel',
  submitText = 'Submit',
  isSubmitDisabled = false,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col my-8 sm:my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Visible overflow for dropdowns) */}
        <div className="p-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#159A1D] rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
