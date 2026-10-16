import React from 'react';
import { StatCard, StatColor } from '@/components/ui/StatCard';
import { RefreshCw } from 'lucide-react';

export interface SubscriptionStatCardProps {
  title: string;
  value: string | number;
  theme?: 'green' | 'blue' | 'red' | 'orange';
}

const themeToColor: Record<string, StatColor> = {
  green: 'green',
  blue: 'blue',
  red: 'rose',
  orange: 'amber',
};

export function SubscriptionStatCard({ title, value, theme = 'green' }: SubscriptionStatCardProps) {
  return (
    <StatCard
      title={title}
      value={value}
      color={themeToColor[theme] || 'green'}
      icon={RefreshCw}
    />
  );
}

