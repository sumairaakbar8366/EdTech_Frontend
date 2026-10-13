import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@/components/ui/Button/IconButton';
import { CompactNumber } from '@/components/ui/CompactNumber/CompactNumber';

/** "1–20 of 134 · Page 1 of 7" footer. Renders nothing when everything fits on one page. */
export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  if (total <= pageSize) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-base text-slate-600 dark:border-white/5 dark:text-slate-300">
      <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of <CompactNumber value={total} /></span>
      <div className="flex items-center gap-1">
        <IconButton icon={ChevronLeft} label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} />
        <span className="px-2">Page {page} of <CompactNumber value={pages} /></span>
        <IconButton icon={ChevronRight} label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)} />
      </div>
    </div>
  );
}
