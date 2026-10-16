import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200/80';
  const variantClasses = {
    text: 'rounded-md h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
  }[variant];

  const inlineStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 ${className}`}>
      <Skeleton variant="text" width="40%" height={16} />
      <Skeleton variant="text" width="60%" height={28} />
      <Skeleton variant="text" width="30%" height={14} />
    </div>
  );
}

export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px] ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="rectangular" width={90} height={32} />
      </div>
      <div className="flex-1 w-full flex items-end gap-3 pt-6 pb-2">
        {[40, 65, 30, 85, 55, 90, 45, 70, 80, 60, 95, 50].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              variant="rectangular"
              className="w-full rounded-t-lg"
              height={`${h}%`}
            />
            <Skeleton variant="text" height={10} width="80%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <Skeleton variant="text" width={180} height={20} />
        <Skeleton variant="rectangular" width={120} height={32} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                variant="text"
                height={16}
                className={cIdx === 0 ? 'w-1/3' : 'flex-1'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
