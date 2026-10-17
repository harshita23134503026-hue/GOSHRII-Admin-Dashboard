import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No matching records'}
        description={emptyDescription || 'Try adjusting your search query or filters.'}
      />
    );
  }

  return (
    <div className={`w-full overflow-hidden bg-white rounded-card border border-border-light shadow-card ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-ink-primary border-collapse">
          <thead>
            <tr className="bg-surface-secondary/80 border-b border-border-light">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const alignClasses =
                  col.align === 'right'
                    ? 'text-right justify-end'
                    : col.align === 'center'
                    ? 'text-center justify-center'
                    : 'text-left justify-start';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 font-semibold text-ink-secondary uppercase tracking-wider text-[11px] ${
                      col.className || ''
                    }`}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className={`inline-flex items-center gap-1.5 hover:text-ink-primary transition-colors focus:outline-none ${alignClasses}`}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <div className={`flex items-center ${alignClasses}`}>{col.header}</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light/60">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-surface-secondary/60'
                    : 'hover:bg-surface-secondary/30'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 align-middle ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
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
