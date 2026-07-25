import React from 'react';

interface SubscriptionLogoProps {
  name: string;
}

export function SubscriptionLogo({ name }: SubscriptionLogoProps) {
  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  };

  return (
    <div className="w-8 h-8 rounded-full bg-[#1CD491] text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase">
      {getInitials(name)}
    </div>
  );
}
