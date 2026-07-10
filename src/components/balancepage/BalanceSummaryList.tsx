import React from 'react';

const summaryData = [
  { label: 'Opening Balance', value: '$1,14,760.35', color: 'text-slate-900' },
  { label: 'Money In', value: '+$48,250.00', color: 'text-[#159A1D]' },
  { label: 'Money Out', value: '-38,449.60', color: 'text-red-500' },
  { label: 'Closing Balance', value: '$1,24,560.75', color: 'text-blue-500' },
];

export function BalanceSummaryList() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Balance Summary</h2>
      </div>

      <div className="flex flex-col flex-1 justify-between pb-2">
        {summaryData.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-slate-900">{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.value}</span>
            </div>
            {/* Divider */}
            {index < summaryData.length - 1 && (
              <div className="h-px w-full bg-slate-100" />
            )}
          </React.Fragment>
        ))}
      </div>

    </div>
  );
}
