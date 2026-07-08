import React from 'react';
import { Home, Plane, Laptop } from 'lucide-react';

const goals = [
  { name: 'Home down payment', saved: 34000, target: 50000, percentage: 68, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', barColor: 'bg-blue-600' },
  { name: 'Europe trip', saved: 2100, target: 5000, percentage: 42, icon: Plane, color: 'text-teal-600', bg: 'bg-teal-50', barColor: 'bg-teal-500' },
  { name: 'New laptop', saved: 1820, target: 2000, percentage: 91, icon: Laptop, color: 'text-slate-800', bg: 'bg-slate-100', barColor: 'bg-[#159A1D]' },
];

export function GoalsTrackingCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Goals tracking</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
          + Add
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {goals.map((goal, idx) => {
          const Icon = goal.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${goal.bg} ${goal.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-slate-800">{goal.name}</p>
                  <span className="text-xs font-bold text-slate-800">{goal.percentage}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] text-slate-500 font-medium">
                    ${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${goal.barColor}`} 
                    style={{ width: `${goal.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
