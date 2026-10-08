import type { TextareaHTMLAttributes } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={inputClass} rows={3} {...useFieldProps()} {...props} />;
}
