import { ArrowLeft, Building2, ChevronRight, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/ui';

/** "Choose your school": when one sign-in matches accounts at several schools (or the owner console). */
export function SchoolChoice({ choices, busy, error, onPick, onBack }: { choices: { school: string; name: string }[]; busy: boolean; error: string | null; onPick: (school: string) => void; onBack?: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Choose your school</h1>
        <p className="mt-1 text-sm text-slate-500">This sign-in has an account at more than one place.</p>
      </div>
      {error && <Alert>{error}</Alert>}
      <ul className="space-y-2">
        {choices.map((c) => (
          <li key={c.school}>
            <button type="button" disabled={busy} onClick={() => onPick(c.school)} className="flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300">{c.school === 'console' ? <ShieldCheck size={18} /> : <Building2 size={18} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-900 dark:text-white">{c.name}</span>
                <span className="block truncate font-mono text-xs text-slate-500">/{c.school}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>
      {onBack && <button type="button" onClick={onBack} className="inline-flex w-full items-center justify-center gap-1 text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft size={15} /> Back</button>}
    </div>
  );
}
