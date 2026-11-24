import { Award, CheckCircle2, HandHeart, Send, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Backdrop } from '@/components/effects/Backdrop';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { Alert, Badge, Button, Field, Input, Spinner } from '@/components/ui';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { missingRequired, type Answers } from '@/features/forms/forms';
import { offerPageService, pkr, type OfferPage } from '@/features/sponsorship/sponsorship';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

type Submit = Parameters<typeof offerPageService.submit>[1];
interface OfferSource { key: string; load: () => Promise<OfferPage>; submit: (b: Submit) => Promise<{ message: string }>; decline: () => Promise<{ message: string }>; contact?: { name: string; email: string }; onAnswered?: () => void }

/** An offer and its request form, wherever it is opened from: a link, or the school's dashboard. */
export function OfferBody({ source }: { source: OfferSource }) {
  const q = useQuery({ queryKey: ['scholarship-offer', source.key], queryFn: source.load, retry: false });
  const [name, setName] = useState(source.contact?.name ?? ''); const [email, setEmail] = useState(source.contact?.email ?? ''); const [count, setCount] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [winners, setWinners] = useState<Record<string, { name: string; cls: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const d = q.data;
  const errors = d?.form ? missingRequired(d.form, answers) : {};
  const prize = d?.program.kind === 'prize';
  const named = Object.entries(winners).filter(([, w]) => w.name.trim());

  async function submit() {
    setTried(true);
    if (Object.keys(errors).length) return;
    setBusy(true); setError(null);
    try { setDone((await source.submit({ contactName: name.trim(), contactEmail: email.trim(), studentsRequested: prize ? named.length : Number(count), answers, ...(prize && { nominations: named.map(([position, w]) => ({ position, studentName: w.name.trim(), ...(w.cls.trim() && { className: w.cls.trim() }) })) }) })).message); source.onAnswered?.(); }
    catch (e) { setError(errorMessage(e, 'The request could not be sent.')); } finally { setBusy(false); }
  }
  async function decline() {
    setBusy(true);
    try { setDone((await source.decline()).message); source.onAnswered?.(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }

  return (
        <div className="surface rounded-2xl p-5 sm:p-8">
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
                    {!prize && <Field label="How many students would benefit?" required><Input required type="number" min={0} max={10000} value={count} onChange={(e) => setCount(e.target.value)} /></Field>}
                  </div>
                  {prize && (
                    <div className="space-y-3 rounded-xl border border-amber-300/60 bg-amber-500/5 p-4">
                      <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Trophy size={18} className="text-amber-600" /> Name your winners</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">The prizes are given by Skool EdTech. Write who won each one; leave a prize empty if there is no winner for it.</p>
                      {d.program.prizes.map((p) => (
                        <div key={p.position} className="grid items-center gap-2 sm:grid-cols-[11rem_1fr_9rem]">
                          <div><div className="font-bold text-slate-800 dark:text-slate-100">{p.position} · {p.title}</div><div className="text-sm text-emerald-700 dark:text-emerald-300">{pkr(p.amount, d.program.currency)}</div></div>
                          <Input aria-label={`Winner of ${p.position}`} placeholder="Child’s name" value={winners[p.position]?.name ?? ''} onChange={(e) => setWinners({ ...winners, [p.position]: { name: e.target.value, cls: winners[p.position]?.cls ?? '' } })} />
                          <Input aria-label={`Class of the ${p.position} winner`} placeholder="Class" value={winners[p.position]?.cls ?? ''} onChange={(e) => setWinners({ ...winners, [p.position]: { name: winners[p.position]?.name ?? '', cls: e.target.value } })} />
                        </div>
                      ))}
                    </div>
                  )}
                  {d.form && d.form.fields.length > 0 && <DynamicFields form={d.form} answers={answers} onChange={setAnswers} errors={tried ? errors : {}} />}
                  <div className="flex flex-wrap gap-3"><Button type="submit" icon={Send} loading={busy} disabled={!name.trim() || !email.trim() || (prize ? named.length === 0 : count === '')}>Send request</Button><Button variant="ghost" disabled={busy} onClick={() => void decline()}>No thanks</Button></div>
                </form>
              )}
            </div>
          )}
        </div>
  );
}

/** The private page a school opens from an older scholarship email: the offer, and the request form the owner designed. */
export function ScholarshipOfferPage() {
  const { token = '' } = useParams();
  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <BrandLockup />
        <div className="mt-6"><OfferBody source={{ key: token, load: () => offerPageService.get(token), submit: (b) => offerPageService.submit(token, b), decline: () => offerPageService.decline(token) }} /></div>
      </div>
    </main>
  );
}
