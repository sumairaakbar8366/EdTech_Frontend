import { ArrowRight, Briefcase, Building2, CalendarDays, CheckCircle2, ClipboardList, FileCheck2, GraduationCap, LogIn, Mail, MapPin, Menu, PhoneCall, Phone, Quote, Send, UserCheck, Users, X } from 'lucide-react';
import { JobApplyModal } from '@/features/website/components/JobApplyModal';
import { SiteArtwork } from '@/features/website/components/SiteArtwork';
import { SiteGallery } from '@/features/website/components/SiteGallery';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Alert, Button, CompactNumber, Field, FullPageMessage, Input, Select, TextArea } from '@/components/ui';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { userAreas } from '@/app/router/SchoolRoutes';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTenant } from '@/features/tenancy/useTenant';
import { mediaUrl, usePublicSite, websiteService, type PublicSite } from '@/features/website/website';
import { siteImagery, siteStyle } from '@/features/website/siteImagery';
import { paletteVars, sitePalette } from '@/features/website/sitePalette';
import { errorMessage } from '@/lib/errors';
import { apiAsset } from '@/services/api/http';
import { onSubmit } from '@/lib/forms';
import '@/features/website/school-site.css';
import { SocialLinks } from '@/features/website/components/SocialLinks';
import { socialEntries } from '@/features/website/social';
import { PRODUCT_NAME } from '@/config/brand';

const Reveal = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.5, ease: 'easeOut' }} className={className}>
    {children}
  </motion.div>
);

function SectionTitle({ kicker, title, sub, center = false }: { kicker: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <p className="site-kicker text-xs font-bold uppercase tracking-[0.2em] text-(--site-accent)">{kicker}</p>
      <h2 className="site-serif mt-3 text-3xl font-semibold text-slate-900 sm:text-[2.6rem] sm:leading-tight">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-slate-600">{sub}</p>}
    </div>
  );
}

/** A blurred, faded photograph behind a section, melting into the page colour at its edges. */
const Backdrop = ({ src }: { src: string }) => (
  <>
    <img src={src} alt="" aria-hidden loading="lazy" className="site-hero-photo absolute inset-0 h-full w-full object-cover opacity-[0.26]" />
    <div aria-hidden className="absolute inset-0 bg-linear-to-b from-(--site-page) via-transparent to-(--site-page)" />
  </>
);

