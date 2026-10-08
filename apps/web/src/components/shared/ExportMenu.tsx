import { ChevronDown, Download, FileSpreadsheet, FileText, Lock } from 'lucide-react';
import { useSubscription } from '@/features/billing/billing';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { errorMessage } from '@/lib/errors';
import { exportSheet, type ExportColumn, type SheetFormat } from '@/lib/spreadsheet';

/**
 * "Export" button with an Excel / CSV choice. `rows` fetches everything to export (all pages,
 * current filters), so the file is complete rather than just the visible page.
 */
export function ExportMenu<T>({ rows, columns, fileName, label = 'Export' }: { rows: () => Promise<T[]>; columns: ExportColumn<T>[]; fileName: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const plan = useSubscription().data;
  const locked = !!plan && !plan.features.includes('import_export');

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const run = async (format: SheetFormat) => {
    setOpen(false);
    setBusy(true);
    try {
      const data = await rows();
      if (!data.length) { toast.error('Nothing to export with the current filters.'); return; }
      await exportSheet(data, columns, fileName, format);
      toast.success(`Exported ${data.length} row${data.length === 1 ? '' : 's'}`);
    } catch (e) {
      toast.error(errorMessage(e, 'Export failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <Button variant="secondary" icon={locked ? Lock : Download} loading={busy} onClick={() => (locked ? toast.error('Excel import & export is included from the Growth plan.') : setOpen((o) => !o))} aria-haspopup="menu" aria-expanded={open} title={locked ? 'Upgrade to export' : undefined}>
        {label} {!locked && <ChevronDown size={14} />}
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-depth-3 dark:border-white/10 dark:bg-[#171e29]">
          <button role="menuitem" onClick={() => void run('xlsx')} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel (.xlsx)
          </button>
          <button role="menuitem" onClick={() => void run('csv')} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
            <FileText size={16} className="text-slate-500" /> CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}

/** Fetches every page of a paginated list endpoint (for exports). */
export async function allPages<T>(fetchPage: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>, pageSize = 100): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const r = await fetchPage(page, pageSize);
    out.push(...r.items);
    if (out.length >= r.total || r.items.length === 0 || page > 200) return out;
  }
}
