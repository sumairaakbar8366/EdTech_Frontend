import { Lock, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Modal } from '@/components/ui';
import type { SubscriptionState } from '@/features/billing/billing';

const key = () => `schoolerp.trialAdvert.${new Date().toISOString().slice(0, 10)}`;

/**
 * During the free trial the principal and admin are told, once a day, about what the paid plans
 * add: monitoring the school’s growth, complaints and finances every month and year.
 */
export function TrialAdvert({ state, area }: { state: SubscriptionState | undefined; area: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const eligible = state?.phase === 'trial' && (area === 'admin' || area === 'principal');
  useEffect(() => {
    if (!eligible) return;
    try { if (localStorage.getItem(key())) return; } catch { return; }
    // A few seconds in, and only once no guided tour is on screen.
    let waited = 0;
    const t = setInterval(() => {
      waited += 2;
      if (waited < 8 || document.querySelector('[aria-label^="Guide:"]')) return;
      setOpen(true);
      clearInterval(t);
    }, 2000);
    return () => clearInterval(t);
  }, [eligible]);
  const close = () => { setOpen(false); try { localStorage.setItem(key(), '1'); } catch { /* private mode */ } };
  if (!eligible) return null;
  return (
    <Modal open={open} title="Know how your school is doing" onClose={close} footer={<><Button variant="secondary" onClick={close}>Maybe later</Button><Button icon={TrendingUp} onClick={() => { close(); navigate(`/${area}/reports`); }}>See what you get</Button></>}>
      <div className="space-y-3 text-slate-700 dark:text-slate-200">
        <p className="flex items-start gap-2"><Sparkles size={18} className="mt-0.5 shrink-0 text-amber-500" /> Want to monitor your school’s growth? With a paid plan, the principal’s and admin’s dashboard shows, every month and year:</p>
        <ul className="list-disc space-y-1 pl-10 text-base">
          <li>students joined and fees received, against the period before</li>
          <li>salaries paid and what is left over</li>
          <li>attendance trend</li>
          <li>complaints raised and resolved</li>
          <li>a plain verdict: is the school growing?</li>
        </ul>
        <p className="flex items-center gap-2 text-sm text-slate-500"><Lock size={14} /> Included in the paid plans. Your free trial has {state?.daysLeft ?? 0} day(s) left; keep everything by choosing a plan under Plans &amp; billing.</p>
      </div>
    </Modal>
  );
}
