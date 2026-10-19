import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

/** Eye button inside a password box that shows or hides what was typed. */
export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      aria-pressed={shown}
      title={shown ? 'Hide password' : 'Show password'}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-200"
    >
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

/** Text input with the form style; `className` adds to it (e.g. a monospace code box). Password boxes get a show/hide eye. */
export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldProps();
  const [shown, setShown] = useState(false);
  const cls = className ? `${inputClass} ${className}` : inputClass;
  if (type !== 'password') return <input className={cls} {...field} type={type} {...props} />;
  return (
    <div className="relative w-full">
      <input className={`${cls} pr-10`} {...field} type={shown ? 'text' : 'password'} {...props} />
      <PasswordToggle shown={shown} onToggle={() => setShown((s) => !s)} />
    </div>
  );
}
