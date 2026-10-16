import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the requested data. Please check your connection and try again.',
  onRetry,
  retryText = 'Try Again',
  className = '',
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'p-6' : 'p-12'
      } ${className}`}
    >
      <div
        className={`rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mb-4 ${
          compact ? 'w-12 h-12' : 'w-16 h-16'
        }`}
      >
        <AlertCircle size={compact ? 24 : 32} />
      </div>

      <h3
        className={`font-bold text-slate-900 ${
          compact ? 'text-base mb-1' : 'text-lg mb-1.5'
        }`}
      >
        {title}
      </h3>

      {message && (
        <p
          className={`text-slate-500 font-medium max-w-sm ${
            compact ? 'text-xs mb-3' : 'text-sm mb-6'
          }`}
        >
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          variant="secondary"
          size={compact ? 'sm' : 'md'}
          onClick={onRetry}
          className="gap-2"
        >
          <RotateCcw size={15} />
          {retryText}
        </Button>
      )}
    </div>
  );
}
