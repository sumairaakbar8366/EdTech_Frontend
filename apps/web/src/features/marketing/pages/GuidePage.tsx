import { ArrowLeft, Download, HelpCircle, Lightbulb, Mail, MapPin, Phone, PlayCircle, Printer, UserCog } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';
import { CONTACT_EMAIL } from '@/config/site';
import { CHAPTERS, FAQ } from '@/features/marketing/guide/guide.content';
import { usePublicSiteSettings } from '@/features/website/siteService';

export const GUIDE_PDF = '/guide/Skool-EdTech-User-Guide.pdf';

const ROLES: [role: string, does: string, login: string][] = [
  ['School administrator', 'Sets up and runs everything: settings, academics, staff, students, admissions, fees, website, access.', 'Created at sign-up (Google or email).'],
  ['Principal', 'Oversees the school: dashboards, attendance, results, finance and reports; approves where needed.', 'Given by the administrator in Users & Access.'],
  ['Accounts', 'Fee structures, invoices, payments, concessions, payroll and financial reports.', 'Given by the administrator in Users & Access.'],
  ['Teacher', 'Timetable, class attendance, assignments, learning material, marks entry, own leave and payslips.', 'Created with the staff record (Staff → Add staff).'],
  ['Non-teaching staff', 'Own attendance, leave, assigned tasks and payslips.', 'Created with the staff record.'],
  ['Parent', 'Children’s attendance, timetable, homework, results, fees, receipts and messages.', 'Created when the child is enrolled (or imported).'],
  ['Student', 'Classes, timetable, material, assignments, exams, results, fees and documents.', 'Created when enrolled (optional).'],
];

/** The written user guide: every step of setting up and running a school, printable as a PDF. */
export function GuidePage() {
  useForcedLightTheme();
  const site = usePublicSiteSettings().data;
  const email = site?.contactEmail ?? CONTACT_EMAIL;
  useEffect(() => { document.title = `User guide | ${PRODUCT_NAME}`; }, []);

  return (
    <div className="print-document min-h-dvh bg-white text-slate-800 print:text-[11pt]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
          <Link to="/" aria-label={`${PRODUCT_NAME} home`}><BrandLockup size="sm" /></Link>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Link to="/tour" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold uppercase text-slate-700 hover:bg-slate-100"><PlayCircle size={16} /> Watch video</Link>
            <a href={GUIDE_PDF} download className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold uppercase text-slate-700 hover:bg-slate-100"><Download size={16} /> PDF</a>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-bold uppercase text-white"><Printer size={16} /> Print</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 print:max-w-none print:px-0 print:py-0">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline print:hidden"><ArrowLeft size={15} /> Back to {PRODUCT_NAME}</Link>
        <div className="hidden print:mb-6 print:block"><BrandLockup size="sm" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">User guide</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">How to use {PRODUCT_NAME}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
          Everything you need to set up your school and run it day to day: from signing up with Google to admissions, fees, exams and the parent portal. Follow the steps in order the first time; afterwards, jump to the part you need.
        </p>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 print:break-inside-avoid print:bg-white">
          <h2 className="text-lg font-bold text-slate-900">Contents</h2>
          <ol className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}><a href={`#${c.id}`} className="flex gap-3 text-slate-700 hover:text-primary-700"><span className="w-6 shrink-0 text-right font-mono text-slate-400">{i + 1}.</span>{c.title}</a></li>
            ))}
            <li><a href="#roles" className="flex gap-3 text-slate-700 hover:text-primary-700"><span className="w-6 shrink-0 text-right font-mono text-slate-400">{CHAPTERS.length + 1}.</span>Who does what: roles and access</a></li>
            <li><a href="#faq" className="flex gap-3 text-slate-700 hover:text-primary-700"><span className="w-6 shrink-0 text-right font-mono text-slate-400">{CHAPTERS.length + 2}.</span>Problems and answers</a></li>
          </ol>
        </section>

        {CHAPTERS.map((c, i) => (
          <section key={c.id} id={c.id} className="mt-14 scroll-mt-24 print:mt-8 print:break-before-page">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 print:border print:border-slate-300"><c.icon size={24} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Step {i + 1} of {CHAPTERS.length}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">{c.title}</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500"><UserCog size={14} /> {c.who}</p>
              </div>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{c.summary}</p>
            <ol className="mt-6 space-y-4">
              {c.steps.map((s, n) => (
                <li key={s.title} className="rounded-xl border border-slate-200 p-5 print:break-inside-avoid">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white print:border print:border-slate-400 print:bg-white print:text-slate-800">{n + 1}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    {s.where && <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[13px] text-slate-600">{s.where}</span>}
                  </div>
                  <p className="mt-2 leading-relaxed text-slate-600">{s.text}</p>
                  {s.tips?.map((tip) => (
                    <p key={tip} className="mt-3 flex gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900 print:border print:border-orange-200 print:bg-white"><Lightbulb size={16} className="mt-0.5 shrink-0 text-orange-500" /> {tip}</p>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section id="roles" className="mt-14 scroll-mt-24 print:break-before-page">
          <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">Who does what: roles and access</h2>
          <p className="mt-3 text-slate-600">Every person signs in at your school’s address and sees only what their role allows. Change roles any time in <strong>Users &amp; Access</strong>; one person can hold several roles (e.g. a teacher who is also a parent).</p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Role</th><th className="px-4 py-3">What they do</th><th className="px-4 py-3">How they get a login</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {ROLES.map(([role, does, login]) => <tr key={role} className="print:break-inside-avoid"><td className="px-4 py-3 font-semibold text-slate-900">{role}</td><td className="px-4 py-3 text-slate-600">{does}</td><td className="px-4 py-3 text-slate-600">{login}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="mt-14 scroll-mt-24 print:break-before-page">
          <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">Problems and answers</h2>
          <div className="mt-5 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} open className="group rounded-xl border border-slate-200 p-5 print:break-inside-avoid">
                <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold text-slate-900"><HelpCircle size={18} className="mt-0.5 shrink-0 text-primary-600" /> {f.q}</summary>
                <p className="mt-2 pl-[30px] leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl bg-[#13294a] p-6 text-white sm:p-8 print:break-inside-avoid print:border print:border-slate-300 print:bg-white print:text-slate-800">
          <h2 className="text-xl font-semibold">Still need help?</h2>
          <p className="mt-2 text-slate-300 print:text-slate-600">Contact us with your school’s address and your User ID, and tell us what you were trying to do.</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 font-semibold hover:underline"><Mail size={16} /> {email}</a>
            {site?.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 font-semibold hover:underline"><Phone size={16} /> {site.phone}</a>}
            {site?.address && <span className="inline-flex items-center gap-2"><MapPin size={16} /> {site.address}</span>}
          </div>
        </section>
      </main>
    </div>
  );
}
