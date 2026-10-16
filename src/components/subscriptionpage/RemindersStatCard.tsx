import React from 'react';
import { StatCard, StatColor } from '@/components/ui/StatCard';

export interface RemindersStatCardProps {
  icon: any;
  title: string;
  value: string | number;
  subLabel: string;
  theme: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  subLabelAction?: string;
}

const themeToColor: Record<string, StatColor> = {
  blue: 'blue',
  green: 'green',
  orange: 'amber',
  red: 'rose',
  purple: 'purple',
};

export function RemindersStatCard({
  icon: Icon,
  title,
  value,
  subLabel,
  theme,
  subLabelAction
}: RemindersStatCardProps) {
  return (
    <StatCard
      icon={Icon}
      title={title}
      value={value}
      color={themeToColor[theme] || 'green'}
      subtitle={
        <div className="flex items-center justify-between w-full">
          <span>{subLabel}</span>
          {subLabelAction && (
            <span className="font-semibold text-emerald-600 hover:underline cursor-pointer">
              {subLabelAction}
            </span>
          )}
        </div>
      }
    />
  );
}

