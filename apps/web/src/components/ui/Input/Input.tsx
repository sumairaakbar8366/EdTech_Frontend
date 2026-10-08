import type { InputHTMLAttributes } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...useFieldProps()} {...props} />;
}
