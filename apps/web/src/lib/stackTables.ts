/**
 * On a phone, a wide data table cannot fit: the website turns each row of the tables marked `data-stack` into a small
 * card (the first cell is the title, the others are "label: value" lines taken from the column headings). Wider screens
 * keep the normal table. The labels are added here (the cells do not know their heading); the layout itself is in index.css.
 */
const label = (cell: Element) => (cell.textContent ?? '').replace(/\s+/g, ' ').trim();

function enhance(table: HTMLTableElement): void {
  const heads = [...table.querySelectorAll('thead th')].map(label);
  if (heads.length === 0) return;
  for (const row of table.querySelectorAll('tbody > tr')) {
    const cells = [...row.children].filter((c) => c.tagName === 'TD') as HTMLTableCellElement[];
    // A row that spans columns (a break, "no results") is shown as it is.
    if (cells.some((c) => c.colSpan > 1)) { row.setAttribute('data-span', ''); continue; }
    cells.forEach((c, i) => { const h = heads[i] ?? ''; if (c.getAttribute('data-label') !== h) c.setAttribute('data-label', h); });
  }
}

let queued = false;
function run(): void {
  queued = false;
  document.querySelectorAll<HTMLTableElement>('table[data-stack]').forEach(enhance);
}

export function startStackTables(): void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
