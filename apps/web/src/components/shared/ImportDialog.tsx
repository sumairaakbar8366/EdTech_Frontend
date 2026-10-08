import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, FileText, Upload, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Alert, Badge, Button, Modal } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { downloadTemplate, normalizeHeader, readSheet, saveCsv } from '@/lib/spreadsheet';
import { useSubscription } from '@/features/billing/billing';
import { LockedFeature } from '@/features/billing/components/LockedFeature';

export interface ImportColumn {
  key: string;
  header: string;
  required?: boolean;
  /** Other header spellings accepted (e.g. "Father name" for "Parent first name"). */
  aliases?: string[];
  example?: string;
  /** Allowed values / format, shown in the column guide. */
  hint?: string;
}

/**
 * What one import does. `toPayload` turns a row (by column key) into an API payload or returns
 * an error message; `create` sends one payload. Rows are sent one by one so every row gets the
 * API's full validation and a precise error.
 */
export interface ImportSpec<P, C = undefined> {
  title: string;
  /** File name base for the template / error report. */
  name: string;
  columns: ImportColumn[];
  /** Loads lookups once (classes, sections, existing records…). */
  prepare?: () => Promise<C>;
  toPayload: (row: Record<string, string>, ctx: C) => P | string;
  create: (payload: P, ctx: C) => Promise<unknown>;
  invalidate?: QueryKey[];
  /** Extra guidance shown above the column list. */
  notes?: string[];
}

interface Parsed<P> {
  line: number;
  raw: Record<string, string>;
  payload?: P;
  error?: string;
  result?: 'ok' | 'failed';
  failure?: string;
}

type Step = 'pick' | 'review' | 'running' | 'done';

