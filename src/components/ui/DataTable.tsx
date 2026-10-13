import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from './Select';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
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
    itemsPerPageOptions?: number[];
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
  enableSelection?: boolean;
  selectedRowIds?: (string | number)[];
  onSelectionChange?: (selectedIds: any[]) => void;
  idKey?: string;
  expandedRowIds?: (string | number)[];
  renderExpandedRow?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  enableSelection = false,
  selectedRowIds = [],
  onSelectionChange,
  idKey = 'id',
  expandedRowIds = [],
  renderExpandedRow,
}: DataTableProps<T>) {

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageIds = data.map((row: any) => row[idKey]);
    
    if (e.target.checked) {
      // Add all current page IDs to existing selection (avoiding duplicates)
      const newSelection = Array.from(new Set([...selectedRowIds, ...currentPageIds]));
      onSelectionChange?.(newSelection);
    } else {
      // Remove only the current page IDs from the existing selection
      const newSelection = selectedRowIds.filter(id => !currentPageIds.includes(id));
      onSelectionChange?.(newSelection);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: any) => {
    e.stopPropagation(); // Prevent row click
    if (e.target.checked) {
      onSelectionChange?.([...selectedRowIds, id]);
    } else {
      onSelectionChange?.(selectedRowIds.filter((selectedId) => selectedId !== id));
    }
  };
  // Loading State (Shimmer Effect)
  if (isLoading) {
    return (
      <div className="w-full flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
            <tr className="border-b border-slate-100">
              {enableSelection && (
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]"
                    checked={data.length > 0 && data.every((row: any) => selectedRowIds.includes(row[idKey]))}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
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
                  {enableSelection && (
                    <td className="px-6 py-5">
                      <div className="w-4 h-4 rounded bg-slate-200 animate-pulse"></div>
                    </td>
                  )}
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
                    } else if (col.key === 'action' || col.header === 'Action' || col.key === 'actions' || col.header === 'Actions') {
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
              {enableSelection && (
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]"
                    checked={data.length > 0 && data.every((row: any) => selectedRowIds.includes(row[idKey]))}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
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
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="px-6 py-12 text-center text-slate-500">
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
              data.map((row, rowIndex) => {
                const rowId = (row as any)[idKey];
                const isSelected = selectedRowIds.includes(rowId);
                const isExpanded = expandedRowIds.includes(rowId);
                
                return (
                  <React.Fragment key={rowId ?? rowIndex}>
                    <tr 
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`border-b border-slate-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'} ${isSelected ? 'bg-green-50/30' : ''}`}
                    >
                      {enableSelection && (
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-[#159A1D] focus:ring-[#159A1D]"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(e, rowId)}
                          />
                        </td>
                      )}
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-slate-600 ${col.className || ''}`}>
                          {col.render ? col.render(row) : col.cell ? col.cell(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-slate-50/30 border-b border-slate-100">
                        <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="p-0">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
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
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
              <span className="font-bold text-slate-800">{endItem}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.totalItems}</span> {itemName}
            </div>
            <div className="flex items-center gap-3">
              {pagination.itemsPerPageOptions && pagination.onItemsPerPageChange && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Rows per page:</span>
                  <div className="w-[78px]">
                    <Select
                      size="sm"
                      placement="top"
                      dropdownClassName="min-w-[78px] w-[78px] right-0"
                      value={pagination.itemsPerPage}
                      onChange={(val) => pagination.onItemsPerPageChange?.(Number(val))}
                      options={pagination.itemsPerPageOptions.map((opt) => ({
                        value: opt,
                        label: String(opt),
                      }))}
                    />
                  </div>
                </div>
              )}

              {pagination.itemsPerPageOptions && pagination.onItemsPerPageChange && (
                <div className="h-4 w-px bg-slate-200 hidden sm:block mx-0.5" />
              )}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors shadow-2xs"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1 mx-0.5">
                  {pageNumbers.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold">
                          ...
                        </span>
                      );
                    }

                    const isCurrent = pagination.currentPage === page;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => pagination.onPageChange(page as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                          isCurrent 
                            ? 'bg-[#159A1D] text-white font-bold shadow-xs' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors shadow-2xs"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
