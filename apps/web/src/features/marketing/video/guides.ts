import { Banknote, BookOpen, CalendarDays, ClipboardCheck, Crown, FileText, GraduationCap, KeyRound, LayoutDashboard, MessageSquare, Settings, ShieldCheck, UserCheck, UserCog, UserPlus, Users, UsersRound, Wallet, type LucideIcon } from 'lucide-react';
import type { Clip, TourBeat } from '@/features/marketing/guide/tour.beats';

/**
 * The role guides: one video for each role, a chapter for each job, every step on a real screen of
 * the app with the narrator explaining it. They play on the walkthrough engine (guide/TourPlayer) and
 * are recorded to MP4 by the recorder. A chapter's beats speak from `say`; the clips are
 * public/guide/voice/<chapter>-<n>.mp3.
 */

type B = Omit<TourBeat, 'voice'>;
const ch = (id: string, title: string, icon: LucideIcon, summary: string, beats: B[]): Clip => ({ id, title, icon, summary, beats: beats.map((b, i) => ({ ...b, voice: `${id}-${i}` })) });

export interface GuideVideo {
  id: string;
  title: string;
  /** The label on its slide ("School admin"…). */
  role: string;
  blurb: string;
  icon: LucideIcon;
  poster: TourBeat['shot'];
  phone?: boolean;
  clips: Clip[];
}

const FULL: [number, number, number, number] = [292, 60, 1110, 560];

// --- 1. Register ----------------------------------------------------------------------------------
const REGISTER: GuideVideo = {
  id: 'guide-register', title: 'How to register your school', role: 'Start here', icon: UserPlus, poster: 'r-school',
  blurb: 'Apply online, get verified by our team, and sign in to your new school.',
  clips: [
    ch('g-reg-1', 'Open the website and apply', UserPlus, 'Four short steps, in a few minutes.', [
      { shot: 'r-start', say: 'Open our website, Skool EdTech, and choose Register. You will apply in four short steps.', caption: 'Open the website and choose “Register”.', focus: [400, 140, 640, 120] },
      { shot: 'r-start', say: 'First, verify your email, with Google or a six digit code. Then your mobile number, with a WhatsApp code.', caption: 'Verify your email and mobile number with codes.', focus: [406, 320, 628, 360], click: 'Send code' },
      { shot: 'r-email-code', say: 'Type the code from your inbox. Both are checked, so we know it is really you.', caption: 'Type the code from your inbox.', focus: [406, 420, 628, 300], click: 'Verify email', toast: 'Email verified' },
    ]),
    ch('g-reg-2', 'About you and your school', FileText, 'Your details, the school’s, then submit.', [
      { shot: 'r-about', say: 'Now tell us about you: your name, your role at the school, and your C N I C. Our team will check it by hand.', caption: 'Your name, your role and your CNIC.', focus: [380, 330, 680, 330] },
      { shot: 'r-school', say: 'Then your school: its registered name, N T N, registration number, city, address, and how many students and teachers you have.', caption: 'The school: name, NTN, city and size.', focus: [380, 330, 680, 480] },
      { shot: 'r-review', say: 'Review everything, accept the declaration, and submit. Nothing is created until our team approves.', caption: 'Review, accept and submit.', focus: [400, 360, 640, 260], click: 'Submit application' },
      { shot: 'r-done', say: 'You receive a reference number by email. Keep it, in case you need to contact us.', caption: 'You receive a reference number.', focus: [420, 300, 600, 240] },
    ]),
    ch('g-reg-3', 'Our team verifies you', ShieldCheck, 'No school is created until it is checked.', [
      { shot: 'o-checklist', say: 'Our team checks your C N I C, N T N, and school, one by one, and may call you. This usually takes a few working days.', caption: 'The team verifies your details by hand.', focus: [310, 330, 1070, 330] },
      { shot: 'o-checklist', say: 'When everything is right, the owner approves. Your school is created, with a free trial sized to your school.', caption: 'Approved: your school is created.', focus: [310, 330, 1070, 330], click: 'Approve & create the school', toast: 'School created' },
    ]),
    ch('g-reg-4', 'Your first sign-in', KeyRound, 'Your login arrives by email.', [
      { shot: 'r-login', say: 'You receive your User I D and a password by email. Open the sign in page, and enter them.', caption: 'Sign in with the User ID and password from your email.', focus: [880, 190, 400, 400] },
      { shot: 'r-change', say: 'The first thing you do is choose your own new password. The emailed one was only temporary.', caption: 'Choose your own new password first.', focus: [520, 170, 400, 520], click: 'Save and continue' },
      { shot: 'r-next', say: 'That is it. Your empty school is ready, and a short guided tour begins. Next, watch the administrator guide, to set it up.', caption: 'Your school is ready. Next: the administrator guide.', focus: FULL },
    ]),
  ],
};

