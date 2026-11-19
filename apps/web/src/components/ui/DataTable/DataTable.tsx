import { useState, type ReactNode } from 'react';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { useNarrow } from '@/lib/hooks/useNarrow';
import { matchesText } from '@/lib/textMatch';

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
 * Feature tables (StudentTable, InvoiceTable…) only declare their columns. With `searchText` a
 * search box above the table narrows the rows already loaded (every typed word must appear).
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowClassName,
  searchText,
  searchPlaceholder = 'Search…',
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  /** The values a row can be found by (names, numbers, statuses…). */
  searchText?: (row: T) => (string | number | null | undefined)[];
  searchPlaceholder?: string;
}) {
  const [text, setText] = useState('');
  const narrow = useNarrow();
  const shown = searchText && text ? rows.filter((r) => matchesText(text, ...searchText(r))) : rows;
  return (
    <>
    {searchText && (
      <div className="border-b border-slate-200 p-4 dark:border-white/5"><SearchInput label="Search table" value={text} onChange={setText} placeholder={searchPlaceholder} /></div>
    )}
    {searchText && text && shown.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">Nothing matches “{text}”.</p>}
    {narrow ? (
      /* Phones: each row is a card (the first column is its title, the other columns are label / value lines), so nothing is cut off or scrolls sideways. */
      <div className="divide-y divide-slate-200/70 dark:divide-white/5">
        {shown.map((row) => {
          const [first, ...rest] = columns;
          const fields = rest.filter((c) => c.header);
          const actions = rest.filter((c) => !c.header);
          return (
            <div
              key={rowKey(row)}
              {...(onRowClick && { tabIndex: 0, role: 'button', onClick: () => onRowClick(row), onKeyDown: (e: React.KeyboardEvent) => e.key === 'Enter' && onRowClick(row) })}
              className={`px-4 py-3 ${onRowClick ? 'cursor-pointer active:bg-primary-500/5' : ''} ${rowClassName?.(row) ?? ''}`}
            >
              {first && <div className="min-w-0 break-words">{first.cell(row)}</div>}
              {fields.length > 0 && (
                <dl className="mt-2 space-y-1 text-sm">
                  {fields.map((c, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.header}</dt>
                      <dd className="min-w-0 break-words text-right">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {actions.length > 0 && <div className="mt-2 flex flex-wrap justify-end gap-2">{actions.map((c, i) => <div key={i}>{c.cell(row)}</div>)}</div>}
            </div>
          );
        })}
      </div>
    ) : (
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
          {shown.map((row) => (
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
    )}
    </>
  );
}
