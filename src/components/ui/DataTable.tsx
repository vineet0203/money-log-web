import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

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
  density?: 'compact' | 'normal';
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
  pagination,
  enableSelection = false,
  selectedRowIds = [],
  onSelectionChange,
  idKey = 'id',
  expandedRowIds = [],
  renderExpandedRow,
  density = 'normal',
}: DataTableProps<T>) {
  const cellPadding = density === 'compact' ? 'px-3 sm:px-4 py-2.5 sm:py-3' : 'px-4 sm:px-6 py-3.5 sm:py-4';
  const headerPadding = density === 'compact' ? 'px-3 sm:px-4 py-2.5' : 'px-4 sm:px-6 py-3.5';

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageIds = data.map((row: any) => row[idKey]);

    if (e.target.checked) {
      const newSelection = Array.from(new Set([...selectedRowIds, ...currentPageIds]));
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = selectedRowIds.filter((id) => !currentPageIds.includes(id));
      onSelectionChange?.(newSelection);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: any) => {
    e.stopPropagation();
    if (e.target.checked) {
      onSelectionChange?.([...selectedRowIds, id]);
    } else {
      onSelectionChange?.(selectedRowIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                {enableSelection && (
                  <th className={`${headerPadding} w-12 text-center`}>
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4 rounded-md border-slate-300 accent-[#159A1D] opacity-40"
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`${headerPadding} text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100/80">
                  {enableSelection && (
                    <td className={`${cellPadding} text-center`}>
                      <Skeleton variant="rectangular" className="w-4 h-4 rounded-md mx-auto" />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={cellPadding}>
                      <Skeleton
                        variant="text"
                        className={`h-4 ${
                          colIndex === 0
                            ? 'w-36'
                            : colIndex === columns.length - 1
                            ? 'w-16 ml-auto'
                            : 'w-24'
                        }`}
                      />
                    </td>
                  ))}
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              {enableSelection && (
                <th className={`${headerPadding} w-12 text-center`}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-md border-slate-300 text-[#159A1D] focus:ring-[#159A1D]/20 accent-[#159A1D] cursor-pointer"
                    checked={data.length > 0 && data.every((row: any) => selectedRowIds.includes(row[idKey]))}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`${headerPadding} text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap select-none ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="px-6 py-12 text-center">
                  {typeof emptyMessage === 'string' ? (
                    <EmptyState
                      title={emptyMessage}
                      description="No records match your current filter criteria."
                    />
                  ) : (
                    emptyMessage
                  )}
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
                      onClick={(e) => {
                        if (!onRowClick) return;

                        // Prevent row click if the click originated from an interactive control or menu
                        const target = e.target as HTMLElement | null;
                        if (
                          target &&
                          target.closest(
                            'button, a, input, select, textarea, [role="button"], [role="menu"], [role="menuitem"], [data-no-row-click="true"]'
                          )
                        ) {
                          return;
                        }

                        onRowClick(row);
                      }}
                      className={`border-b border-slate-100/80 last:border-0 transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'
                      } ${isSelected ? 'bg-emerald-50/40' : ''}`}
                    >
                      {enableSelection && (
                        <td className={`${cellPadding} text-center`} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded-md border-slate-300 text-[#159A1D] focus:ring-[#159A1D]/20 accent-[#159A1D] cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(e, rowId)}
                          />
                        </td>
                      )}
                      {columns.map((col, colIndex) => {
                        const isActionCol =
                          (typeof col.header === 'string' && /actions?/i.test(col.header)) ||
                          col.key === 'action' ||
                          col.key === 'actions';

                        return (
                          <td
                            key={colIndex}
                            onClick={isActionCol ? (e) => e.stopPropagation() : undefined}
                            className={`${cellPadding} whitespace-nowrap text-xs sm:text-sm font-medium text-slate-700 ${col.className || ''}`}
                          >
                            {col.render ? col.render(row) : col.cell ? col.cell(row) : (row as any)[col.key]}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-slate-50/40 border-b border-slate-100">
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

      {/* Pagination Footer */}
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
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
              <span className="font-bold text-slate-800">{endItem}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.totalItems}</span> {itemName}
            </div>
            <div className="flex items-center gap-3">
              {pagination.itemsPerPageOptions && pagination.onItemsPerPageChange && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Rows:</span>
                  <div className="w-[74px]">
                    <Select
                      size="sm"
                      placement="top"
                      dropdownClassName="min-w-[74px] w-[74px] right-0"
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
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
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#159A1D] text-white font-bold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs font-semibold'
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
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
