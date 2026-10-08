import { FileUp } from 'lucide-react';
import { useState } from 'react';
import { ExportMenu } from '@/components/shared/ExportMenu';
import { ImportDialog, type ImportSpec } from '@/components/shared/ImportDialog';
import { Button } from '@/components/ui';
import type { ExportColumn } from '@/lib/spreadsheet';

/** Export (Excel/CSV) and, when allowed, Import for a table: one line per list page. */
export function SheetActions<T, P, C>({
  fileName,
  columns,
  rows,
  importSpec,
  compact,
}: {
  fileName: string;
  columns: ExportColumn<T>[];
  rows: () => Promise<T[]>;
  /** Omit (or pass undefined for read-only users) to show Export only. */
  importSpec?: ImportSpec<P, C>;
  compact?: boolean;
}) {
  const [importing, setImporting] = useState(false);
  const size = compact ? 'px-3 py-1.5 text-xs' : '';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportMenu fileName={fileName} columns={columns} rows={rows} />
      {importSpec && (
        <>
          <Button variant="secondary" icon={FileUp} className={size} onClick={() => setImporting(true)}>Import</Button>
          <ImportDialog spec={importSpec} open={importing} onClose={() => setImporting(false)} />
        </>
      )}
    </div>
  );
}
