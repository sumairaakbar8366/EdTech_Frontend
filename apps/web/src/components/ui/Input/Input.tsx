import type { InputHTMLAttributes } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

/** Text input with the form style; `className` adds to it (e.g. a monospace code box). */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={className ? `${inputClass} ${className}` : inputClass} {...useFieldProps()} {...props} />;
}
