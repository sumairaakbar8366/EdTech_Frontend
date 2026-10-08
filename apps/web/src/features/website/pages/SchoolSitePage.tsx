import { ArrowRight, Briefcase, Building2, CheckCircle2, ClipboardList, GraduationCap, Images, LogIn, Mail, MapPin, Phone, Users, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Alert, Button, Field, FullPageMessage, Input, Modal, Select, TextArea } from '@/components/ui';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { userAreas } from '@/app/router/SchoolRoutes';
import { useAuth } from '@/features/auth/AuthProvider';
import { CATEGORY_LABEL, mediaUrl, usePublicSite, websiteService, type MediaCategory, type PublicSite } from '@/features/website/website';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const Reveal = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.45, ease: 'easeOut' }} className={className}>
    {children}
  </motion.div>
);

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-(--site-accent)">{kicker}</p>
      <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-lg text-slate-600">{sub}</p>}
    </div>
  );
}

function AdmissionForm({ site }: { site: PublicSite }) {
  const blank = { academicYearId: site.sessions.find((s) => !s.isCurrent)?.id ?? site.sessions[0]?.id ?? '', classId: '', campusId: site.campuses[0]?.id ?? '', firstName: '', lastName: '', gender: '', dateOfBirth: '', previousSchool: '', guardianFirstName: '', guardianLastName: '', guardianRelation: 'father', guardianPhone: '', guardianEmail: '', address: '', notes: '', website: '' };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' && !['website'].includes(k) ? null : v]));
      const r = await websiteService.applyAdmission({ ...body, firstName: f.firstName, lastName: f.lastName, classId: f.classId, campusId: f.campusId, dateOfBirth: f.dateOfBirth, guardianFirstName: f.guardianFirstName, guardianLastName: f.guardianLastName, guardianPhone: f.guardianPhone, guardianRelation: f.guardianRelation });
      setDone(r.applicationNo);
      setF(blank);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the application. Please check the form and try again.'));
    } finally {
      setBusy(false);
    }
  };
  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
        <h3 className="mt-3 text-2xl font-bold text-slate-900">Application received</h3>
        <p className="mt-2 text-slate-600">Your application number is <strong className="font-mono">{done}</strong>. The school office will contact you on the phone number you gave.</p>
        <Button className="mt-5" variant="secondary" onClick={() => setDone(null)}>Apply for another child</Button>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit(() => void submit())} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
      {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
      <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden />
      <h3 className="text-lg font-bold text-slate-900 sm:col-span-2">Child</h3>
      {site.sessions.length > 1 && (
        <Field label="Session"><Select required value={f.academicYearId} onChange={set('academicYearId')}>{site.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}</Select></Field>
      )}
      <Field label="Class applying for"><Select required value={f.classId} onChange={set('classId')}><option value="">Choose a class</option>{site.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
      {site.campuses.length > 1 && <Field label="Campus"><Select required value={f.campusId} onChange={set('campusId')}>{site.campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>}
      <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={set('firstName')} /></Field>
      <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={set('lastName')} /></Field>
      <Field label="Date of birth"><Input type="date" required value={f.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
      <Field label="Gender"><Select value={f.gender} onChange={set('gender')}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></Select></Field>
      <div className="sm:col-span-2"><Field label="Previous school (if any)"><Input maxLength={150} value={f.previousSchool} onChange={set('previousSchool')} /></Field></div>
      <h3 className="mt-2 text-lg font-bold text-slate-900 sm:col-span-2">Parent / guardian</h3>
      <Field label="First name"><Input required maxLength={100} value={f.guardianFirstName} onChange={set('guardianFirstName')} /></Field>
      <Field label="Last name"><Input required maxLength={100} value={f.guardianLastName} onChange={set('guardianLastName')} /></Field>
      <Field label="Relationship"><Select value={f.guardianRelation} onChange={set('guardianRelation')}><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="grandparent">Grandparent</option><option value="other">Other</option></Select></Field>
      <Field label="Mobile number"><Input required type="tel" maxLength={32} pattern="[+0-9 ()-]{10,}" title="e.g. 0300 1234567" value={f.guardianPhone} onChange={set('guardianPhone')} /></Field>
      <Field label="Email (optional)"><Input type="email" maxLength={254} value={f.guardianEmail} onChange={set('guardianEmail')} /></Field>
      <Field label="Address"><Input maxLength={500} value={f.address} onChange={set('address')} /></Field>
      <div className="sm:col-span-2"><Field label="Anything we should know? (optional)"><TextArea rows={3} maxLength={3000} value={f.notes} onChange={set('notes')} /></Field></div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
        <p className="text-sm text-slate-500">The office reviews every application and calls you to arrange documents and an interview.</p>
        <Button type="submit" loading={busy} className="bg-(--site-accent)!">Send application</Button>
      </div>
    </form>
  );
}

function JobApplyModal({ job, onClose }: { job: PublicSite['jobs'][number] | null; onClose: () => void }) {
  const blank = { firstName: '', lastName: '', email: '', phone: '', education: '', experienceYears: '', experience: '', coverNote: '', website: '' };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const close = () => { setF(blank); setDone(false); setError(null); onClose(); };
  if (!job) return null;
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await websiteService.applyJob(job.id, { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone || null, education: f.education || null, experienceYears: f.experienceYears ? Number(f.experienceYears) : null, experience: f.experience || null, coverNote: f.coverNote || null, website: f.website });
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the application.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open size="lg" title={`Apply · ${job.title}`} onClose={close} footer={done ? <Button onClick={close}>Close</Button> : <><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="job-apply" loading={busy}>Send application</Button></>}>
      {done ? (
        <div className="py-6 text-center"><CheckCircle2 size={40} className="mx-auto text-emerald-600" /><p className="mt-3 text-lg font-semibold">Thank you, your application was received.</p><p className="text-slate-500">If you are shortlisted, the school will contact you by email or phone.</p></div>
      ) : (
        <form id="job-apply" onSubmit={onSubmit(() => void submit())} className="grid gap-4 sm:grid-cols-2">
          {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
          <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden />
          <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={set('lastName')} /></Field>
          <Field label="Email"><Input required type="email" pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}" title="e.g. name@gmail.com" maxLength={254} value={f.email} onChange={set('email')} /></Field>
          <Field label="Mobile number"><Input type="tel" maxLength={32} value={f.phone} onChange={set('phone')} /></Field>
          <Field label="Highest qualification"><Input maxLength={2000} placeholder="e.g. MSc Physics, B.Ed" value={f.education} onChange={set('education')} /></Field>
          <Field label="Years of experience"><Input type="number" min={0} max={60} value={f.experienceYears} onChange={set('experienceYears')} /></Field>
          <div className="sm:col-span-2"><Field label="Experience (schools, subjects, classes)"><TextArea rows={3} maxLength={3000} value={f.experience} onChange={set('experience')} /></Field></div>
          <div className="sm:col-span-2"><Field label="Why would you like to join us?"><TextArea rows={3} maxLength={3000} value={f.coverNote} onChange={set('coverNote')} /></Field></div>
        </form>
      )}
    </Modal>
  );
}

/** The school's public website, generated from its data; the portal sign-in is at /login. */
export function SchoolSitePage() {
  // The website has its own light design; the portal's dark mode must not leak into its forms.
  useForcedLightTheme();
  const site = usePublicSite();
  const { me } = useAuth();
  const [filter, setFilter] = useState<MediaCategory | 'all'>('all');
  const [photo, setPhoto] = useState<string | null>(null);
  const [job, setJob] = useState<PublicSite['jobs'][number] | null>(null);

  if (site.isLoading) return <FullPageMessage title="Loading…" />;
  if (!site.data) return <FullPageMessage title="This website is not available" icon={Building2}>Please try again later.</FullPageMessage>;
  const s = site.data;
  const accent = s.school.primaryColor ?? '#f97316';
  const photos = s.media.filter((m) => filter === 'all' || m.category === filter);
  const nav = [
    ['about', 'About'],
    ...(s.media.length ? [['gallery', 'Gallery']] : []),
    ...(s.admissionsOpen ? [['admissions', 'Admissions']] : []),
    ...(s.careersOpen ? [['careers', 'Careers']] : []),
    ['contact', 'Contact'],
  ];
  const initials = s.school.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

  if (!s.published) {
    return (
      <FullPageMessage title={s.school.name} icon={Building2}>
        The school website is being updated. <Link to={me?.scope === 'school' ? `/${userAreas(me)[0] ?? ''}` : '/login'} className="font-semibold text-orange-700 underline">Sign in to the school portal</Link>
      </FullPageMessage>
    );
  }

  return (
    <div className="school-site min-h-screen bg-white text-slate-800" style={{ '--site-accent': accent } as CSSProperties}>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {s.school.logoUrl ? <img src={s.school.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--site-accent) font-bold text-white">{initials}</span>}
            <span className="truncate text-lg font-extrabold text-slate-900">{s.school.name}</span>
          </a>
          <nav className="ml-auto hidden items-center gap-6 md:flex">{nav.map(([id, label]) => <a key={id} href={`#${id}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900">{label}</a>)}</nav>
          <Link to="/login" className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#2f3e52] px-4 py-2 text-sm font-bold text-white hover:bg-[#243142] md:ml-0">
            <LogIn size={16} /> {me ? 'Open portal' : 'Portal login'}
          </Link>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden bg-[#2f3e52] text-white">
        {s.heroMediaId && <img src={mediaUrl(s.heroMediaId)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-35" />}
        <div className="absolute inset-0 bg-linear-to-r from-[#1e2a3a]/95 via-[#2f3e52]/80 to-[#2f3e52]/40" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>Welcome to</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">{s.school.name}</h1>
            <p className="mt-4 max-w-xl text-xl text-slate-200">{s.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {s.admissionsOpen && <a href="#admissions" className="inline-flex items-center gap-2 rounded-lg bg-(--site-accent) px-5 py-3 font-bold text-white shadow-lg hover:brightness-110">Apply for admission <ArrowRight size={18} /></a>}
              {s.careersOpen && s.jobs.length > 0 && <a href="#careers" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 font-bold text-white ring-1 ring-white/25 hover:bg-white/15">Work with us · {s.jobs.length} open</a>}
            </div>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-3 self-end">
            {[
              [GraduationCap, s.stats.students, 'Students'],
              [Users, s.stats.teachers, 'Teachers'],
              [ClipboardList, s.stats.classes, 'Classes'],
              [Building2, s.stats.campuses, s.stats.campuses === 1 ? 'Campus' : 'Campuses'],
            ].map(([Icon, n, label]) => {
              const I = Icon as typeof Users;
              return (
                <div key={label as string} className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                  <I size={20} style={{ color: accent }} />
                  <div className="mt-2 text-3xl font-extrabold tabular-nums">{n as number}</div>
                  <div className="text-sm text-slate-300">{label as string}</div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionTitle kicker="About us" title={`Why ${s.school.name}`} />
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">{s.about}</p>
            {s.campuses.length > 0 && (
              <div className="mt-8 space-y-2">
                {s.campuses.map((c) => <div key={c.id} className="flex items-center gap-2 text-slate-700"><MapPin size={16} style={{ color: accent }} /> <strong>{c.name}</strong>{c.address && <span className="text-slate-500">· {c.address}</span>}</div>)}
              </div>
            )}
          </Reveal>
          {s.principalMessage && (
            <Reveal>
              <figure className="h-full rounded-2xl border-l-4 border-(--site-accent) bg-slate-50 p-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Message from the principal</p>
                <blockquote className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-700">“{s.principalMessage}”</blockquote>
                {s.principalName && <figcaption className="mt-5 font-bold text-slate-900">{s.principalName}</figcaption>}
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      {s.media.length > 0 && (
        <section id="gallery" className="scroll-mt-20 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal><SectionTitle kicker="Gallery" title="Life at our school" /></Reveal>
            <div className="mb-6 flex flex-wrap gap-2">
              {(['all', ...new Set(s.media.map((m) => m.category))] as (MediaCategory | 'all')[]).map((c) => (
                <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${filter === c ? 'bg-[#2f3e52] text-white ring-[#2f3e52]' : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'}`}>{c === 'all' ? 'All' : CATEGORY_LABEL[c]}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((m) => (
                <button key={m.id} onClick={() => setPhoto(m.id)} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200">
                  <img src={mediaUrl(m.id)} alt={m.caption ?? CATEGORY_LABEL[m.category]} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {m.caption && <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-sm font-semibold text-white">{m.caption}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {s.admissionsOpen && (
        <section id="admissions" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Reveal><SectionTitle kicker="Admissions" title="Apply online" sub="Fill in the form; there is no need to visit the school to apply. We will call you about documents and an assessment." /></Reveal>
          <Reveal><AdmissionForm site={s} /></Reveal>
        </section>
      )}

      {s.careersOpen && (
        <section id="careers" className="scroll-mt-20 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal><SectionTitle kicker="Careers" title="Join our team" sub="Teaching and non-teaching vacancies. Apply online in two minutes." /></Reveal>
            {s.jobs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">There are no open positions right now. Please check back later.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {s.jobs.map((j) => (
                  <Reveal key={j.id}>
                    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#2f3e52]"><Briefcase size={20} /></span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900">{j.title}</h3>
                          <p className="text-sm text-slate-500">{j.staffType === 'teaching' ? 'Teaching' : 'Non-teaching'}{j.department ? ` · ${j.department}` : ''} · {j.campus.name} · {j.openings} opening{j.openings === 1 ? '' : 's'}</p>
                        </div>
                      </div>
                      {j.description && <p className="mt-4 flex-1 whitespace-pre-line text-slate-600">{j.description}</p>}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">{j.closingDate ? `Apply by ${new Date(j.closingDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Open until filled'}</span>
                        <Button onClick={() => setJob(j)} className="bg-(--site-accent)!">Apply now</Button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal><SectionTitle kicker="Contact" title="Visit or call us" /></Reveal>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 text-lg">
            {s.contact.phone && <a href={`tel:${s.contact.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-slate-900"><Phone style={{ color: accent }} /> {s.contact.phone}</a>}
            {s.contact.email && <a href={`mailto:${s.contact.email}`} className="flex items-center gap-3 text-slate-700 hover:text-slate-900"><Mail style={{ color: accent }} /> {s.contact.email}</a>}
            {s.contact.address && <p className="flex items-start gap-3 text-slate-700"><MapPin className="mt-1 shrink-0" style={{ color: accent }} /> {s.contact.address}</p>}
            {!s.contact.phone && !s.contact.email && !s.contact.address && <p className="text-slate-500">Contact details will be added soon.</p>}
            {s.contact.facebookUrl && <a href={s.contact.facebookUrl} target="_blank" rel="noreferrer" className="inline-block font-semibold text-slate-700 underline">Follow us on Facebook</a>}
          </div>
          {s.contact.mapUrl ? (
            <iframe title="Map" src={s.contact.mapUrl} className="h-72 w-full rounded-2xl border border-slate-200" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><Images size={36} /></div>
          )}
        </div>
      </section>

      <footer className="bg-[#2f3e52] py-8 text-sm text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <span>© {new Date().getFullYear()} {s.school.name}</span>
          <span>School website by <strong className="text-white">SchoolERP</strong> · Anet Cyber Solutions</span>
        </div>
      </footer>

      {photo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setPhoto(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close"><X /></button>
          <img src={mediaUrl(photo)} alt="" className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
      <JobApplyModal job={job} onClose={() => setJob(null)} />
    </div>
  );
}
