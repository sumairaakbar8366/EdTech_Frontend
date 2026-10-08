import { createContext, useContext, useId, type ReactNode } from 'react';

/** Connects a Field's <label> (and hint/error) to the control inside it. */
const FieldContext = createContext<{ id: string; describedBy?: string; invalid: boolean } | null>(null);

/**
 * Form row: label, control, and a hint or error message wired up for screen readers.
 * A required control gets a red asterisk on its label automatically (index.css, `.field`).
 */
/** `required` marks custom controls (pickers) that native `required` cannot express. */
export function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className={required ? 'field field-required' : 'field'}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</label>
      <FieldContext.Provider value={{ id, describedBy: note ? noteId : undefined, invalid: !!error }}>{children}</FieldContext.Provider>
      {hint && !error && <span id={noteId} className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span id={noteId} className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  );
}

/** Props a control spreads to bind itself to the surrounding Field. */
export function useFieldProps() {
  const ctx = useContext(FieldContext);
  return ctx ? { id: ctx.id, 'aria-describedby': ctx.describedBy, 'aria-invalid': ctx.invalid || undefined } : {};
}

/** Shared look of text inputs, selects and text areas. */
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-900 shadow-[inset_0_1px_2px_rgb(15_23_42/0.06)] outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-[#0e1626] dark:text-white';