// --- 2. School administrator, part 1: set up ----------------------------------------------------
const ADMIN: GuideVideo = {
  id: 'guide-admin', title: 'The school administrator, part 1: set up your school', role: 'School admin', icon: LayoutDashboard, poster: 'a-dash',
  blurb: 'From a new, empty school to a school with its structure, people and forms: the first things to enter.',
  clips: [
    ch('g-adm-1', 'Your new, empty school', LayoutDashboard, 'Start here: the menu, the dashboard and the guided tour.', [
      { shot: 'b-dashboard-empty', say: 'Welcome. This is your new school, empty and ready. Everything is set up from the menu on the left, and every number on the dashboard will grow as you add data.', caption: 'Everything starts from the menu on the left.', focus: [0, 40, 1440, 820] },
      { shot: 'r-next', say: 'A short guided tour shows each part. You can open it again any time from the Guide button, and switch to dark mode from the moon.', caption: 'A guided tour, any time, from the Guide button.', focus: [300, 120, 1100, 640] },
    ]),
    ch('g-adm-2', 'School settings', Settings, 'Campuses, branding and notifications.', [
      { shot: 'a-settings', say: 'First, Settings. Add your campuses, with their names and addresses. A school can have several branches, and each has its own timetable and staff.', caption: 'Settings: add your campuses.', focus: [292, 60, 1110, 500] },
      { shot: 'a-settings', say: 'The same page holds your logo and theme colour, your own web domain, notifications, and the audit log.', caption: 'Branding, domain, notifications and the audit log.', focus: [292, 130, 700, 70] },
    ]),
    ch('g-adm-3', 'Academic year and terms', CalendarDays, 'The session everything else hangs on.', [
      { shot: 'a-academics', say: 'Next, Academics. Everything starts with the academic year, and its terms.', caption: 'Academics → Years and Terms.', focus: [292, 60, 1110, 400] },
      { shot: 'b-year-form', say: 'Name the session, set its dates, and make it the current year.', caption: 'Name the session and make it current.', focus: [292, 160, 760, 360] },
      { shot: 'b-years', say: 'Add the terms. Exams, fees and reports all follow them.', caption: 'Add the terms.', focus: [292, 300, 760, 320] },
    ]),
    ch('g-adm-4', 'Classes, sections and subjects', GraduationCap, 'Build the structure of your school.', [
      { shot: 'b-class-form', say: 'Create each class with its level: grade one, grade two, and so on.', caption: 'Create each class with its level.', focus: [292, 160, 760, 360] },
      { shot: 'b-classes', say: 'Every class gets sections, each with a capacity and a campus.', caption: 'Sections, with capacity and campus.', focus: [292, 160, 1110, 380] },
      { shot: 'b-subjects', say: 'Then add the subjects with short codes, and your rooms. Now the structure of your school is ready.', caption: 'Subjects and rooms.', focus: [292, 330, 1110, 300] },
    ]),
    ch('g-adm-5', 'Staff and their logins', UserCog, 'Add people, and give each the right role.', [
      { shot: 'b-staff-empty', say: 'Now your staff. Only the administrator is here so far. Choose Add staff, or import a whole list from Excel.', caption: 'Staff → Add staff, or import from Excel.', focus: [292, 60, 1110, 340] },
      { shot: 'a-add-staff', say: 'Add their details, and a photo if you like. Choose the role: a teacher gets the teacher dashboard, an accountant gets accounts.', caption: 'Details, photo and role.', focus: [380, 20, 680, 760] },
      { shot: 'b-teacher-done', say: 'Their User I D and password are created instantly, and emailed to them. They must change the password at first sign in.', caption: 'Login created and emailed.', focus: [292, 100, 1110, 520] },
    ]),
    ch('g-adm-6', 'Who can do what', Crown, 'Principal, shared access, roles and suspending a login.', [
      { shot: 'a-users', say: 'Under Users and Access, give your principal access in one click. Just enter their name and email.', caption: 'Give your principal access in one click.', focus: [330, 50, 1060, 190], click: 'Add leadership access' },
      { shot: 'a-leader', say: 'A code verifies their email. Then their login and a strong one time password are emailed, and they must change it at first sign in.', caption: 'Email verified, login and password sent.', focus: [420, 30, 600, 650] },
      { shot: 'a-share', say: 'Need another administrator, or someone to cover while a colleague is busy? Share access, and tick exactly which areas that person may use. Settings, billing and logs are never shared.', caption: 'Share access, area by area.', focus: [330, 20, 700, 780] },
      { shot: 'a-user-roles', say: 'Roles can change any time. Open a person, tick the roles they need, and save. One person can be a teacher and an accountant at once.', caption: 'Change a person’s roles any time.', focus: [380, 220, 720, 400] },
      { shot: 'a-user-disable', say: 'If someone leaves, or access must stop for a while, disable the login. They are signed out at once, and you can enable it again later.', caption: 'Suspend a login, and restore it later.', focus: [380, 220, 720, 400] },
    ]),
    ch('g-adm-7', 'Your own forms', FileText, 'Add any field you need, by hand.', [
      { shot: 'a-forms', say: 'Every kind of person has a form: teachers, staff, students, parents, and access requests. Pick one, and design it yourself.', caption: 'A form for every kind of person.', focus: [292, 80, 1110, 520] },
      { shot: 'a-forms-fill', say: 'Press Add field. Choose the kind of answer: text, number, date, choices, or a document upload. Give it a label, and say whether it is required.', caption: 'Add a field: choose the type and label.', focus: [380, 20, 680, 480] },
      { shot: 'a-forms-listed', say: 'The field appears in your list, and in the live preview of the form, so you see exactly what people will see.', caption: 'It appears in the list and the preview.', focus: [292, 80, 1110, 640] },
      { shot: 'a-student-custom', say: 'Save the form, and the new field shows wherever that person is added or edited, such as the Add student window.', caption: 'Save: it shows wherever the person is added.', focus: [380, 20, 680, 780] },
    ]),
  ],
};

