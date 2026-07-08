import React from 'react';

export interface RemindersStatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subLabel: string;
  theme: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  subLabelAction?: string;
}

export function RemindersStatCard({
  icon: Icon,
  title,
  value,
  subLabel,
  theme,
  subLabelAction
}: RemindersStatCardProps) {
  // Theme dictionaries
  const themes = {
    blue: {
      cardBorder: 'border-blue-100',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-500',
      valueColor: 'text-blue-600',
      subLabelColor: 'text-blue-400',
    },
    green: {
      cardBorder: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
      subLabelColor: 'text-emerald-400',
    },
    orange: {
      cardBorder: 'border-orange-100',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-500',
      valueColor: 'text-orange-600',
      subLabelColor: 'text-orange-400',
    },
    red: {
      cardBorder: 'border-red-100',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
      valueColor: 'text-red-600',
      subLabelColor: 'text-red-400',
    },
    purple: {
      cardBorder: 'border-indigo-100',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      titleColor: 'text-indigo-500',
      valueColor: 'text-indigo-600',
      subLabelColor: 'text-indigo-400',
    }
  };

  const t = themes[theme];

  return (
    <div className={`bg-white rounded-2xl p-5 border ${t.cardBorder} shadow-sm flex items-start gap-4 transition-all hover:shadow-md`}>
      {/* Icon Area */}
      <div className={`w-14 h-14 rounded-2xl ${t.iconBg} ${t.iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col gap-1 w-full">
        <span className={`text-xs font-bold ${t.titleColor}`}>{title}</span>
        <span className={`text-3xl font-extrabold ${t.valueColor} leading-tight`}>{value}</span>
        
        <div className="flex items-center justify-between w-full mt-1">
          <span className={`text-xs font-semibold ${t.subLabelColor}`}>{subLabel}</span>
          {subLabelAction && (
            <span className={`text-xs font-bold ${t.subLabelColor} hover:underline cursor-pointer flex items-center`}>
              {subLabelAction}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
