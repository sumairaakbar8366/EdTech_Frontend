import type { ReactNode } from 'react';

export interface Column<T> {
  /** Header text (empty for action columns). */
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Extra classes for this column's cells. */
  className?: string;
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

/**
 * The app's table: header styling, row dividers, hover and keyboard-accessible row clicks.
 * Feature tables (StudentTable, InvoiceTable…) only declare their columns.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowClassName,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
            {columns.map((c, i) => (
              <th key={i} className={`px-5 py-3 font-semibold ${ALIGN[c.align ?? 'left']}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              {...(onRowClick && {
                tabIndex: 0,
                onClick: () => onRowClick(row),
                onKeyDown: (e: React.KeyboardEvent) => e.key === 'Enter' && onRowClick(row),
              })}
              className={`${onRowClick ? 'cursor-pointer transition-colors hover:bg-primary-500/5 focus:bg-primary-500/5 focus:outline-none' : ''} ${rowClassName?.(row) ?? ''}`}
            >
              {columns.map((c, i) => (
                <td key={i} className={`px-5 py-3 ${ALIGN[c.align ?? 'left']} ${c.className ?? ''}`}>{c.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
