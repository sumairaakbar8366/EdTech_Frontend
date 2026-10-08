import type { SelectHTMLAttributes } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...useFieldProps()} {...props} />;
}
