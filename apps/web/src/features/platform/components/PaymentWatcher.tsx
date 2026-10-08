import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useToast } from '@/components/ui/Toast/Toast';
import { api } from '@/services/api/http';

/** Console header: count of payments waiting, and a pop-up when a school submits a new one. */
export function PaymentWatcher() {
  const toast = useToast();
  const qc = useQueryClient();
  const summary = useQuery({ queryKey: ['platform', 'payments', 'summary'], queryFn: () => api<{ pending: number }>('/platform/payments/summary'), refetchInterval: 20_000, staleTime: 0 });
  const last = useRef<number | undefined>(undefined);
  const pending = summary.data?.pending;

  useEffect(() => {
    if (pending === undefined) return;
    const before = last.current;
    last.current = pending;
    if (before !== undefined && pending > before) {
      toast.info('Payment received', `${pending - before} new subscription payment${pending - before === 1 ? '' : 's'} to confirm (Payments).`);
      void qc.invalidateQueries({ queryKey: ['platform', 'payments'] });
    }
  }, [pending, toast, qc]);

  return (
    <Link to="/payments" className="focus-ring relative rounded-lg p-2 text-slate-600 hover:bg-slate-500/10 dark:text-slate-300" aria-label={pending ? `${pending} payments waiting` : 'Payments'} title="Payments">
      <Wallet size={20} />
      {!!pending && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">{pending}</span>}
    </Link>
  );
}