// --- 3. School administrator, part 2: run ----------------------------------------------------------
const ADMIN2: GuideVideo = {
  id: 'guide-admin2', title: 'The school administrator, part 2: run your school', role: 'School admin', icon: UserCog, poster: 'b-adm-enroll',
  blurb: 'Hiring, a child’s admission from start to finish, fees, timetable, exams, payroll, and what you control.',
  clips: [
    ch('g-ad2-1', 'Hiring, with a job post', UserPlus, 'Find a new teacher, online.', [
      { shot: 'b-hiring-empty', say: 'Need a new teacher? Open Staff, then Hiring, and choose New job post.', caption: 'Staff → Hiring → New job post.', focus: [292, 60, 1110, 340] },
      { shot: 'b-job-form', say: 'Add the title, the department, the closing date, and a short description, and set it to open.', caption: 'Title, department, closing date, description.', focus: [292, 120, 760, 480] },
      { shot: 'b-site-careers', say: 'The vacancy appears at once on your school’s website, under Careers. A candidate can apply online.', caption: 'It appears on your website under Careers.', focus: [292, 100, 1110, 520] },
      { shot: 'b-job-apply-form', say: 'They add a photo, contact details, qualification and experience, and send it.', caption: 'The candidate applies online.', focus: [380, 60, 680, 700] },
      { shot: 'b-interview-form', say: 'Back in Hiring, shortlist the candidate, and schedule the interview.', caption: 'Shortlist, then schedule the interview.', focus: [292, 100, 1110, 520] },
      { shot: 'b-candidate-selected', say: 'Record the interview score, choose the joining date, and hire. The new teacher joins your staff with a login of their own.', caption: 'Score, choose the date, and hire.', focus: [292, 100, 1110, 520] },
    ]),
    ch('g-ad2-2', 'A child’s admission, step by step', GraduationCap, 'From the parent’s application to an enrolled student.', [
      { shot: 'b-site', say: 'Admissions start on your school’s website. A parent chooses Apply now.', caption: 'The parent chooses “Apply now”.', focus: [292, 100, 1110, 520] },
      { shot: 'b-apply-form', say: 'They fill in the child’s details and the parent’s details, and send. Every field is checked, and required documents can be attached.', caption: 'The admission form: every field is checked.', focus: [380, 60, 680, 700] },
      { shot: 'b-apply-done', say: 'The family gets an application number and an email, so they can follow the result.', caption: 'The family gets an application number.', focus: [380, 120, 680, 500] },
      { shot: 'b-admissions', say: 'In Admissions, the new application is waiting, with a count for every step. Open it.', caption: 'Admissions: a new application is waiting.', focus: [292, 160, 1110, 420] },
      { shot: 'b-adm-document', say: 'Check the documents. Upload the birth certificate if the family brought it to the office, and mark each document verified.', caption: 'Check and verify the documents.', focus: [292, 160, 1110, 500] },
      { shot: 'b-adm-interview', say: 'Schedule an interview or entrance test, and record the score afterwards.', caption: 'Schedule an interview and record the score.', focus: [292, 160, 1110, 500] },
      { shot: 'b-adm-assessed', say: 'Move the application to review, then approve it, or decline it with a reason. The family is told by email.', caption: 'Review, then approve.', focus: [292, 160, 1110, 500] },
      { shot: 'b-adm-enroll', say: 'Choose the section, and enrol. The student record, the parent record, and both logins are created at once.', caption: 'Enrol: student, parent and logins at once.', focus: [292, 160, 1110, 480] },
      { shot: 'b-enrolled', say: 'The child is enrolled, with the full history of every step kept on the record.', caption: 'Enrolled, with the full history.', focus: [292, 40, 1110, 520] },
    ]),
    ch('g-ad2-3', 'Fees', Wallet, 'Structures, invoices, receipts and concessions.', [
      { shot: 'a-finance', say: 'In Finance, set a fee structure for each class: tuition, exam fees and more. The top shows collected, outstanding and overdue at a glance.', caption: 'Fee structures, and the money at a glance.', focus: [292, 60, 1110, 420] },
      { shot: 'ac-generate', say: 'Generate a month’s invoices for the whole school, in one click.', caption: 'Generate a month’s invoices in one click.', focus: [440, 80, 560, 700] },
      { shot: 'ac-discounts', say: 'Give concessions and scholarships, such as a sibling discount, with a clear record. Every payment gets a receipt, and parents are reminded before the due date.', caption: 'Concessions, receipts and reminders.', focus: [292, 330, 1110, 520] },
    ]),
    ch('g-ad2-4', 'Timetable and attendance', ClipboardCheck, 'Who teaches what, and who is where.', [
      { shot: 'a-timetable', say: 'Build the timetable for each section. Clashes are caught for you.', caption: 'A timetable for every section.', focus: [292, 160, 1110, 500] },
      { shot: 'a-live', say: 'Live Classes shows what is running right now, and what was missed.', caption: 'Live classes, right now.', focus: [292, 60, 1110, 500] },
      { shot: 'a-attendance', say: 'Staff check in from the campus with GPS. Check ins outside the campus area go to a review queue for you.', caption: 'GPS staff attendance, with a review queue.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-ad2-5', 'Exams, learning and payroll', BookOpen, 'Results, homework and salaries.', [
      { shot: 'a-exams', say: 'Create an exam, let teachers enter marks, then publish. Report cards and positions are built for you.', caption: 'Exams: marks, results and report cards.', focus: [292, 60, 1110, 420] },
      { shot: 'a-lms', say: 'Learning shows every course, with its material and assignments, so you can see that teaching is happening.', caption: 'Courses, material and assignments.', focus: [292, 60, 1110, 520] },
      { shot: 'a-payroll', say: 'Payroll runs every month, with approvals and payslips. When staff change their bank account, your accountant verifies it online first.', caption: 'Payroll, approvals and payslips.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-ad2-6', 'Messages, complaints and records', MessageSquare, 'Talk to everyone, and keep a record.', [
      { shot: 'a-communication', say: 'Send announcements to everyone, or only to the roles you choose.', caption: 'Announcements to chosen roles.', focus: [292, 60, 1110, 520] },
      { shot: 'a-complaint-open', say: 'Complaints from parents, students and staff reach you here. Answer them, and mark them resolved.', caption: 'Complaints: answer and resolve.', focus: [292, 300, 1110, 580] },
      { shot: 'a-activity', say: 'The activity log records every important change: who did what, and when.', caption: 'The activity log.', focus: [292, 60, 1110, 560] },
    ]),
    ch('g-ad2-7', 'Your plan', ShieldCheck, 'What you have, and when it renews.', [
      { shot: 'a-billing', say: 'Plans and billing shows your plan, and when it renews. If your school grows beyond it, we warn you first, with time to change. Nothing is ever deleted.', caption: 'Plans and billing.', focus: [292, 60, 1110, 560] },
    ]),
  ],
};

// --- 4. Principal ----------------------------------------------------------------------------------
const PRINCIPAL: GuideVideo = {
  id: 'guide-principal', title: 'The principal', role: 'Principal', icon: Crown, poster: 'p-dash',
  blurb: 'The whole school from above: approvals, admissions, staff, growth and complaints.',
  clips: [
    ch('g-prn-1', 'Your dashboard and approvals', LayoutDashboard, 'The whole school from above.', [
      { shot: 'p-dash', say: 'The principal sees the whole school from above. Approvals waiting come first, then the headline figures.', caption: 'Approvals first, then the headline figures.', focus: [292, 60, 1110, 580] },
      { shot: 'p-leave-approve', say: 'Leave requests wait here. Open one, then approve or decline, with a note. The person is told at once.', caption: 'Approve or decline leave.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-prn-2', 'Watch the school', ClipboardCheck, 'Attendance, students, staff, admissions, exams and fees.', [
      { shot: 'p-attendance', say: 'See staff attendance, and who has checked in from the campus.', caption: 'Attendance and check-ins.', focus: [292, 60, 1110, 520] },
      { shot: 'p-students', say: 'Students: their profiles, classes and records, all in one list.', caption: 'Students and their records.', focus: [292, 60, 1110, 560] },
      { shot: 'p-staff', say: 'Staff: add and edit staff records, and see who teaches what.', caption: 'Staff records.', focus: [292, 60, 1110, 560] },
      { shot: 'p-admissions', say: 'Admissions: open an application, check the documents, and approve or decline it.', caption: 'Admissions: approve or decline.', focus: [292, 60, 1110, 560] },
      { shot: 'p-exams', say: 'Exams and results, once teachers have entered and published them.', caption: 'Exams and results.', focus: [292, 60, 1110, 420] },
      { shot: 'p-finance', say: 'And fees: collected, outstanding and overdue, so you always know where the school stands.', caption: 'Fees at a glance.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-prn-3', 'Growth, complaints and forms', UsersRound, 'A clear picture, and a safe way to speak up.', [
      { shot: 'p-growth', say: 'The growth report shows fees collected, salaries paid, and what families still owe, as a clear chart, by month or by year.', caption: 'The growth report.', focus: [340, 50, 1040, 320] },
      { shot: 'p-complaints', say: 'Complaints reach you here. Read them, answer, and mark them resolved.', caption: 'Complaints: read, answer, resolve.', focus: [330, 400, 1060, 240] },
      { shot: 'p-forms', say: 'Principals can edit the registration forms too, adding any field a form needs.', caption: 'Edit the registration forms.', focus: [292, 80, 1110, 520] },
      { shot: 'p-activity', say: 'And the activity log records every important change: who, what, and when.', caption: 'Every important change is logged.', focus: [292, 60, 1110, 560] },
    ]),
    ch('g-prn-4', 'When you are busy', Crown, 'Access is managed by your administrator.', [
      { shot: 'a-leader', say: 'Busy, or away? Ask your administrator to give a vice principal or director access, on paid plans. Approvals then reach them too, and they can decide in your place.', caption: 'A vice principal or director can cover for you.', focus: [420, 30, 600, 650] },
      { shot: 'a-user-disable', say: 'Your administrator also manages logins. If anyone’s access must stop, they can suspend it at once, and restore it later.', caption: 'The administrator can suspend a login.', focus: [380, 220, 720, 400] },
    ]),
  ],
};

// --- 5. Teacher ----------------------------------------------------------------------------------
const TEACHER: GuideVideo = {
  id: 'guide-teacher', title: 'The teacher', role: 'Teacher', icon: GraduationCap, poster: 't-dash',
  blurb: 'Classes, attendance, learning, marks, messages, leave, and your salary account.',
  clips: [
    ch('g-tch-1', 'Your day', LayoutDashboard, 'Today’s classes, check-in and leave.', [
      { shot: 't-dash', say: 'Your dashboard shows today’s classes, your leave balance, and your latest payslip.', caption: 'Today’s classes, leave and payslip.', focus: [292, 60, 1110, 640] },
      { shot: 't-dash', say: 'When you reach the campus, check in. Your attendance goes straight to payroll.', caption: 'Check in on campus.', focus: [1000, 280, 400, 160], click: 'Check in' },
    ]),
    ch('g-tch-2', 'Start a class, take attendance', ClipboardCheck, 'Run each period from your phone or laptop.', [
      { shot: 't-today', say: 'Open Today’s Classes, and press Start class when the period begins.', caption: 'Press “Start class”.', focus: [292, 60, 1110, 420], click: 'Start class' },
      { shot: 't-start', say: 'The class is now live, and everyone can see it. Open Class Attendance to mark the register.', caption: 'The class is live.', focus: [292, 60, 1110, 520] },
      { shot: 't-attend-register', say: 'Mark each student present, absent or late, and save. Parents of absent children are told, and you end the class when you finish.', caption: 'Mark each student, then end the class.', focus: [292, 60, 1110, 620] },
    ]),
    ch('g-tch-3', 'Learning: material and assignments', BookOpen, 'Your courses, online.', [
      { shot: 't-lms', say: 'Open Learning. Your courses are listed here, one for each subject and class you teach.', caption: 'Learning: your courses.', focus: [292, 60, 1110, 420] },
      { shot: 't-lms-course', say: 'Open a course to see its material and its assignments, and what students have handed in.', caption: 'A course: material and assignments.', focus: [292, 60, 1110, 560] },
      { shot: 't-assign-new', say: 'Choose New assignment. Add a title, instructions, the due date, and the marks it is out of.', caption: 'New assignment: title, due date, marks.', focus: [420, 30, 620, 780] },
      { shot: 't-material-new', say: 'Share notes, worksheets, videos or links as learning material, and publish it when it is ready. Students see it at once.', caption: 'Share notes, worksheets and links.', focus: [420, 30, 620, 780] },
    ]),
    ch('g-tch-4', 'Marks and results', GraduationCap, 'Enter marks once.', [
      { shot: 't-marks', say: 'Open Exams and Marks, and choose the exam.', caption: 'Choose the exam.', focus: [292, 60, 1110, 330] },
      { shot: 't-marks-entry', say: 'Type the marks for each student. Mistakes are flagged, and results and report cards are worked out for you.', caption: 'Enter the marks.', focus: [292, 60, 1110, 600] },
    ]),
    ch('g-tch-5', 'Parents, messages and concerns', MessageSquare, 'Talk to parents directly, and raise a concern.', [
      { shot: 't-msg-new', say: 'Message parents directly. Choose the student, write a subject and your message, and send. Replies come back in the same conversation.', caption: 'Message a student’s parents.', focus: [420, 200, 620, 460] },
      { shot: 't-complaint-new', say: 'Need to raise a concern? Send it to the principal, to a teacher, or to the parents of a student or a whole class. You may stay anonymous.', caption: 'Raise a concern safely.', focus: [420, 40, 610, 810] },
    ]),
    ch('g-tch-6', 'Leave', Users, 'Apply, and follow the answer.', [
      { shot: 't-leave-filled', say: 'To apply for leave, choose the type, the dates, and write a reason. Your balance is shown above.', caption: 'Choose the type, dates and a reason.', focus: [292, 60, 1110, 520] },
      { shot: 't-leave-sent', say: 'Send it. The principal and administrator are told, and you are told the moment they approve or decline.', caption: 'Sent: you are told the answer.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-tch-7', 'Salary and your bank account', Wallet, 'Changing the account your salary goes to.', [
      { shot: 't-payslips', say: 'Your payslips are here, with the bank account your salary is paid into.', caption: 'Payslips and your salary account.', focus: [292, 60, 1110, 520] },
      { shot: 't-bank-form', say: 'Changed your bank? Press Add account, enter the bank, the account title and the number, and say why.', caption: 'Enter the new bank account.', focus: [420, 100, 620, 640] },
      { shot: 't-bank-pending', say: 'It is sent to the Accounts office as a request. Until it is approved, your salary still goes to the old account.', caption: 'Sent to Accounts as a request.', focus: [292, 60, 1110, 520] },
      { shot: 'ac-notify2', say: 'The accountant is told online, the moment you send it, and checks the details.', caption: 'Accounts is told online.', focus: [900, 20, 520, 480] },
      { shot: 'ac-bank-review', say: 'Once approved, you are told too, and your next salary goes to the new account.', caption: 'Approved: your next salary goes there.', focus: [380, 220, 720, 360] },
    ]),
  ],
};

// --- 6. Accountant -------------------------------------------------------------------------------
const ACCOUNTS: GuideVideo = {
  id: 'guide-accounts', title: 'The accountant', role: 'Accounts', icon: Banknote, poster: 'ac-dash',
  blurb: 'Fee structures, invoices, payments, concessions, bank accounts and payroll.',
  clips: [
    ch('g-acc-1', 'Your dashboard', LayoutDashboard, 'The money at a glance.', [
      { shot: 'ac-dash', say: 'The accountant sees what is collected, what is outstanding, and who is overdue, right on the dashboard.', caption: 'Collected, outstanding, overdue.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-acc-2', 'Fee structures and invoices', Wallet, 'Set the fees, then invoice everyone.', [
      { shot: 'ac-structures', say: 'Set the fee structure for each class: tuition, exam fees, and any other charge.', caption: 'Fee structures for each class.', focus: [292, 60, 1110, 520] },
      { shot: 'ac-generate', say: 'Then generate a month’s invoices for the whole school, in one click.', caption: 'Generate invoices in one click.', focus: [440, 80, 560, 700] },
    ]),
    ch('g-acc-3', 'Payments and follow-up', Banknote, 'Record every payment.', [
      { shot: 'ac-record', say: 'Record each payment, whether cash, bank, card or online, and print the receipt for the family.', caption: 'Record a payment, print the receipt.', focus: [440, 60, 560, 740] },
      { shot: 'ac-pending', say: 'Pending and overdue fees are listed separately, so you know whom to follow up. Reminders also go out automatically.', caption: 'Pending and overdue fees.', focus: [292, 60, 1110, 520] },
      { shot: 'ac-discounts', say: 'Give concessions and scholarships, such as sibling discounts, with a clear record of who received what.', caption: 'Concessions and scholarships.', focus: [292, 330, 1110, 520] },
    ]),
    ch('g-acc-4', 'Staff bank accounts', Users, 'Verify a change before any salary is paid.', [
      { shot: 'ac-notify2', say: 'When a staff member changes their bank account, you are told online at once, in your notifications.', caption: 'You are notified online.', focus: [900, 20, 520, 480] },
      { shot: 'ac-bank-list2', say: 'Open Staff Payroll, then Bank Accounts. Every request waiting for you is listed, with the old and the new account.', caption: 'Requests waiting, with old and new account.', focus: [292, 330, 1110, 480] },
      { shot: 'ac-bank-review', say: 'Check the details with the staff member if you need to, then approve, or reject with a note.', caption: 'Approve or reject.', focus: [380, 220, 720, 360] },
      { shot: 'ac-bank-approved', say: 'Once approved, the next payroll run pays the salary into the new account, and the staff member is told.', caption: 'The next salary goes to the new account.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-acc-5', 'Payroll and reports', Users, 'Salaries, payslips and reports.', [
      { shot: 'ac-payroll', say: 'Payroll starts with each staff member’s salary structure.', caption: 'Salary structures.', focus: [292, 60, 1110, 520] },
      { shot: 'ac-salary', say: 'Each month, run payroll. The principal approves, and payslips are issued.', caption: 'Monthly payroll runs.', focus: [292, 60, 1110, 520] },
      { shot: 'ac-reports', say: 'Financial reports show the whole picture, and every list can be exported to Excel.', caption: 'Financial reports and exports.', focus: [292, 60, 1110, 520] },
    ]),
  ],
};

// --- 7. Student ----------------------------------------------------------------------------------
const STUDENT: GuideVideo = {
  id: 'guide-student', title: 'The student', role: 'Student', icon: UserCheck, poster: 's-dash',
  blurb: 'Timetable, homework, results, fees, and online document requests.',
  clips: [
    ch('g-stu-1', 'Your dashboard', LayoutDashboard, 'Your day at a glance.', [
      { shot: 's-dash', say: 'Students see their next class, homework to hand in, and fees at a glance.', caption: 'Next class, homework and fees.', focus: [292, 60, 1110, 620] },
      { shot: 's-profile', say: 'My Profile shows your details and your parents’ details. If something is wrong, ask the office to correct it.', caption: 'Your profile.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-stu-2', 'Classes and timetable', CalendarDays, 'Where to be, and when.', [
      { shot: 's-timetable', say: 'Your weekly timetable shows every period, with the teacher and the room.', caption: 'Your weekly timetable.', focus: [292, 190, 1110, 480] },
      { shot: 's-attendance', say: 'Attendance shows how often you were present, so you can stay on track.', caption: 'Your attendance.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-stu-3', 'Homework and learning', BookOpen, 'Study material and assignments.', [
      { shot: 's-material', say: 'Learning Material has notes, worksheets and links from your teachers, by subject.', caption: 'Notes and worksheets.', focus: [292, 60, 1110, 420] },
      { shot: 's-assignments', say: 'Assignments shows what is to do, what you handed in, and your grades. Open one to upload your answer.', caption: 'Homework: to do, handed in, graded.', focus: [292, 100, 1110, 520] },
    ]),
    ch('g-stu-4', 'Exams, results and fees', ClipboardCheck, 'See how you are doing.', [
      { shot: 's-exams', say: 'Exams lists the exams, and once published, your results with position and pass status.', caption: 'Exams and results.', focus: [292, 60, 1110, 420] },
      { shot: 's-fees', say: 'Fees shows what is paid and what is due, with receipts.', caption: 'Fees and receipts.', focus: [292, 60, 1110, 520] },
    ]),
    ch('g-stu-5', 'Documents, online', FileText, 'Marksheets, certificates and more, without queuing.', [
      { shot: 's-request-form', say: 'Need a marksheet, a bonafide certificate, or a school leaving certificate? Open Document Requests, and choose New request.', caption: 'Document Requests → New request.', focus: [380, 100, 700, 640] },
      { shot: 's-request-form', say: 'Choose the document, say what it is for, how many copies you need, and whether you will collect it or have a digital copy.', caption: 'Choose the document, purpose and copies.', focus: [380, 100, 700, 640] },
      { shot: 's-request-sent', say: 'Send it, and follow each step: submitted, in process, ready. You are told when it is issued, and can download it here.', caption: 'Follow it step by step, then download.', focus: [292, 60, 1110, 560] },
      { shot: 's-complaints', say: 'And if something is wrong, tell the school. You can stay anonymous if you want.', caption: 'Raise a concern, anonymously if you wish.', focus: [292, 60, 1110, 300], click: 'Raise a complaint' },
    ]),
  ],
};

// --- 8. Parent -----------------------------------------------------------------------------------
const PARENT: GuideVideo = {
  id: 'guide-parent', title: 'The parent', role: 'Parent', icon: UsersRound, poster: 'm-p-dash', phone: true,
  blurb: 'Every child, every fee and every result, right on your phone.',
  clips: [
    ch('g-par-1', 'Your children', Users, 'All your children in one place.', [
      { shot: 'm-p-dash', say: 'Parents sign in on their phone, and see every child in one place.', caption: 'Every child in one place.', focus: [10, 150, 370, 620] },
      { shot: 'm-p-children', say: 'Open My Children, and choose a child.', caption: 'My Children.', focus: [10, 60, 370, 440] },
      { shot: 'm-p-child', say: 'Each child has a profile, with class, attendance, fees and results.', caption: 'A child’s profile.', focus: [10, 60, 370, 700] },
    ]),
    ch('g-par-2', 'School days', CalendarDays, 'Attendance, timetable and homework.', [
      { shot: 'm-p-attendance', say: 'Attendance shows every day your child was present or absent, and you are told if your child is marked absent.', caption: 'Attendance.', focus: [10, 60, 370, 600] },
      { shot: 'm-p-timetable', say: 'The timetable shows each period, the teacher, and the room.', caption: 'The timetable.', focus: [10, 60, 370, 600] },
      { shot: 'm-p-homework', say: 'Homework lists what is due, and what has been handed in.', caption: 'Homework.', focus: [10, 60, 370, 600] },
    ]),
    ch('g-par-3', 'Results and fees', Wallet, 'Always up to date.', [
      { shot: 'm-p-results', say: 'Results and report cards appear as soon as the school publishes them.', caption: 'Results and report cards.', focus: [10, 80, 370, 400] },
      { shot: 'm-p-fees', say: 'Fees shows every invoice, what is paid, and what is due. You are reminded before the due date.', caption: 'Fees.', focus: [10, 80, 370, 520] },
      { shot: 'm-p-receipts', say: 'Every payment has a receipt you can keep.', caption: 'Receipts.', focus: [10, 60, 370, 600] },
    ]),
    ch('g-par-4', 'Talk to the school', MessageSquare, 'Messages, documents and complaints.', [
      { shot: 'm-p-messages', say: 'Message your child’s teachers directly, in a private conversation.', caption: 'Message the teachers.', focus: [10, 60, 370, 500] },
      { shot: 'm-p-documents', say: 'Documents holds your child’s certificates and records, and you can request new ones online, such as a marksheet or a bonafide certificate.', caption: 'Documents and online requests.', focus: [10, 60, 370, 600] },
      { shot: 'm-p-complaint-new', say: 'And if something is wrong, raise it privately, even anonymously.', caption: 'Raise a complaint, even anonymously.', focus: [10, 60, 370, 740] },
    ]),
  ],
};

export const GUIDES: GuideVideo[] = [REGISTER, ADMIN, ADMIN2, PRINCIPAL, TEACHER, ACCOUNTS, STUDENT, PARENT];
export const guideById = (id: string) => GUIDES.find((g) => g.id === id);
