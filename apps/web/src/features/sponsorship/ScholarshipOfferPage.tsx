import { Award, CheckCircle2, HandHeart, Send } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Backdrop } from '@/components/effects/Backdrop';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { Alert, Badge, Button, Field, Input, Spinner } from '@/components/ui';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { missingRequired, type Answers } from '@/features/forms/forms';
import { offerPageService, pkr } from '@/features/sponsorship/sponsorship';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** The private page a school opens from the scholarship email: the offer, and the request form the owner designed. */
export function ScholarshipOfferPage() {
  const { token = '' } = useParams();
  const q = useQuery({ queryKey: ['scholarship-offer', token], queryFn: () => offerPageService.get(token), retry: false });
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [count, setCount] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const d = q.data;
  const errors = d?.form ? missingRequired(d.form, answers) : {};

  async function submit() {
    setTried(true);
    if (Object.keys(errors).length) return;
    setBusy(true); setError(null);
    try { setDone((await offerPageService.submit(token, { contactName: name.trim(), contactEmail: email.trim(), studentsRequested: Number(count), answers })).message); }
    catch (e) { setError(errorMessage(e, 'The request could not be sent.')); } finally { setBusy(false); }
  }
  async function decline() {
    setBusy(true);
    try { setDone((await offerPageService.decline(token)).message); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }

  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <BrandLockup />
        <div className="surface mt-6 rounded-2xl p-5 sm:p-8">
          {q.isLoading ? <Spinner /> : q.error || !d ? (
            <Alert>This link is not valid or has expired. If you were sent an offer, please ask Skool EdTech to send it again.</Alert>
          ) : done ? (
            <div className="space-y-3"><Alert tone="success"><span className="inline-flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {done}</span></Alert></div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600"><HandHeart size={26} /></div><div><p className="text-xs font-bold uppercase text-magenta-600 dark:text-magenta-300">Scholarship offer for {d.school}</p><h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{d.program.title}</h1></div></div>
              <div className="flex flex-wrap gap-2">{d.program.sponsor && <Badge tone="primary">Sponsored by {d.program.sponsor}</Badge>}{d.program.awardAmount && <Badge tone="emerald"><Award size={12} /> {pkr(d.program.awardAmount, d.program.currency)} per student</Badge>}{d.program.deadline && <Badge tone="amber">Apply by {new Date(d.program.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</Badge>}</div>
              {d.message && <p className="rounded-lg bg-slate-500/5 p-4 text-slate-700 dark:text-slate-200">{d.message}</p>}
              {d.program.description && <p className="text-slate-600 dark:text-slate-300">{d.program.description}</p>}
              {d.program.criteria && <div><h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Who can receive it</h2><p className="mt-1 text-slate-700 dark:text-slate-200">{d.program.criteria}</p></div>}
              {!d.open ? <Alert tone="info">This offer is {d.status === 'expired' ? 'no longer open' : `already ${d.status}`}. Contact Skool EdTech if you need it again.</Alert> : (
                <form className="space-y-4 border-t border-slate-200 pt-5 dark:border-white/10" onSubmit={onSubmit(() => void submit())}>
                  <h2 className="font-bold text-slate-900 dark:text-white">Your request</h2>
                  {d.form?.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{d.form.intro}</p>}
                  {error && <Alert>{error}</Alert>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" required><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
                    <Field label="Your email" required><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                    <Field label="How many students would benefit?" required><Input required type="number" min={0} max={10000} value={count} onChange={(e) => setCount(e.target.value)} /></Field>
                  </div>
                  {d.form && d.form.fields.length > 0 && <DynamicFields form={d.form} answers={answers} onChange={setAnswers} errors={tried ? errors : {}} />}
                  <div className="flex flex-wrap gap-3"><Button type="submit" icon={Send} loading={busy} disabled={!name.trim() || !email.trim() || count === ''}>Send request</Button><Button variant="ghost" disabled={busy} onClick={() => void decline()}>No thanks</Button></div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
