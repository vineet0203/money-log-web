import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    itemName?: string;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  // Loading State (Shimmer Effect)
  if (isLoading) {
    return (
      <div className="w-full flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 font-bold text-slate-900 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-50">
                  {columns.map((col, colIndex) => {
                    let skeletonContent;
                    
                    if (col.key === 'name' || col.header === 'Subscription') {
                      skeletonContent = (
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </div>
                      );
                    } else if (col.key === 'dueDate' || col.header === 'Due Date') {
                      skeletonContent = (
                        <div className="flex flex-col gap-2">
                          <div className="h-3 bg-slate-200 rounded w-20"></div>
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      );
                    } else if (col.key === 'amount' || col.header === 'Amount') {
                      skeletonContent = (
                        <div className="flex flex-col gap-2">
                          <div className="h-4 bg-slate-200 rounded w-12"></div>
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      );
                    } else if (col.key === 'status' || col.header === 'Status') {
                      skeletonContent = <div className="h-6 bg-slate-200 rounded-md w-16"></div>;
                    } else if (col.key === 'action' || col.header === 'Action') {
                      skeletonContent = <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>;
                    } else {
                      skeletonContent = <div className="h-4 bg-slate-200 rounded w-full max-w-[80%]"></div>;
                    }

                    return (
                      <td key={colIndex} className="px-6 py-5">
                        <div className="animate-pulse flex">
                          {skeletonContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 font-bold text-slate-900 whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    {typeof emptyMessage === 'string' ? (
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    ) : (
                      emptyMessage
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-slate-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-slate-600 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && data.length > 0 && (() => {
        const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
        const itemName = pagination.itemName || 'entries';
        
        const pageNumbers: (number | string)[] = [];
        const { currentPage, totalPages } = pagination;

        if (totalPages <= 5) {
          for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          if (currentPage <= 3) {
            pageNumbers.push(1, 2, 3, 4, '...', totalPages);
          } else if (currentPage >= totalPages - 2) {
            pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
          } else {
            pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
          }
        }

        return (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <span className="text-sm text-[#849AB4] font-medium">
              Showing {startItem} to {endItem} of {pagination.totalItems} {itemName}
            </span>
            <div className="flex items-center">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-1.5 text-[#849AB4] hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1 mx-0.5">
                {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1 text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pagination.currentPage === page 
                        ? 'bg-[#159A1D] text-white' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              </div>

              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-1.5 text-[#849AB4] hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
