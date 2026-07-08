import React from 'react';

const expenseCategories = [
  { name: 'Food', amount: '$1,200', percent: '38%', color: 'bg-orange-500' },
  { name: 'Transport', amount: '$700', percent: '22%', color: 'bg-yellow-400' },
  { name: 'Healthcare', amount: '$400', percent: '12%', color: 'bg-yellow-300' },
  { name: 'Education', amount: '$300', percent: '9%', color: 'bg-[#159A1D]' },
  { name: 'Clothes', amount: '$250', percent: '8%', color: 'bg-[#159A1D]' },
];

export function RecentExpenseList() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900">Recent Expense</h2>
        <button className="text-[#159A1D] text-sm font-bold hover:underline">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2">
        {expenseCategories.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="font-bold text-[#4F627A]">{item.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#849AB4] font-medium">{item.amount}</span>
                <span className="text-slate-900 font-extrabold w-10 text-right">{item.percent}</span>
              </div>
              
            </div>
            {/* Soft underline divider */}
            {index < expenseCategories.length - 1 && (
              <div className="h-px w-full bg-slate-100 mt-5" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
