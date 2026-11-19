import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';
import { CONTACT_EMAIL } from '@/config/site';
import { useSiteScale } from '@/features/marketing/hooks/useSiteScale';
import { usePublicSiteSettings } from '@/features/website/siteService';

type Section = [heading: string, body: string[]];

const COMPANY = 'ANet Cyber Solutions';
const UPDATED = '18 November 2026';

const PRIVACY: Section[] = [
  ['Who we are', [`${PRODUCT_NAME} is a school management service run by ${COMPANY}. This page explains what information the service collects, why, and what you can ask us to do with it.`]],
  ['What we collect', [
    'Account details: name, email address, mobile number and role (administrator, principal, teacher, staff, accountant, parent or student).',
    'School records entered by schools: students, staff, classes, attendance, timetables, fees, invoices, results, complaints, documents and messages. The school decides what it enters and is responsible for it.',
    'When a school applies to join: the owner’s CNIC and the school’s NTN, used only to verify the application. The CNIC is erased once the application is decided; only a one-way fingerprint and the last four digits are kept to spot duplicate applications.',
    'Location: when staff check in for attendance, the phone’s position is compared with the school’s campus area. It is used only for that check-in.',
    'Fingerprint or face: when a teacher uses fingerprint or face for attendance, the check happens on the phone. Your fingerprint or face is never sent to us. We store only a public key that proves the phone made the check.',
    'Technical data: device and browser type, and sign-in times, kept for security.',
  ]],
  ['Sign in with Google', ['If you choose “Continue with Google”, we receive your email address and name from Google to confirm that the mailbox is yours. We do not receive your Google password and we do not read your Google data.']],
  ['How we use it', ['To run the service for your school, to verify applications, to send sign-in codes, receipts, notices and notifications, to keep the service secure, and to fix problems. We do not sell personal information and we do not show advertising.']],
  ['Who sees it', ['Each school’s data is separated from every other school’s. Only people in that school, with the permission their role gives, can see it. Our team can access it only to run, secure and support the service. We use email and hosting providers to deliver the service; they process data on our behalf.']],
  ['How long we keep it', ['We keep a school’s data while it uses the service. When a school leaves, it can ask us to delete or export its data.']],
  ['Security', ['Sign-in uses passwords and short-lived tokens, connections are encrypted, and access is limited by role. No system is perfectly secure, so please keep your password private.']],
  ['Your choices', [`You can ask to see, correct or delete your information. Students’ and parents’ requests go through their school first. To contact us, write to the email below.`]],
  ['Changes', ['If we change this policy we will update the date at the top of this page.']],
];

const TERMS: Section[] = [
  ['Agreement', [`These terms apply when you use ${PRODUCT_NAME}, run by ${COMPANY}. By signing in or registering a school you accept them.`]],
  ['Who can use it', ['Schools whose application we have verified and approved, and the people the school gives accounts to. The person who registers a school confirms they are authorised to act for it and that the details they give (including CNIC and NTN) are true.']],
  ['Your account', ['Keep your sign-in details private. You are responsible for what happens under your account. Do not share a password or let someone else mark your attendance. Tell us at once if you think an account was misused.']],
  ['School data', ['The school owns the data it enters. It is responsible for having the right to enter it, for keeping it accurate, and for telling its students, parents and staff how it is used. We process it only to provide the service.']],
  ['Acceptable use', ['Do not use the service to break the law, harass anyone, upload harmful files, try to reach another school’s data, or disrupt the service.']],
  ['Trials, plans and fees', ['A school may receive a trial, the length of which we set when we approve its application. Plans and fees, where they apply, are agreed with the school. We may suspend an account that is misused or unpaid.']],
  ['Availability', ['We work to keep the service running and to keep data safe, but we cannot promise it will always be available or error-free. The app can work offline; changes made offline are sent when the connection returns.']],
  ['Limits of responsibility', ['To the extent the law allows, the service is provided “as is” and we are not liable for indirect or consequential loss. Nothing here limits any right you have that cannot be limited by law.']],
  ['Ending', ['A school may stop using the service at any time. We may end access for serious or repeated breaches of these terms.']],
  ['Changes and contact', ['We may update these terms and will change the date above when we do. Questions: write to the email below.']],
];

/** Public privacy policy and terms of service (linked from the Google sign-in consent screen). */
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  useSiteScale();
  useForcedLightTheme();
  const site = usePublicSiteSettings().data;
  const email = site?.contactEmail ?? CONTACT_EMAIL;
  const title = kind === 'privacy' ? 'Privacy policy' : 'Terms of service';
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  useEffect(() => { document.title = `${title} | ${PRODUCT_NAME}`; }, [title]);
  return (
    <div className="min-h-dvh bg-white text-slate-800">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-8"><Link to="/" aria-label={`${PRODUCT_NAME} home`}><BrandLockup size="sm" /></Link></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"><ArrowLeft size={15} /> Back to {PRODUCT_NAME}</Link>
        <h1 className="font-display text-4xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {UPDATED}</p>
        {sections.map(([h, body]) => (
          <section key={h} className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">{h}</h2>
            {body.length > 1
              ? <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">{body.map((b) => <li key={b}>{b}</li>)}</ul>
              : <p className="mt-2 leading-relaxed text-slate-700">{body[0]}</p>}
          </section>
        ))}
        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-bold text-slate-900">Contact</h2>
          <p className="mt-1 text-slate-700">{COMPANY} · <a className="font-semibold text-primary-700 hover:underline" href={`mailto:${email}`}>{email}</a></p>
        </section>
      </main>
    </div>
  );
}
