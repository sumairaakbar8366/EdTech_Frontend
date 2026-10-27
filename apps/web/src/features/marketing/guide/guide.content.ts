import {
  Award,
  Banknote,
  Briefcase,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  DoorOpen,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Moon,
  ChartColumn,
  UserCheck,
  Settings,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

/**
 * The "How it works" chapters: the written user guide (/guide, and its PDF) and the chapters of the
 * walkthrough video, whose beats on real screens are in tour.beats.ts.
 */

// --- Written guide ---------------------------------------------------------------------------

export interface GuideStep {
  title: string;
  /** Where in the app, e.g. "Academics → Years & Terms". */
  where?: string;
  text: string;
  tips?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Who does this. */
  who: string;
  summary: string;
  steps: GuideStep[];
}



export const CHAPTERS: Chapter[] = [
  {
    id: 'signup',
    title: 'Create your school with Google',
    icon: UserPlus,
    who: 'The school owner or administrator',
    summary: 'Sign up in under a minute with your Google account. Your school, its own web address and your administrator login are created at once, on a free trial with every feature.',
    steps: [
      { title: 'Open the sign-up', where: 'Main website → Sign up (top right)', text: 'Click “Sign up”. Choose “Continue with Google” and pick the Google account you want to use as the school administrator.' },
      { title: 'Name your school and confirm your email', text: 'Type your school’s name. A 6-digit code is sent to your Gmail: enter it to prove the inbox is yours.', tips: ['No card is needed for the free trial.', 'Use an email you check often: password resets and notices go there.'] },
      { title: 'Note your User ID and school address', text: 'You get a User ID (for example ADM-…) and your school’s address (…/your-school). Click “Open my admin dashboard”.', tips: ['Next time, sign in with “Continue with Google”, or with your User ID or email and password.'] },
    ],
  },
  {
    id: 'dashboard',
    title: 'Your admin dashboard: the setup order',
    icon: LayoutDashboard,
    who: 'School administrator',
    summary: 'A new school starts empty. Set it up in this order, because each step uses the one before it: settings → academic year and terms → classes and sections → subjects and rooms → staff → students → fees → website.',
    steps: [
      { title: 'Find your way around', text: 'The menu on the left holds every module. The dashboard shows your school at a glance: students, staff, admissions, fees and today’s classes.' },
      { title: 'Follow the setup order', text: 'Work through the steps in the next chapters from top to bottom. You can always come back and change anything later.' },
    ],
  },
  {
    id: 'settings',
    title: 'School settings: campus, logo and colours',
    icon: Settings,
    who: 'School administrator',
    summary: 'Tell the system about your school: campuses, logo, theme colours, notifications and your own domain.',
    steps: [
      { title: 'Campuses', where: 'Settings → Campuses', text: 'Your main campus is created for you. Add any other branches with their address. Classes, rooms and staff belong to a campus.' },
      { title: 'Branding', where: 'Settings → Branding', text: 'Upload your logo and choose your colours. They appear on the portal, report cards, receipts and your website.' },
      { title: 'Notifications and domain', where: 'Settings → Notifications / Domains', text: 'Choose which events send emails, and connect your own domain (e.g. www.yourschool.edu.pk) if your plan includes it.' },
    ],
  },
  {
    id: 'year',
    title: 'Academic year and terms',
    icon: CalendarRange,
    who: 'School administrator',
    summary: 'Create the academic year (session) and its terms. Fees, attendance, exams and enrollments all belong to a year.',
    steps: [
      { title: 'Add the year', where: 'Academics → Years & Terms', text: 'Add the session with its start and end dates (e.g. 2026-27, 1 April to 31 March) and mark it as the current year.' },
      { title: 'Add terms', text: 'Inside the year, add your terms (e.g. First Term, Second Term) with their dates. Exams and termly fees use them.', tips: ['Add next year’s session early: online admissions can then apply for it.'] },
    ],
  },
  {
    id: 'classes',
    title: 'Classes, sections, subjects and rooms',
    icon: DoorOpen,
    who: 'School administrator',
    summary: 'Build the school’s structure: the classes you teach, their sections, the subjects and the rooms. Students are enrolled into sections; the timetable uses subjects and rooms.',
    steps: [
      { title: 'Classes and sections', where: 'Academics → Classes & Sections', text: 'Add each class with its level (Playgroup = 0, Class 1 = 1 …) so classes sort correctly, then add its sections (A, B …) with an optional capacity.' },
      { title: 'Subjects', where: 'Academics → Subjects', text: 'Add your subjects with a short code (e.g. Mathematics · MATH).' },
      { title: 'Rooms', where: 'Academics → Rooms', text: 'Add classrooms and labs with their campus and capacity. The timetable warns you about clashes.', tips: ['Already have this on paper or in Excel? Classes and subjects can also be imported (see “Import your existing data”).'] },
    ],
  },
  {
    id: 'staff',
    title: 'Staff and their logins',
    icon: Briefcase,
    who: 'School administrator',
    summary: 'Add your teachers, accountant and other staff with their photo. Each one can get a login with the right role: they sign in to their own dashboard.',
    steps: [
      { title: 'Add staff', where: 'Staff → Add staff', text: 'Enter the person’s details, designation, campus and whether they teach. Tick “create login” to email them their User ID and a temporary password.', tips: ['Many staff at once? Use Staff → Import with the Excel template.'] },
      { title: 'Give the right access', where: 'Users & Access', text: 'Each login has roles: Principal, School Admin, Accounts, Teacher, Non-teaching staff, Parent or Student. The role decides what they see and can change.' },
    ],
  },
  {
    id: 'hiring',
    title: 'Hiring: from job post to new teacher',
    icon: UserCheck,
    who: 'School administrator',
    summary: 'Post a vacancy, and it appears on your website. Candidates apply online with their photo and details; you shortlist, interview and hire. Hiring adds them to your staff with their login, in one click.',
    steps: [
      { title: 'Post the job', where: 'Staff → Hiring → New job post', text: 'Enter the title, staff type, department, campus, openings and closing date, set the status to Open and save. The post appears in the Careers section of your school website.' },
      { title: 'Candidates apply online', where: 'Your school website → Careers → Apply now', text: 'Candidates send their photo, contact details, qualification and experience. Each application arrives in Hiring as “Applied”, and you get a notification.' },
      { title: 'Shortlist and interview', where: 'Staff → Hiring → the candidate', text: 'Move a good candidate to Shortlisted, then schedule the interview (date, mode, interviewer). Afterwards record the result: score, recommendation and notes. A positive result moves them to Selected.', tips: ['Upload their CV and certificates to the candidate’s documents.'] },
      { title: 'Hire', text: 'Choose the joining date and click “Hire and add to staff”. They join your staff list with a teacher login; the User ID and a temporary password are shown once and emailed to them.' },
    ],
  },
  {
    id: 'timetable',
    title: 'Timetable',
    icon: CalendarDays,
    who: 'School administrator',
    summary: 'Build each section’s weekly timetable from subjects, teachers and rooms. Teachers, students and parents see it on their dashboards.',
    steps: [
      { title: 'Add periods', where: 'Timetable → Timetable', text: 'Choose a section, then add periods: day, time, subject, teacher and room. Clashes (a teacher or room booked twice) are refused.' },
      { title: 'Watch the day', where: 'Timetable → Class monitor', text: 'See which classes are running right now and whether the teacher has started them.' },
    ],
  },
  {
    id: 'website',
    title: 'Your website, admission form and fees',
    icon: Globe,
    who: 'School administrator',
    summary: 'Every school gets a public website built from its data. Design your own online admission form, choose which documents parents upload, and publish your fee structure.',
    steps: [
      { title: 'Texts and photos', where: 'Website', text: 'Add your tagline, about text, principal’s message, contact details, social links and gallery photos. Empty texts are generated from your data.' },
      { title: 'Design the admission form', where: 'Website → Design the admission form', text: 'Choose which standard fields to ask and which are mandatory, then add your own: text, number, date, dropdowns, checkboxes, an “I agree” box and document uploads (B-Form, result card …). A field can be asked for some classes only, and its answer can be saved straight into the student’s record (e.g. B-Form number, blood group, parent’s CNIC).' },
      { title: 'Publish your fees', where: 'Website → Fees on the website', text: 'Turn on “Show the fee structure to parents”. Each class’s fees (from Finance → Fee structures) appear on your website and on the admission form.' },
    ],
  },
  {
    id: 'apply',
    title: 'Parents apply online',
    icon: ClipboardCheck,
    who: 'Parents (on your school website)',
    summary: 'Parents open your website, check the fees and click “Apply now”. Your own admission form opens; every field is checked before it can be sent.',
    steps: [
      { title: 'Apply now', where: 'Your school website → Apply now', text: 'Parents fill in your form, upload the documents you asked for and send it. They get an application number on screen.', tips: ['Mistakes are shown at each field, all at once.', 'The same child cannot be sent twice: parents are told their application is already in progress.'] },
      { title: 'It arrives in Admissions', text: 'You get a notification. The application appears in Admissions as “Submitted”, marked as from the website, with its answers and documents.' },
    ],
  },
  {
    id: 'admissions',
    title: 'Admissions to enrollment',
    icon: GraduationCap,
    who: 'School administrator / office',
    summary: 'Move each application through the steps: documents verified → interview or test → review → approved → enrolled. Enrolling creates the student, the parent and their logins in one click.',
    steps: [
      { title: 'Review the application', where: 'Admissions → the application', text: 'Check the answers and documents. Move it to “Docs verified”, schedule an interview or test and record the result.' },
      { title: 'Approve and enroll', text: 'Approve it, then Enroll: choose the section, roll number and admission date. Tick “Create parent login” and “Create student login”.', tips: ['Everything from the application moves to the student record: details, photo, linked answers (B-Form, blood group, CNIC …) and documents.', 'A sibling’s parent is linked to the existing parent account instead of creating a duplicate.'] },
    ],
  },
  {
    id: 'showcase',
    title: 'A school in full swing',
    icon: ChartColumn,
    who: 'Everyone',
    summary: 'This is what your dashboards look like once the school is busy: hundreds of students, staff, applications, invoices and a full timetable, all at a glance.',
    steps: [
      { title: 'The dashboard', text: 'Today’s work (applications to review, fees collected, requests waiting), the key numbers and live classes: which have started, which are late.' },
      { title: 'Every list stays fast', text: 'Search, filter and export any list: students, staff, applications, invoices. Counts at the top show where things stand.' },
    ],
  },
  {
    id: 'import',
    title: 'Import your existing data from Excel',
    icon: FileSpreadsheet,
    who: 'School administrator',
    summary: 'Already have students, staff, classes or fees in Excel? Import them in minutes instead of typing. Every list can also be exported to Excel or CSV.',
    steps: [
      { title: 'Download the template', where: 'Students (or Staff, Academics, Finance) → Import', text: 'Download the Excel or CSV template. Copy your data into it, keeping the column headers.' },
      { title: 'Check and import', text: 'Choose the file. Every row is checked first: good rows are imported and rows with problems are listed with the reason, in a report you can download, fix and import again.', tips: ['Import in this order: classes and sections → students → fee data.', 'Excel import and export is part of the Growth plan and above (included in your free trial).'] },
      { title: 'Export any list', where: 'Export (on each list)', text: 'Export students, staff, invoices and more to Excel or CSV: the current page or all pages.' },
    ],
  },
  {
    id: 'fees',
    title: 'Fees: structures, invoices and payments',
    icon: Banknote,
    who: 'School administrator / accounts',
    summary: 'Set each class’s fees once, generate invoices for a month, record payments and print receipts. Parents see their invoices and receipts in their portal.',
    steps: [
      { title: 'Categories and structures', where: 'Finance → Categories / Fee structures', text: 'Add fee categories (Admission, Tuition, Transport …). Then create a fee structure for each class: the amount and how often (one-time, monthly, termly, annual).' },
      { title: 'Assign and generate invoices', where: 'Finance → Fee structures → Assign to students; Finance → Invoices → Generate', text: 'Assign the structure to the class’s students, then generate invoices for a billing period with issue and due dates.' },
      { title: 'Payments and receipts', where: 'Finance → Payments', text: 'Record cash, bank or online payments against invoices; a receipt is produced for each. Concessions and scholarships reduce what a student owes.' },
    ],
  },
  {
    id: 'daily',
    title: 'Every day: attendance, exams and messages',
    icon: Award,
    who: 'Teachers, principal and administrator',
    summary: 'Teachers mark attendance and enter marks from their own dashboards; you publish results and send announcements.',
    steps: [
      { title: 'Attendance', where: 'Teacher → Class Attendance; Admin → Attendance', text: 'Teachers mark their class present, absent or late. Staff check in (with location, where enabled). You see the school’s attendance and approve leave.' },
      { title: 'Exams and results', where: 'Exams & Results', text: 'Create an exam for a term, teachers enter marks, then publish: students and parents see results and report cards.' },
      { title: 'Communication', where: 'Communication', text: 'Publish announcements to the whole school, a class or a role. Parents and teachers can message each other.' },
    ],
  },
  {
    id: 'portals',
    title: 'What parents, students and teachers see',
    icon: UsersRound,
    who: 'Parents, students and teachers',
    summary: 'Everyone signs in at your school’s address with the User ID and password they received by email, and sees only what concerns them.',
    steps: [
      { title: 'Parents', text: 'Their children’s attendance, timetable, homework, results, fee invoices and receipts, notices and messages to teachers. One login covers all their children.' },
      { title: 'Students', text: 'Their classes, timetable, learning material, assignments, exams, results, fees and documents.' },
      { title: 'Teachers', text: 'Their timetable, today’s classes, attendance, assignments, marks entry, own attendance, leave and payslips.' },
      { title: 'First sign-in', text: 'They change the temporary password and confirm their email. “Forgot password” and “Forgot User ID” are on the sign-in page.' },
    ],
  },
  {
    id: 'theme',
    title: 'Light and dark mode',
    icon: Moon,
    who: 'Everyone',
    summary: 'Every page works in light and in dark mode, on a computer and on a phone. Each person chooses what is easier on their eyes.',
    steps: [
      { title: 'Switch the theme', where: 'Top right of every page: the moon / sun button', text: 'Click it to switch between light and dark. Your choice is remembered on that device.' },
    ],
  },
  {
    id: 'help',
    title: 'Getting help',
    icon: LifeBuoy,
    who: 'Everyone',
    summary: 'Watch this walkthrough again or open the user guide at any time. For anything else, contact support.',
    steps: [
      { title: 'This guide', where: 'Main website → How it works / User guide', text: 'Open the written guide or download it as a PDF to keep or print for your staff.' },
      { title: 'Support', text: 'Email or call us using the contact details at the bottom of the main website. Tell us your school’s address and User ID so we can help quickly.' },
    ],
  },
];

/** Answers to the questions schools ask most. */
export const FAQ: { q: string; a: string }[] = [
  { q: 'I forgot my password or User ID.', a: 'On your school’s sign-in page use “Forgot password” or “Forgot User ID”. A link or your ID is sent to the email on your account. If you signed up with Google, “Continue with Google” always works.' },
  { q: 'A teacher or parent did not get their login email.', a: 'Ask them to check spam. Then open Users & Access, find the person and use “Reset password”: new sign-in details are issued. Make sure their email is spelled correctly.' },
  { q: 'Someone sees too much (or too little).', a: 'What a person sees depends on their role. Change their roles in Users & Access. A teacher who is also a parent can hold both roles with one login.' },
  { q: 'I cannot enroll a student.', a: 'The application must be “Approved” first, and the class needs at least one section. Create sections in Academics → Classes & Sections.' },
  { q: 'Online admissions say “closed”.', a: 'Website → Switches → turn on “Accept admission applications online” and make sure “Website is online” is on. A current or upcoming academic year must exist.' },
  { q: 'Fees do not show on my website.', a: 'Website → Fees on the website → turn on “Show the fee structure to parents”. Only active fee structures of the current and upcoming sessions are shown.' },
  { q: 'My Excel import shows errors.', a: 'Download the error report: each row lists what is wrong (missing column, unknown class, bad date). Fix those rows and import only them again; rows already imported are not repeated.' },
  { q: 'A feature is locked.', a: 'Some modules belong to higher plans (e.g. Exams, LMS, Payroll and Excel import on Growth). Open Plans & Billing to see what your plan includes and upgrade.' },
];