/** Import rows from an Excel/CSV file: template → choose file → check → import → report. */
export function ImportDialog<P, C = undefined>({ spec, open, onClose }: { spec: ImportSpec<P, C>; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('pick');
  const [rows, setRows] = useState<Parsed<P>[]>([]);
  const [ctx, setCtx] = useState<C>();
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState(false);

  const reset = () => { setStep('pick'); setRows([]); setError(null); setProgress(0); setFileName(''); if (input.current) input.current.value = ''; };
  const close = () => { if (step === 'running') return; reset(); onClose(); };

  const onFile = async (file: File) => {
    setError(null);
    setReading(true);
    try {
      const sheet = (await readSheet(file)).filter((r) => r.some((c) => c !== ''));
      if (sheet.length < 2) throw new Error('The file has no data rows under the header row.');
      const headers = sheet[0]!.map(normalizeHeader);
      const index: Record<string, number> = {};
      for (const col of spec.columns) {
        const names = [col.header, col.key, ...(col.aliases ?? [])].map(normalizeHeader);
        const at = headers.findIndex((h) => names.includes(h));
        if (at >= 0) index[col.key] = at;
      }
      const missing = spec.columns.filter((c) => c.required && index[c.key] === undefined).map((c) => c.header);
      if (missing.length) throw new Error(`Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Download the template to see the expected headers.`);
      const context = (spec.prepare ? await spec.prepare() : undefined) as C;
      const parsed = sheet.slice(1).map((cells, i): Parsed<P> => {
        const raw = Object.fromEntries(spec.columns.map((c) => [c.key, index[c.key] === undefined ? '' : (cells[index[c.key]!] ?? '').trim()]));
        const empty = spec.columns.filter((c) => c.required && !raw[c.key]).map((c) => c.header);
        if (empty.length) return { line: i + 2, raw, error: `Missing ${empty.join(', ')}` };
        const out = spec.toPayload(raw, context);
        return typeof out === 'string' ? { line: i + 2, raw, error: out } : { line: i + 2, raw, payload: out };
      });
      if (parsed.length > 2000) throw new Error('Please import at most 2,000 rows at a time.');
      setCtx(context);
      setRows(parsed);
      setFileName(file.name);
      setStep('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : errorMessage(e));
    } finally {
      setReading(false);
    }
  };

  const run = async () => {
    setStep('running');
    const next = [...rows];
    let done = 0;
    for (const r of next) {
      if (!r.payload) continue;
      try {
        await spec.create(r.payload, ctx as C);
        r.result = 'ok';
      } catch (e) {
        r.result = 'failed';
        r.failure = e instanceof Error ? e.message : errorMessage(e, 'Rejected by the server');
      }
      done++;
      setProgress(done);
    }
    setRows(next);
    for (const key of spec.invalidate ?? []) void queryClient.invalidateQueries({ queryKey: key });
    setStep('done');
  };

  const valid = rows.filter((r) => r.payload);
  const invalid = rows.filter((r) => r.error);
  const imported = rows.filter((r) => r.result === 'ok').length;
  const failed = rows.filter((r) => r.result === 'failed' || r.error);
  const report = () =>
    saveCsv(
      [['Row', 'Problem', ...spec.columns.map((c) => c.header)], ...failed.map((r) => [r.line, r.error ?? r.failure ?? '', ...spec.columns.map((c) => r.raw[c.key])])],
      `${spec.name} import problems.csv`,
    );

  const footer =
    step === 'pick' ? (
      <Button variant="secondary" onClick={close}>Cancel</Button>
    ) : step === 'review' ? (
      <>
        <Button variant="secondary" onClick={reset}>Choose another file</Button>
        <Button icon={Upload} disabled={!valid.length} onClick={() => void run()}>Import {valid.length} row{valid.length === 1 ? '' : 's'}</Button>
      </>
    ) : step === 'running' ? (
      <Button loading disabled>Importing…</Button>
    ) : (
      <>
        {failed.length > 0 && <Button variant="secondary" onClick={report}>Download problem rows</Button>}
        <Button onClick={close}>Done</Button>
      </>
    );

  const plan = useSubscription().data;
  if (open && plan && !plan.features.includes('import_export')) {
    return <Modal open title={spec.title} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}><LockedFeature feature="import_export" isAdmin /></Modal>;
  }
  const keyCols = spec.columns.slice(0, 3);
  return (
    <Modal open={open} size="xl" title={spec.title} onClose={close} footer={footer}>
      {step === 'pick' && (
        <div className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <ol className="list-inside list-decimal space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>Download the template (or use your own sheet with the same column headers).</li>
            <li>Fill one row per record. Columns marked <span className="text-rose-600">*</span> are required.</li>
            <li>Choose the file; every row is checked before anything is saved.</li>
          </ol>
          {spec.notes?.map((n) => <Alert key={n} tone="info">{n}</Alert>)}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={FileSpreadsheet} onClick={() => void downloadTemplate(spec.columns.map((c) => c.header), spec.columns.map((c) => c.example ?? ''), spec.name, 'xlsx')}>Excel template</Button>
            <Button variant="secondary" icon={FileText} onClick={() => void downloadTemplate(spec.columns.map((c) => c.header), spec.columns.map((c) => c.example ?? ''), spec.name, 'csv')}>CSV template</Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5">
                <tr><th className="px-3 py-2">Column</th><th className="px-3 py-2">Format / allowed values</th><th className="px-3 py-2">Example</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {spec.columns.map((c) => (
                  <tr key={c.key}>
                    <td className="px-3 py-1.5 font-semibold">{c.header}{c.required && <span className="text-rose-600"> *</span>}</td>
                    <td className="px-3 py-1.5 text-slate-500">{c.hint ?? 'Text'}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-slate-500">{c.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <input ref={input} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
          <Button icon={Upload} loading={reading} onClick={() => input.current?.click()}>Choose Excel or CSV file</Button>
        </div>
      )}

      {step !== 'pick' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{fileName}</span>
            <Badge tone="slate">{rows.length} rows</Badge>
            {step === 'review' && <Badge tone="emerald">{valid.length} ready</Badge>}
            {invalid.length > 0 && <Badge tone="rose">{invalid.length} with problems</Badge>}
            {step === 'done' && <Badge tone="emerald">{imported} imported</Badge>}
            {step === 'done' && failed.length - invalid.length > 0 && <Badge tone="rose">{failed.length - invalid.length} rejected</Badge>}
          </div>
          {step === 'running' && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full bg-brand transition-all" style={{ width: `${Math.round((progress / Math.max(1, valid.length)) * 100)}%` }} /></div>
              <p className="mt-1 text-sm text-slate-500">{progress} of {valid.length}…</p>
            </div>
          )}
          {step === 'review' && invalid.length > 0 && <Alert tone="info">Rows with problems are skipped. Fix them in the file and import again, or continue with the ready rows.</Alert>}
          {step === 'done' && <Alert tone={failed.length ? 'info' : 'success'}>{imported} record{imported === 1 ? '' : 's'} imported.{failed.length ? ' Download the problem rows, correct them and import that file.' : ''}</Alert>}
          <div className="max-h-[45vh] overflow-auto rounded-lg border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-[#1b2430]">
                <tr><th className="px-3 py-2">Row</th>{keyCols.map((c) => <th key={c.key} className="px-3 py-2">{c.header}</th>)}<th className="px-3 py-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {rows.slice(0, 500).map((r) => (
                  <tr key={r.line}>
                    <td className="px-3 py-1.5 text-slate-400">{r.line}</td>
                    {keyCols.map((c) => <td key={c.key} className="px-3 py-1.5">{r.raw[c.key]}</td>)}
                    <td className="px-3 py-1.5">
                      {r.error ? <span className="inline-flex items-center gap-1 text-rose-600"><AlertTriangle size={14} /> {r.error}</span>
                        : r.result === 'ok' ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> Imported</span>
                        : r.result === 'failed' ? <span className="inline-flex items-center gap-1 text-rose-600"><XCircle size={14} /> {r.failure}</span>
                        : <span className="text-slate-500">Ready</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
