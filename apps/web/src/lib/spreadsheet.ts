// Spreadsheet export/import helpers (Excel .xlsx and CSV). The Excel libraries are loaded only
// when a file is actually written or read, so they stay out of the main bundle.

export type CellValue = string | number | Date | boolean | null | undefined;
export type SheetFormat = 'xlsx' | 'csv';

/** One exported column: header text and how to read the value from a row. */
export interface ExportColumn<T> {
  header: string;
  value: (row: T) => CellValue;
  /** Approximate width in characters (Excel only). */
  width?: number;
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// --- CSV (RFC 4180) --------------------------------------------------------------------------

function csvCell(v: CellValue): string {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  // Neutralise spreadsheet formula injection (cells starting with = + - @).
  const safe = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: CellValue[][]): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// --- Writing -------------------------------------------------------------------------------

/** Writes `rows` to an Excel or CSV file named "<baseName> YYYY-MM-DD.<ext>". */
export async function exportSheet<T>(rows: T[], columns: ExportColumn<T>[], baseName: string, format: SheetFormat): Promise<void> {
  const fileName = `${baseName} ${stamp()}.${format}`;
  const header = columns.map((c) => c.header);
  const body = rows.map((r) => columns.map((c) => c.value(r)));
  if (format === 'csv') {
    // BOM so Excel opens UTF-8 (Urdu names, “smart quotes”) correctly.
    saveBlob(new Blob(['﻿' + toCsv([header, ...body])], { type: 'text/csv;charset=utf-8' }), fileName);
    return;
  }
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const data = [
    header.map((h) => ({ value: h, fontWeight: 'bold' as const, backgroundColor: '#E2E8F0' })),
    ...body.map((r) =>
      r.map((v) =>
        v === null || v === undefined || v === ''
          ? null
          : v instanceof Date
            ? { value: v, type: Date, format: 'dd mmm yyyy' }
            : typeof v === 'number'
              ? { value: v, type: Number }
              : typeof v === 'boolean'
                ? { value: v, type: Boolean }
                : { value: String(v), type: String },
      ),
    ),
  ];
  await writeXlsxFile(data as never, { sheet: baseName.slice(0, 31), stickyRowsCount: 1, columns: columns.map((c) => ({ width: c.width ?? Math.min(40, Math.max(10, c.header.length + 4)) })) }).toFile(fileName);
}

/** An empty import template: header row plus one example row. */
export async function downloadTemplate(headers: string[], example: string[], baseName: string, format: SheetFormat): Promise<void> {
  const cols = headers.map((h, i) => ({ header: h, value: (r: string[]) => r[i] }));
  const fileName = `${baseName} template`;
  if (format === 'csv') {
    saveBlob(new Blob(['﻿' + toCsv([headers, example])], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`);
    return;
  }
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const data = [headers.map((h) => ({ value: h, fontWeight: 'bold' as const, backgroundColor: '#E2E8F0' })), example.map((v) => (v ? { value: v, type: String } : null))];
  await writeXlsxFile(data as never, { sheet: 'Import', stickyRowsCount: 1, columns: cols.map((c) => ({ width: Math.max(14, c.header.length + 4) })) }).toFile(`${fileName}.xlsx`);
}

/** CSV-escapes rows for a downloadable error report. */
export function saveCsv(rows: CellValue[][], fileName: string) {
  saveBlob(new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' }), fileName);
}

// --- Reading -------------------------------------------------------------------------------

function cellText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

/** Reads the first sheet of an .xlsx/.csv file into rows of trimmed strings (dates as YYYY-MM-DD). */
export async function readSheet(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || file.type === 'text/csv') {
    return parseCsv(await file.text()).map((r) => r.map((c) => c.trim()));
  }
  if (!name.endsWith('.xlsx')) throw new Error('Please choose an Excel (.xlsx) or CSV (.csv) file');
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  const sheets = await readXlsxFile(file);
  return (sheets[0]?.data ?? []).map((r) => r.map(cellText));
}

/** Header names compared loosely: case, spaces, punctuation and "(optional)" notes are ignored. */
export const normalizeHeader = (h: string) => h.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '');
