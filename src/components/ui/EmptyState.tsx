import React from 'react';
import Link from 'next/link';
import { Inbox, Plus } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  actionIcon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  actionIcon,
  className = '',
  compact = false,
}: EmptyStateProps) {
  const defaultIcon = <Inbox size={compact ? 24 : 36} className="text-slate-400" />;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'p-6' : 'p-12'
      } ${className}`}
    >
      <div
        className={`rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 ${
          compact ? 'w-12 h-12' : 'w-16 h-16'
        }`}
      >
        {icon || defaultIcon}
      </div>

      <h3
        className={`font-bold text-slate-900 ${
          compact ? 'text-base mb-1' : 'text-lg mb-1.5'
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-slate-500 font-medium max-w-sm ${
            compact ? 'text-xs mb-3' : 'text-sm mb-6'
          }`}
        >
          {description}
        </p>
      )}

      {actionText && (
        <div>
          {actionHref ? (
            <Link href={actionHref}>
              <Button size={compact ? 'sm' : 'md'} className="gap-2">
                {actionIcon || <Plus size={16} />}
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button
              size={compact ? 'sm' : 'md'}
              onClick={onAction}
              className="gap-2"
            >
              {actionIcon || <Plus size={16} />}
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
