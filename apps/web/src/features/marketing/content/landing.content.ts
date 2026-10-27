import {
  Award,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  ClipboardList,
  Crown,
  FolderOpen,
  GraduationCap,
  Layers,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from '@/components/ui';

/** Landing-page sections, in order; the side navigator and header links use these ids. */
export const SECTIONS = [
  { id: 'top', label: 'Home' },
  { id: 'tour', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'roles', label: 'Dashboards' },
  { id: 'modules', label: 'Modules' },
  { id: 'special', label: 'Why us' },
  { id: 'numbers', label: 'At a glance' },
  { id: 'plans', label: 'Plans' },
  { id: 'contact', label: 'Get started' },
] as const;

export const NAV_LINKS = SECTIONS.filter((s) => ['tour', 'features', 'roles', 'modules', 'special', 'plans'].includes(s.id));

export interface FeatureSlide {
  title: string;
  kicker: string;
  text: string;
  points: string[];
  photo: string;
  alt: string;
  icon: LucideIcon;
  tone: Tone;
}

export const FEATURES: FeatureSlide[] = [
  {
    kicker: 'Academics & timetable',
    title: 'Your school, modelled exactly as it runs',
    text: 'Academic years and terms, classes, sections at each campus, subjects and rooms, then a clash-free weekly timetable with live class sessions.',
    points: ['Year, term, class and section structure', 'Clash-checked timetable builder', 'Start / end class with a live monitor'],
    photo: 'teacher-whiteboard',
    alt: 'Teacher explaining a lesson to pupils at the whiteboard',
    icon: Layers,
    tone: 'primary',
  },
  {
    kicker: 'Admissions & students',
    title: 'From first application to enrolled pupil',
    text: 'Documents, interviews, approval and enrolment in one tracked flow, with guardian accounts linked to every child.',
    points: ['Online admission workflow', 'Guardian logins for every family', 'Complete student profile and documents'],
    photo: 'students-uniform',
    alt: 'Pupils in school uniform in a classroom',
    icon: GraduationCap,
    tone: 'orange',
  },
  {
    kicker: 'Attendance',
    title: 'Attendance that checks itself',
    text: 'Teachers mark each class session; staff check in with GPS, validated against every campus geofence and flagged for review when it does not match.',
    points: ['Session-based student attendance', 'Geofenced staff check-in', 'Leave requests and approvals'],
    photo: 'student-hand',
    alt: 'Pupil raising her hand in class',
    icon: ClipboardCheck,
    tone: 'primary',
  },
  {
    kicker: 'Fees & payroll',
    title: 'Money in, money out, fully reconciled',
    text: 'Fee structures, invoices, scholarships, payments and printable receipts. Payroll is calculated from attendance and leave, reviewed, approved, then paid.',
    points: ['Invoices, receipts and overdue tracking', 'Discounts and scholarships', 'Payroll with review and approval chain'],
    photo: 'students-laptop',
    alt: 'Students reviewing results together on a laptop',
    icon: Wallet,
    tone: 'orange',
  },
  {
    kicker: 'Learning & exams',
    title: 'Teach, assign, grade and publish',
    text: 'Course material with discussion, assignments with online submission and grading, exams with marksheets, ranked report cards and one-click publishing.',
    points: ['PDF, video and link materials', 'Assignments with late tracking', 'Report cards with grading scales'],
    photo: 'students-books',
    alt: 'Students studying together with books',
    icon: BookOpen,
    tone: 'primary',
  },
];

export const MODULES: [string, LucideIcon, Tone][] = [
  ['Students', GraduationCap, 'primary'],
  ['Staff', Briefcase, 'primary'],
  ['Admissions', ClipboardList, 'orange'],
  ['Academics', Layers, 'primary'],
  ['Timetable', CalendarDays, 'primary'],
  ['Attendance', ClipboardCheck, 'orange'],
  ['Fees & Finance', Wallet, 'amber'],
  ['Payroll', Banknote, 'orange'],
  ['LMS', BookOpen, 'primary'],
  ['Exams & Results', Award, 'orange'],
  ['Communication', MessagesSquare, 'primary'],
  ['Reports', ChartColumn, 'primary'],
  ['Documents', FolderOpen, 'primary'],
  ['Multi-campus', Building2, 'primary'],
];

/** What each role's dashboard puts in front of them (matches the shipped dashboards). */
export const ROLE_VIEWS: { key: string; name: string; tone: Tone; icon: LucideIcon; headline: string; items: string[] }[] = [
  { key: 'admin', name: 'Administrator', tone: 'primary', icon: ShieldCheck, headline: 'The whole school at a glance', items: ['Students, staff, admissions and fees KPIs', 'Admissions pipeline by stage', 'Leave waiting for approval', 'Payroll and hiring status'] },
  { key: 'accounts', name: 'Accounts', tone: 'orange', icon: Wallet, headline: 'Collections and dues, live', items: ['Collected this month and outstanding', 'Invoices by status', 'Recent payments and receipts', 'Payroll runs in progress'] },
  { key: 'teacher', name: 'Teacher', tone: 'primary', icon: Users, headline: 'Today, one tap away', items: ["Today's classes with start / end", 'GPS check-in', 'Leave balance', 'Latest payslip'] },
  { key: 'student', name: 'Student', tone: 'primary', icon: GraduationCap, headline: 'Everything due, in order', items: ["Today's timetable", 'Assignments still to hand in', 'Recent results', 'Fee balance'] },
  { key: 'parent', name: 'Parent', tone: 'orange', icon: Users, headline: 'Every child, side by side', items: ['Each child and their class', 'Homework per child', 'Results as they are published', 'Fees due per child'] },
];

export const TRUST: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ShieldCheck, title: 'Isolated per school', text: 'Database-level separation of every tenant' },
  { icon: Building2, title: 'Multi-campus', text: 'Sections, rooms and geofences per campus' },
  { icon: Users, title: 'Role-based access', text: 'Permissions for every role and module' },
  { icon: Sparkles, title: '1-month free trial', text: 'Full features, no billing during trial' },
];

export const TIER_ICON: Record<string, LucideIcon> = { starter: Zap, growth: Rocket, scale: Sparkles, enterprise: Crown };