/** A white panel with a thin accent rule on top: the site's one card style. */
const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-md border border-(--site-line) border-t-(--site-accent) border-t-[3px] bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.12)] ${className}`}>{children}</div>
);

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
      <Panel className="p-8 text-center sm:p-10">
        <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
        <h3 className="site-serif mt-3 text-2xl font-semibold text-slate-900">Application received</h3>
        <p className="mt-2 text-slate-600">Your application number is <strong className="font-mono">{done}</strong>. The school office will contact you on the phone number you gave.</p>
        <Button className="mt-6" variant="secondary" onClick={() => setDone(null)}>Apply for another child</Button>
      </Panel>
    );
  }
  const heading = (text: string) => <h3 className="border-b border-(--site-line) pb-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500 sm:col-span-2">{text}</h3>;
  return (
    <Panel>
      <form onSubmit={onSubmit(() => void submit())} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
        {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
        <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden />
        {heading('Student')}
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
        <div className="mt-2 sm:col-span-2">{heading('Parent / guardian')}</div>
        <Field label="First name"><Input required maxLength={100} value={f.guardianFirstName} onChange={set('guardianFirstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.guardianLastName} onChange={set('guardianLastName')} /></Field>
        <Field label="Relationship"><Select value={f.guardianRelation} onChange={set('guardianRelation')}><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="grandparent">Grandparent</option><option value="other">Other</option></Select></Field>
        <Field label="Mobile number"><Input required type="tel" maxLength={32} pattern="[+0-9 \(\)\-]{10,}" title="e.g. 0300 1234567" value={f.guardianPhone} onChange={set('guardianPhone')} /></Field>
        <Field label="Email (optional)"><Input type="email" maxLength={254} value={f.guardianEmail} onChange={set('guardianEmail')} /></Field>
        <Field label="Address"><Input maxLength={500} value={f.address} onChange={set('address')} /></Field>
        <div className="sm:col-span-2"><Field label="Anything we should know? (optional)"><TextArea rows={3} maxLength={3000} value={f.notes} onChange={set('notes')} /></Field></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--site-line) pt-5 sm:col-span-2">
          <p className="max-w-md text-sm text-slate-500">The office reviews every application and calls you to arrange documents and an interview.</p>
          <Button type="submit" icon={Send} loading={busy} className="bg-(--site-accent)!">Send application</Button>
        </div>
      </form>
    </Panel>
  );
}

const ADMISSION_STEPS = [
  { Icon: ClipboardList, title: 'Apply online', text: 'Complete the form. There is no need to visit the school to apply.' },
  { Icon: PhoneCall, title: 'The office calls you', text: 'We confirm the details and arrange a convenient time.' },
  { Icon: FileCheck2, title: 'Documents and assessment', text: 'Bring the documents we ask for; the child meets our staff.' },
  { Icon: UserCheck, title: 'Confirmation', text: 'You receive the admission decision and joining details.' },
];

/** The school's public website, generated from its data; the portal sign-in is at /login. */
export function SchoolSitePage() {
  // The website has its own light design; the portal's dark mode must not leak into its forms.
  useForcedLightTheme();
  const site = usePublicSite();
  const tenant = useTenant();
  const { me } = useAuth();
  const [menu, setMenu] = useState(false);
  const [job, setJob] = useState<PublicSite['jobs'][number] | null>(null);
  const branding = tenant.data?.kind === 'school' ? tenant.data.school.branding : null;
  const primary = site.data?.school.primaryColor ?? branding?.primaryColor ?? null;
  const palette = useMemo(() => sitePalette(primary, branding?.secondaryColor), [primary, branding?.secondaryColor]);
  // The server writes the same title into the page for search engines; this keeps the tab in step.
  useEffect(() => {
    if (site.data) document.title = `${site.data.school.name} | ${site.data.tagline}`;
  }, [site.data]);

  if (site.isLoading) return <FullPageMessage title="Loading…" />;
  if (!site.data) return <FullPageMessage title="This website is not available" icon={Building2}>Please try again later.</FullPageMessage>;
  const s = site.data;
  const imagery = siteImagery(s.school.siteTier ?? 'standard', s.school.slug);
  const classic = siteStyle(s.school.slug) === 'classic';
  const portalHref = me?.scope === 'school' ? `/${userAreas(me)[0] ?? ''}` : '/login';

  if (!s.published) {
    return (
      <FullPageMessage title={s.school.name} icon={Building2}>
        The school website is being updated. <Link to={portalHref} className="font-semibold text-slate-700 underline">Sign in to the school portal</Link>
      </FullPageMessage>
    );
  }

  const nav = [
    ['about', 'About'],
    ...(s.media.length ? [['gallery', 'Gallery']] : []),
    ...(s.admissionsOpen ? [['admissions', 'Admissions']] : []),
    ...(s.careersOpen ? [['careers', 'Careers']] : []),
    ['contact', 'Contact'],
  ];
  const initials = s.school.name.split(/\s+/).filter((w) => /^[a-z]/i.test(w)).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  const currentSession = s.sessions.find((x) => x.isCurrent);
  const stats = [
    { Icon: GraduationCap, value: s.stats.students, label: 'Students' },
    { Icon: Users, value: s.stats.teachers, label: 'Teachers' },
    { Icon: ClipboardList, value: s.stats.classes, label: s.stats.classes === 1 ? 'Class' : 'Classes' },
    { Icon: Building2, value: s.stats.campuses, label: s.stats.campuses === 1 ? 'Campus' : 'Campuses' },
  ];
  const classRange = s.classes.length > 1 ? `${s.classes[0]!.name} to ${s.classes[s.classes.length - 1]!.name}` : s.classes[0]?.name;
  const hasContact = s.contact.phone || s.contact.email || s.contact.address;
  const crest = (size: string) =>
    s.school.logoUrl ? (
      <img src={apiAsset(s.school.logoUrl)} alt="" className={`${size} shrink-0 rounded object-contain`} />
    ) : (
      <span className={`site-serif flex ${size} shrink-0 items-center justify-center rounded font-semibold text-white ring-2 ring-offset-2 ring-offset-white ${classic ? 'bg-(--site-band) ring-(--site-detail)' : 'bg-(--site-accent) ring-(--site-detail)/40'}`}>{initials}</span>
    );

  return (
    <div id="top" className={`school-site ${classic ? 'site-classic' : ''} min-h-screen bg-(--site-page) text-slate-700 antialiased`} style={paletteVars(palette) as CSSProperties}>
      {/* Utility bar */}
      <div className={`hidden text-[13px] sm:block ${classic ? 'bg-(--site-band-deep) text-slate-300' : 'border-b border-(--site-line) bg-(--site-wash) text-slate-600'}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-2">
          {s.contact.phone && <a href={`tel:${s.contact.phone}`} className={`inline-flex items-center gap-2 ${classic ? 'hover:text-white' : 'hover:text-(--site-accent)'}`}><Phone size={13} /> {s.contact.phone}</a>}
          {s.contact.email && <a href={`mailto:${s.contact.email}`} className={`inline-flex items-center gap-2 ${classic ? 'hover:text-white' : 'hover:text-(--site-accent)'}`}><Mail size={13} /> {s.contact.email}</a>}
          {currentSession && <span className="inline-flex items-center gap-2"><CalendarDays size={13} /> Session {currentSession.name}</span>}
          <Link to={portalHref} className={`ml-auto inline-flex items-center gap-2 font-semibold ${classic ? 'text-white hover:text-(--site-band-accent)' : 'text-(--site-accent) hover:underline'}`}><LogIn size={13} /> {me ? 'Open portal' : 'Portal login'}</Link>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-(--site-line) bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {crest('h-11 w-11 text-lg')}
            <span className="min-w-0">
              <span className="site-serif block truncate text-lg font-semibold leading-tight text-slate-900 sm:text-xl">{s.school.name}</span>
              <span className="hidden truncate text-xs tracking-wide text-slate-500 sm:block">{s.tagline}</span>
            </span>
          </a>
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="text-sm font-semibold text-slate-600 transition-colors hover:text-(--site-accent)">{label}</a>)}
          </nav>
          {s.admissionsOpen && <a href="#admissions" className="hidden items-center gap-2 rounded bg-(--site-accent) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 lg:inline-flex">Apply now</a>}
          <Link to={portalHref} className="ml-auto inline-flex items-center gap-2 rounded border border-(--site-line) px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:hidden"><LogIn size={15} /> Portal</Link>
          <button onClick={() => setMenu(!menu)} className="rounded p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Menu" aria-expanded={menu}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {menu && (
          <nav className="border-t border-(--site-line) bg-white px-4 py-2 lg:hidden">
            {nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className="block rounded px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">{label}</a>)}
          </nav>
        )}
      </header>

      {/* Hero: Classic (dark band) or Light */}
      {classic ? (
      <section className="relative overflow-hidden bg-(--site-band) text-white">
        {s.heroMediaId ? (
          <img src={mediaUrl(s.heroMediaId)} alt="" aria-hidden className="site-hero-photo absolute inset-0 h-full w-full object-cover opacity-25" />
        ) : (
          <img src={imagery.hero.src} srcSet={imagery.hero.srcSet} sizes="100vw" alt="" aria-hidden className={`site-hero-photo absolute inset-0 h-full w-full object-cover ${imagery.heroMirror ? '-scale-x-100' : ''}`} style={{ opacity: imagery.heroOpacity }} />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-(--site-band) via-(--site-band)/85 to-(--site-band)/40" />
        <SiteArtwork variant="hero" opacity={0.2} className="text-(--site-band-accent)!" />
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-20 sm:px-6 sm:pb-40 sm:pt-28">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--site-band-accent)">Welcome to</p>
            <h1 className="site-serif mt-4 text-4xl font-semibold leading-[1.1] sm:text-6xl">{s.school.name}</h1>
            <div className="mt-6 h-0.5 w-16 bg-(--site-band-accent)" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl">{s.tagline}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {s.admissionsOpen && (
                <a href="#admissions" className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                  Apply for admission <ArrowRight size={18} className="text-(--site-accent)" />
                </a>
              )}
              <a href="#about" className="inline-flex items-center gap-2 rounded px-6 py-3 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">Discover the school</a>
            </div>
          </Reveal>
        </div>
      </section>
      ) : (
      <section className="relative overflow-hidden border-b border-(--site-line) bg-(--site-wash)">
        {s.heroMediaId ? (
          <img src={mediaUrl(s.heroMediaId)} alt="" aria-hidden className="site-hero-photo absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[62%]" style={{ opacity: imagery.heroOpacity }} />
        ) : (
          <img src={imagery.hero.src} srcSet={imagery.hero.srcSet} sizes="(min-width: 1024px) 62vw, 100vw" alt="" aria-hidden className={`site-hero-photo absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[62%] ${imagery.heroMirror ? '-scale-x-100' : ''}`} style={{ opacity: imagery.heroOpacity }} />
        )}
        {/* Melts the photo into the wash: solid behind the text, open towards the right. */}
        <div className="absolute inset-0 bg-linear-to-r from-(--site-wash) from-35% via-(--site-wash)/80 via-55% to-(--site-wash)/10 max-lg:from-(--site-wash)/95 max-lg:via-(--site-wash)/85" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-(--site-wash) to-transparent" />
        <SiteArtwork variant="hero" opacity={0.16} className="text-(--site-accent)!" />
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-20 sm:px-6 sm:pb-40 sm:pt-24">
          <Reveal className="max-w-2xl">
            <p className="site-kicker text-xs font-bold uppercase tracking-[0.24em] text-(--site-accent)">Welcome to</p>
            <h1 className="site-serif mt-4 text-4xl font-semibold leading-[1.1] text-slate-900 sm:text-6xl">{s.school.name}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">{s.tagline}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {s.admissionsOpen && (
                <a href="#admissions" className="inline-flex items-center gap-2 rounded bg-(--site-accent) px-6 py-3 font-semibold text-white shadow-md transition hover:brightness-110">
                  Apply for admission <ArrowRight size={18} />
                </a>
              )}
              <a href="#about" className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 font-semibold text-slate-800 ring-1 ring-(--site-line) transition hover:bg-slate-50">Discover the school</a>
            </div>
          </Reveal>
        </div>
      </section>
      )}

      {/* Key figures, overlapping the hero */}
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <Panel className="grid grid-cols-2 gap-px overflow-hidden bg-(--site-line) lg:grid-cols-4">
            {stats.map(({ Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4 bg-white px-5 py-6 sm:px-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--site-accent-soft) text-(--site-accent)"><Icon size={20} /></span>
                <div>
                  <div className="site-serif text-3xl font-semibold tabular-nums text-slate-900"><CompactNumber value={value} /></div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </Panel>
        </Reveal>
      </div>

      {/* About */}
      <section id="about" className="relative scroll-mt-24 overflow-hidden py-24">
        <SiteArtwork variant="corner" opacity={0.1} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <SectionTitle kicker="About the school" title={`Why ${s.school.name}`} />
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">{s.about}</p>
            {s.classes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Classes offered</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.classes.map((c) => <span key={c.id} className="rounded border border-(--site-line) bg-white px-3 py-1 text-sm font-medium text-slate-700">{c.name}</span>)}
                </div>
              </div>
            )}
          </Reveal>
          <Reveal className={imagery.inset ? 'pb-10 pl-10 sm:pb-14 sm:pl-14' : ''}>
            <figure className="relative">
              <img src={imagery.feature.src} srcSet={imagery.feature.srcSet} sizes="(min-width: 1024px) 540px, 100vw" alt={imagery.feature.alt} loading="lazy" className={`aspect-[5/4] w-full rounded-md object-cover ${classic ? 'object-top' : 'object-center'} shadow-[0_18px_40px_-20px_rgb(15_23_42/0.45)] ring-1 ring-(--site-line)`} />
              <span aria-hidden className="absolute -right-3 -top-3 -z-10 h-24 w-24 rounded-md border-2 border-(--site-detail) opacity-60" />
              {imagery.inset && (
                <img src={imagery.inset.src} srcSet={imagery.inset.srcSet} alt={imagery.inset.alt} loading="lazy" className="absolute -bottom-10 -left-10 w-1/2 rounded-md object-cover shadow-xl ring-4 ring-white sm:-bottom-14 sm:-left-14" />
              )}
            </figure>
          </Reveal>
        </div>
        <div className={`relative mx-auto mt-16 grid max-w-6xl gap-8 px-4 sm:px-6 ${s.campuses.length ? 'lg:grid-cols-[1.1fr_1fr]' : ''}`}>
          <Reveal>
            {s.principalMessage ? (
              <Panel className="relative h-full p-8 sm:p-10">
                <Quote size={44} className="absolute right-8 top-8 text-(--site-accent-soft)" fill="currentColor" strokeWidth={0} />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Message from the principal</p>
                <blockquote className="site-serif mt-5 whitespace-pre-line text-xl leading-relaxed text-slate-700">{s.principalMessage}</blockquote>
                {s.principalName && (
                  <figcaption className="mt-8 border-t border-(--site-line) pt-5">
                    <span className="site-serif block text-lg font-semibold text-slate-900">{s.principalName}</span>
                    <span className="text-sm text-slate-500">Principal, {s.school.name}</span>
                  </figcaption>
                )}
              </Panel>
            ) : (
              <Panel className="h-full p-8 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">At a glance</p>
                <dl className="mt-6 divide-y divide-(--site-line)">
                  {[
                    ['Classes', classRange],
                    ['Current session', currentSession?.name],
                    ['Teaching staff', s.stats.teachers ? `${s.stats.teachers} teachers` : null],
                    ['Campuses', s.campuses.map((c) => c.name).join(', ') || null],
                    ['Admissions', s.admissionsOpen ? 'Open: apply online' : 'Closed at present'],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-3.5">
                      <dt className="text-sm text-slate-500">{k}</dt>
                      <dd className="text-right font-semibold text-slate-800">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}
          </Reveal>
          {s.campuses.length > 0 && (
            <Reveal className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{s.campuses.length === 1 ? 'Our campus' : 'Our campuses'}</p>
              {s.campuses.map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-md border border-(--site-line) bg-white/80 p-5 backdrop-blur">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-(--site-accent)" />
                  <div><p className="font-semibold text-slate-900">{c.name}</p>{c.address && <p className="text-sm text-slate-500">{c.address}</p>}</div>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      {/* Gallery */}
      {s.media.length > 0 && (
        <section id="gallery" className="scroll-mt-24 border-y border-(--site-line) bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal><SectionTitle kicker="Gallery" title="Life at our school" sub="Campus, classrooms, events and achievements, as shared by the school." /></Reveal>
            <SiteGallery media={s.media} />
          </div>
        </section>
      )}

      {/* Admissions */}
      {s.admissionsOpen && (
        <section id="admissions" className="relative scroll-mt-24 overflow-hidden py-24">
          {imagery.admissionsBackdrop && <Backdrop src={imagery.admissionsBackdrop} />}
          <SiteArtwork variant="cornerLeft" opacity={0.09} />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal><SectionTitle kicker="Admissions" title="Apply online" sub={`Admissions are open${currentSession ? ` for session ${currentSession.name}` : ''}. Send the application from home; the office takes it from there.`} /></Reveal>
            <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
              <Reveal>
                <ol className="relative space-y-7 border-l border-(--site-line) pl-8">
                  {ADMISSION_STEPS.map(({ Icon, title, text }, i) => (
                    <li key={title} className="relative">
                      <span className="absolute -left-[3.05rem] flex h-9 w-9 items-center justify-center rounded-full bg-white text-(--site-accent) ring-1 ring-(--site-line)"><Icon size={16} /></span>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Step {i + 1}</p>
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal><AdmissionForm site={s} /></Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Careers */}
      {s.careersOpen && (
        <section id="careers" className="scroll-mt-24 border-y border-(--site-line) bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal><SectionTitle kicker="Careers" title="Join our team" sub="Teaching and non-teaching vacancies. Apply online in a few minutes." /></Reveal>
            {s.jobs.length === 0 ? (
              <p className="rounded-md border border-dashed border-(--site-line) bg-(--site-page) p-10 text-center text-slate-500">There are no open positions right now. Please check back later.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {s.jobs.map((j) => (
                  <Reveal key={j.id}>
                    <Panel className="flex h-full flex-col p-6 sm:p-7">
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--site-accent-soft) text-(--site-accent)"><Briefcase size={19} /></span>
                        <div className="min-w-0">
                          <h3 className="site-serif text-xl font-semibold text-slate-900">{j.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{j.staffType === 'teaching' ? 'Teaching' : 'Non-teaching'}{j.department ? ` · ${j.department}` : ''} · {j.campus.name} · {j.openings} opening{j.openings === 1 ? '' : 's'}</p>
                        </div>
                      </div>
                      {j.description && <p className="mt-5 flex-1 whitespace-pre-line leading-relaxed text-slate-600">{j.description}</p>}
                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-(--site-line) pt-5">
                        <span className="text-sm text-slate-500">{j.closingDate ? `Apply by ${new Date(j.closingDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Open until filled'}</span>
                        <Button onClick={() => setJob(j)} className="bg-(--site-accent)!">Apply now</Button>
                      </div>
                    </Panel>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24">
        {imagery.contactBackdrop && <Backdrop src={imagery.contactBackdrop} />}
        <SiteArtwork variant="corner" opacity={0.08} />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><SectionTitle kicker="Contact" title="Visit or call us" /></Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            <Panel className="space-y-5 p-7 sm:p-8">
              {s.contact.phone && <a href={`tel:${s.contact.phone}`} className="flex items-center gap-4 text-slate-700 hover:text-(--site-accent)"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--site-accent-soft) text-(--site-accent)"><Phone size={18} /></span><span><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Phone</span><span className="font-semibold">{s.contact.phone}</span></span></a>}
              {s.contact.email && <a href={`mailto:${s.contact.email}`} className="flex items-center gap-4 text-slate-700 hover:text-(--site-accent)"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--site-accent-soft) text-(--site-accent)"><Mail size={18} /></span><span><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Email</span><span className="font-semibold">{s.contact.email}</span></span></a>}
              {s.contact.address && <p className="flex items-start gap-4 text-slate-700"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--site-accent-soft) text-(--site-accent)"><MapPin size={18} /></span><span><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Address</span><span className="font-semibold">{s.contact.address}</span></span></p>}
              {!hasContact && <p className="text-slate-500">Contact details will be added soon. Meanwhile, parents and staff can reach the school through the portal.</p>}
              {socialEntries(s.contact).length > 0 && (
                <div className="border-t border-(--site-line) pt-5">
                  <span className="mb-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Follow us</span>
                  <SocialLinks links={s.contact} linkClassName="bg-white text-slate-700 ring-(--site-line) hover:text-(--site-accent)" />
                </div>
              )}
            </Panel>
            {s.contact.mapUrl ? (
              <iframe title="Map" src={s.contact.mapUrl} className="h-80 w-full rounded-md border border-(--site-line) bg-white" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-md border border-(--site-line) bg-white">
                <SiteArtwork variant="cornerLeft" opacity={0.12} />
                <div className="relative text-center">
                  <MapPin size={30} className="mx-auto text-(--site-accent)" />
                  <p className="site-serif mt-3 text-lg font-semibold text-slate-800">{s.campuses[0]?.name ?? s.school.name}</p>
                  {(s.campuses[0]?.address ?? s.contact.address) && <p className="mt-1 text-sm text-slate-500">{s.campuses[0]?.address ?? s.contact.address}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative overflow-hidden text-sm ${classic ? 'bg-(--site-band) text-slate-300' : 'border-t-[3px] border-(--site-accent) bg-white text-slate-600'}`}>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              {crest('h-10 w-10')}
              <span className={`site-serif text-lg font-semibold ${classic ? 'text-white' : 'text-slate-900'}`}>{s.school.name}</span>
            </div>
            <p className={`mt-4 max-w-sm leading-relaxed ${classic ? 'text-slate-400' : 'text-slate-500'}`}>{s.tagline}</p>
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.16em] ${classic ? 'text-slate-400' : 'text-slate-500'}`}>Explore</p>
            <ul className="mt-4 space-y-2">
              {nav.map(([id, label]) => <li key={id}><a href={`#${id}`} className={classic ? 'hover:text-white' : 'hover:text-(--site-accent)'}>{label}</a></li>)}
              <li><Link to={portalHref} className={classic ? 'hover:text-white' : 'hover:text-(--site-accent)'}>School portal</Link></li>
            </ul>
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.16em] ${classic ? 'text-slate-400' : 'text-slate-500'}`}>Contact</p>
            <ul className="mt-4 space-y-2">
              {s.contact.phone && <li>{s.contact.phone}</li>}
              {s.contact.email && <li>{s.contact.email}</li>}
              {s.contact.address && <li>{s.contact.address}</li>}
              {!hasContact && <li className="text-slate-400">Details coming soon</li>}
            </ul>
          </div>
        </div>
        <div className={classic ? 'border-t border-white/10' : 'border-t border-(--site-line) bg-(--site-page)'}>
          <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs sm:px-6 ${classic ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>© {new Date().getFullYear()} {s.school.name}. All rights reserved.</span>
            <span>School website by <strong className={`font-semibold ${classic ? 'text-slate-200' : 'text-slate-700'}`}>{PRODUCT_NAME}</strong></span>
          </div>
        </div>
      </footer>

      <JobApplyModal job={job} onClose={() => setJob(null)} />
    </div>
  );
}
