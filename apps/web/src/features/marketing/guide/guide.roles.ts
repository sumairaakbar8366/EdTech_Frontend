import { Banknote, Crown, GraduationCap, LayoutDashboard, ShieldCheck, Sparkles, UserCheck, UserPlus, UsersRound, type LucideIcon } from 'lucide-react';
import type { GuideStep } from '@/features/marketing/guide/guide.content';

/**
 * The written user guide, by role: who you are first, then the steps for your job, in plain words.
 * The same story as the role videos (video/guides.ts); `video` is the guide video that goes with it.
 */
export interface RoleGuide {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Who this part is for. */
  who: string;
  summary: string;
  /** The role video it goes with (see video/guides.ts). */
  video?: string;
  steps: GuideStep[];
}

export const ROLE_GUIDES: RoleGuide[] = [
  {
    id: 'register', title: 'Register your school', icon: UserPlus, who: 'The school owner or head', video: 'guide-register',
    summary: 'Only genuine, registered schools join. You apply online; our team checks your details by hand; then your school is created and your login arrives by email.',
    steps: [
      { title: 'Open the website and choose Register', where: 'Main website → Register', text: 'Search for Skool EdTech and open our website, then choose “Register”. The application has four short steps and takes a few minutes.' },
      { title: 'Verify your email and your mobile number', text: 'Use Google, or type your email and press “Send code”. Enter the 6-digit code from your inbox. Then enter your mobile number and the code we send to your WhatsApp. Both must be verified before you can continue.', tips: ['Use an email address you check every day: your User ID and password will be sent to it.'] },
      { title: 'Tell us about you', text: 'Your first and last name, your role at the school (Owner, Director, Principal or Administrator) and your CNIC. The CNIC is kept encrypted, and is erased once your application is decided.' },
      { title: 'Tell us about your school', text: 'The school’s registered name, its type, registration number, NTN, country, province, city (start typing and pick it from the list), full address, and how many students, teachers and other staff you have.' },
      { title: 'Review and submit', text: 'Check the summary, tick the declaration, and press “Submit application”. You will see a reference number and receive it by email.', tips: ['The same CNIC, NTN, email, or school name in the same city cannot be used for two applications.'] },
      { title: 'Wait for our team to verify you', text: 'Our team checks your CNIC, NTN and school by hand and may call you. This usually takes a few working days. Nothing is created until the application is approved.' },
      { title: 'Sign in for the first time', where: 'The sign-in page', text: 'When your application is approved, your school is created with a free trial sized to your school, and your User ID and a temporary password are emailed to you. Sign in, and choose your own new password before anything else. Then a short guided tour begins.', tips: ['If your application is declined, the email tells you why, and you may apply again with correct details.'] },
    ],
  },
  {
    id: 'admin', title: 'The school administrator: set up your school', icon: LayoutDashboard, who: 'The administrator (the person who registered, and anyone given the Administrator role)', video: 'guide-admin',
    summary: 'You start with a new, empty school. Do the steps below in order: each one prepares the next. The administrator controls everything in the school except what the owner’s team controls (plans and verification).',
    steps: [
      { title: '1. Look around, and take the tour', where: 'Dashboard → Guide', text: 'The menu on the left holds every part of the school. A guided tour explains it; open it again any time from the Guide button at the top.' },
      { title: '2. School settings', where: 'Settings', text: 'Add your campuses (a main campus is created for you; add branches if you have them), your logo and theme colour under Branding, notification settings, and your own domain if your plan includes it.' },
      { title: '3. Academic year and terms', where: 'Academics → Years & Terms', text: 'Add the academic year (for example 2026–2027), set its dates, make it the current year, and add its terms. Exams, fees and reports follow them.' },
      { title: '4. Classes, sections, subjects and rooms', where: 'Academics → Classes & Sections / Subjects / Rooms', text: 'Create each class with its level (Grade 1, Grade 2…). Give every class its sections, with a capacity and a campus. Then add subjects with short codes, and your rooms.', tips: ['A class needs at least one section before students can be enrolled.'] },
      { title: '5. Staff, and their logins', where: 'Staff → Add staff', text: 'Add each person’s details and photo, and choose their role: a teacher gets the teacher dashboard, an accountant gets Accounts. A User ID and a temporary password are created at once and emailed to them. They must choose their own password at first sign-in.', tips: ['Already have staff in Excel? Use Import. Need to hire? Use Staff → Hiring: the vacancy appears on your website.'] },
      { title: '6. Give your principal access', where: 'Users & Access → Principal & leadership', text: 'Press “Give principal access”, enter their name and email, and send a 6-digit code to that email. Type the code they read to you. Their User ID and a strong one-time password are then emailed to them, and they must change it at first sign-in.', tips: ['On paid plans you can add directors, vice principals, coordinators and your own titles, and choose which parts of the dashboard each one sees. You can change this any time.'] },
      { title: '7. Suspend, restore or change a login', where: 'Users & Access → the list of logins', text: 'Find the person in the list. Use “Edit roles” to tick the roles they need (one person can be a teacher and an accountant), “Reset password” to issue new sign-in details, and “Disable login” when someone leaves or access must stop for a while: they are signed out at once, and you can enable the login again later. Nothing the person did is deleted.' },
      { title: '8. Share administrator access (optional)', where: 'Users & Access → Shared access', text: 'Need a second administrator? Share access, and choose exactly which areas the person may use. They appear as “Admin 2”, “Admin 3”, and everything they do is logged under their own login. Settings, billing, Users & Access and the logs are never shared.' },
      { title: '9. Admissions and students', where: 'Admissions, Students', text: 'A child’s admission, step by step: (1) the parent opens your school website and chooses “Apply now”, then fills in the child’s and the parent’s details and sends it; (2) the family gets an application number and an email; (3) in Admissions you open the application, check and verify the documents (you can upload them if the family brings them to the office); (4) schedule an interview or entrance test and record the score; (5) move the application to review, then approve it, or decline it with a reason; (6) choose the section and enrol: the student record, the parent record and both logins are created at once. You can also add students directly, import them from Excel, and promote a class to the next year.', tips: ['Online admissions say “closed”? Check Website → Switches, and that a current academic year exists.'] },
      { title: '10. Fees', where: 'Finance → Fee structures, Invoices', text: 'Set a fee structure for each class (tuition, exam fee…), add concessions if you give any, then press “Generate” to create a month’s invoices for the whole school. Collected, outstanding and overdue amounts are shown at the top, and parents are reminded automatically.' },
      { title: '11. Timetable, attendance and live classes', where: 'Timetable, Attendance, Live Classes', text: 'Build the timetable for each section; clashes are caught for you. Live Classes shows what is running right now and what was missed. Staff check in from the campus with GPS; check-ins outside the campus area go to a review queue.' },
      { title: '12. Exams and learning', where: 'Exams & Results, LMS', text: 'Create an exam; teachers enter marks; you publish. Report cards and positions are built for you. In Learning, courses, material and assignments are shared with students.', tips: ['Exams, Learning and Payroll are included in the Growth plan and above.'] },
      { title: '13. Payroll', where: 'Payroll', text: 'Set each person’s salary structure, run payroll every month, have it approved, and payslips are issued. Staff add their own bank account, and finance verifies it.' },
      { title: '14. Hiring, with a job post', where: 'Staff → Hiring', text: 'Press “New job post”, add the title, department, campus, number of openings and a closing date, describe the job, and set it to Open. It appears at once on your school website under Careers, where candidates apply online with a photo, qualifications and experience. In Hiring you shortlist, schedule the interview, record the score, and hire: the new teacher joins your staff with a login of their own.' },
      { title: '15. Announcements, forms and your website', where: 'Communication, Forms, Website', text: 'Send announcements to everyone or to chosen roles. Design the teacher, staff, student, parent and access forms yourself: open Forms, pick the person, press “Add field”, choose the kind of answer (text, number, date, choices, yes/no or a document upload), give it a label, and say whether it is required. It shows in the live preview, and after you save it appears wherever that person is added or edited. Edit your public website: texts, photos, the principal’s message, careers, and events.' },
      { title: '16. What you control', where: 'Users & Access, Activity, Complaints, Plans & Billing', text: 'You create logins, change roles, reset passwords and disable anyone. The Activity log records every important change: who, what and when. Complaints sent to the administrator reach you; answer them and mark them resolved. Plans & Billing shows your plan and when it renews.', tips: ['If your school grows beyond its plan (students, staff or stored files), you are warned at 80%, and have 14 days to change plan before access is paused. Nothing is ever deleted, and paying unlocks everything at once.'] },
    ],
  },
  {
    id: 'principal', title: 'The principal', icon: Crown, who: 'The principal, and directors and vice principals on paid plans', video: 'guide-principal',
    summary: 'You see the whole school from above, approve what needs approval, and know how the school is doing.',
    steps: [
      { title: 'Sign in and choose a password', text: 'Your administrator gives you access: you receive an email with your User ID and a one-time password. Sign in, and choose your own password first.' },
      { title: 'Your dashboard', where: 'Dashboard', text: 'Approvals waiting come first, then the headline figures, what changed this week, people, admissions, fees and payroll. If you are a director or vice principal, a bar at the top lists the parts of the dashboard you see.' },
      { title: 'Approve requests', text: 'Leave requests, payroll runs and other requests wait for you. Open one, then approve or decline, with a note.' },
      { title: 'Watch the school', where: 'Attendance, Students, Exams & Results, Finance', text: 'See staff attendance, students and their records, published results, and fees: collected, outstanding and overdue.' },
      { title: 'The growth report', where: 'Dashboard → School growth', text: 'A chart shows fees collected, salaries paid, and what families still owe, by month or by year. Open “Full report” for more.' },
      { title: 'Complaints', where: 'Dashboard → Complaints, Complaints', text: 'Complaints sent to the principal reach you here, with filters and search. Read, reply, start a review, and mark resolved, with an optional message to the person.' },
      { title: 'The activity log', where: 'Activity', text: 'Every important change is recorded: who did what, and when.' },
      { title: 'Admissions, staff and forms', where: 'Admissions, Staff, Forms', text: 'You can open admission applications and approve or decline them, edit staff records, and edit the registration forms, adding any field a form needs.' },
      { title: 'When you are busy', text: 'Access to the system is managed by the administrator. If you are busy or away, ask them to give a vice principal or director access (paid plans): approvals then reach them too, and they can decide in your place. If anyone’s access must stop, the administrator can disable the login at once and restore it later.' },
    ],
  },
  {
    id: 'teacher', title: 'The teacher', icon: GraduationCap, who: 'Teachers', video: 'guide-teacher',
    summary: 'Your classes, attendance, marks, homework and messages, in one place.',
    steps: [
      { title: 'Sign in and choose a password', text: 'When you are added as staff, your User ID and a one-time password are emailed to you. Sign in, and choose your own password first.' },
      { title: 'Your day', where: 'Dashboard', text: 'Today’s classes, your leave balance and your latest payslip. Press “Check in” when you reach the campus: your attendance goes straight to payroll.' },
      { title: 'Start a class and take attendance', where: 'Today’s Classes → Start class, Class Attendance', text: 'When the period begins, press “Start class”: the class is live and everyone can see it. Open Class Attendance, mark each student present, absent or late, and save; parents of absent children are told. End the class when you finish.' },
      { title: 'Learning: material and assignments', where: 'Learning (LMS)', text: 'Open Learning to see your courses, one for each subject and class you teach. Open a course to see its material and assignments. Press “New assignment” to add a title, instructions, a due date and the marks; add material (notes, worksheets, videos, links) and publish it. Students see it at once, hand in online, and you grade it.' },
      { title: 'Enter marks', where: 'Exams / Marks', text: 'Choose the exam, then type the marks for each student. Mistakes are flagged; results, positions and report cards are worked out for you once published.' },
      { title: 'Homework and learning material', where: 'Assignments, Learning Material', text: 'Create assignments with due dates, grade what students hand in, and share notes, worksheets and links for each subject and class.' },
      { title: 'Your students and their performance', where: 'My Students, Student Performance', text: 'See everyone you teach, and their marks and report cards.' },
      { title: 'Message parents', where: 'Messages → New message', text: 'Choose the student, write a subject and your message, and send. The parents reply in the same private conversation.' },
      { title: 'Raise a concern', where: 'Complaints → Raise a complaint', text: 'Choose who it goes to: the principal and administrator, a teacher, the parents of a student, or the parents of a whole class. You may stay anonymous.' },
      { title: 'Apply for leave', where: 'Leave', text: 'Choose the type, the dates and write a reason, then send. The principal and administrator are told; you are told the moment it is approved or declined.' },
      { title: 'Payslips and your bank account', where: 'Salary / Payslips → Add account', text: 'Your payslips are kept here, with the account your salary is paid into. Changed your bank? Press “Add account”, enter the bank, account title and number, and why. It goes to the Accounts office as a request, and the accountant is told online at once. Until it is approved your salary goes to the old account; when it is approved you are told, and your next salary goes to the new one.' },
    ],
  },
  {
    id: 'accounts', title: 'The accountant', icon: Banknote, who: 'Accounts staff', video: 'guide-accounts',
    summary: 'Fee structures, invoices, payments, concessions, payroll and reports, without spreadsheets.',
    steps: [
      { title: 'Sign in and choose a password', text: 'Your administrator creates your login; you receive your User ID and a one-time password by email and choose your own at first sign-in.' },
      { title: 'Your dashboard', where: 'Dashboard', text: 'This month’s collection, overdue invoices to follow up, recent payments and payroll status.' },
      { title: 'Fee structures', where: 'Fee Structures', text: 'Set the fees for each class: tuition, exam fees, and any other charge.' },
      { title: 'Generate invoices', where: 'Student Invoices → Generate', text: 'Choose the class (or all), the billing period and due date, and generate a month’s invoices for the whole school in one go.' },
      { title: 'Record payments', where: 'Payments → Record payment', text: 'Record each payment: cash, bank, card or online. A receipt is created for the family to print or download.' },
      { title: 'Pending and overdue fees', where: 'Pending Fees, Overdue Fees', text: 'See who still owes what. Reminders go to families automatically; you can follow up personally.' },
      { title: 'Concessions and scholarships', where: 'Discounts / Scholarships', text: 'Give discounts such as a sibling concession or a merit scholarship, with a clear record of who received what.' },
      { title: 'Staff bank accounts', where: 'Staff Payroll → Bank Accounts', text: 'When a staff member changes their bank account you are told online at once. Open Bank Accounts, check the request waiting (the new account and the old one), and approve it, or reject it with a note. The staff member is told, and the next payroll run pays into the approved account.' },
      { title: 'Payroll', where: 'Staff Payroll, Salary Processing, Payslips', text: 'Keep salary structures, run payroll each month, and issue payslips. The principal approves each run.' },
      { title: 'Reports', where: 'Financial Reports', text: 'See the whole picture and export it.' },
    ],
  },
  {
    id: 'student', title: 'The student', icon: UserCheck, who: 'Students', video: 'guide-student',
    summary: 'Your timetable, homework, results and fees.',
    steps: [
      { title: 'Sign in', text: 'You receive a User ID and a temporary password from your school. Sign in and choose your own password first.' },
      { title: 'Your dashboard', where: 'Dashboard', text: 'Your next class, homework to hand in, and your fees at a glance.' },
      { title: 'Timetable and attendance', where: 'Timetable, Attendance', text: 'Every period with its teacher and room, and how often you were present.' },
      { title: 'Learning material and assignments', where: 'Learning Material, Assignments', text: 'Notes and worksheets from your teachers; homework to do, handed in and graded.' },
      { title: 'Exams and results', where: 'Exams, Results', text: 'The exams, and once published, your results with position and pass status.' },
      { title: 'Fees', where: 'Fees', text: 'What is paid and what is due, with receipts.' },
      { title: 'Request documents online', where: 'Document Requests → New request', text: 'Need a marksheet, a bonafide certificate or a school leaving certificate? Press “New request”, choose the document, say what it is for and how many copies you need, and whether you will collect it or have a digital copy. Send it, and follow each step: submitted, in process, ready. You are told when it is issued, and can download it there. The same works for parents, for each child.' },
      { title: 'Raise a concern', where: 'Complaints', text: 'If something is wrong, tell the school. You can stay anonymous.' },
    ],
  },
  {
    id: 'parent', title: 'The parent', icon: UsersRound, who: 'Parents and guardians', video: 'guide-parent',
    summary: 'Every child, every fee and every result, right on your phone.',
    steps: [
      { title: 'Sign in', text: 'When your child is enrolled, your User ID and a temporary password are emailed to you. Sign in on your phone, and choose your own password first.' },
      { title: 'My children', where: 'My Children', text: 'All your children at the school in one place. Open one to see class, attendance, fees and results.' },
      { title: 'Attendance, timetable and homework', where: 'Attendance, Timetable, Homework', text: 'Every day present or absent, every period, and what is due or handed in.' },
      { title: 'Results', where: 'Results', text: 'Published results and report cards appear as soon as the school shares them.' },
      { title: 'Fees and receipts', where: 'Fees, Receipts', text: 'Every invoice, what is paid and what is due, and a receipt for every payment. You are reminded before a fee is due.' },
      { title: 'Messages', where: 'Teacher Communication', text: 'Message your child’s teachers in a private conversation.' },
      { title: 'Documents and complaints', where: 'Documents, Document Requests, Complaints', text: 'Certificates and records, and online requests for new ones. If something is wrong, raise a complaint: you may stay anonymous.' },
    ],
  },
  {
    id: 'special', title: 'Special features', icon: Sparkles, who: 'Administrators, principals, accountants and the owner’s team',
    summary: 'What makes the product different, and where to find it.',
    steps: [
      { title: 'Scholarships and sponsors', where: 'Scholarship Candidates (admin), Scholarships (accounts)', text: 'Sponsors fund scholarships. When a sponsor’s offer reaches your school, you see only the students who qualify, found from your live marks, attendance and fee records: merit from results and attendance, need from fee concessions and overdue fees. Pick the top students, add a note, and confirm. Nothing is shared with the sponsor until you confirm. Cycles can be yearly or by semester, for grades 9 to 12 and undergraduate studies.' },
      { title: 'Complaints, handled safely', where: 'Complaints', text: 'Anyone can raise a complaint, anonymously if they wish: handlers then see only the kind of person, never the name. The sender chooses who hears it: management, a teacher, the parents of a student, or the parents of a class. Handlers use filters and search, reply, and mark it resolved with an optional message. The principal’s dashboard shows what is still open.' },
      { title: 'Your own forms', where: 'Forms', text: 'The teacher, staff, student, parent and access forms are yours to shape. Add fields: text, number, date, email, phone, choices, yes/no, or a document upload; group them in sections; mark them required. They appear wherever that person is added or edited.' },
      { title: 'Principal, director and vice principal', where: 'Users & Access → Principal & leadership', text: 'Give the principal a login in one step. On paid plans add directors, vice principals, coordinators and other titles. Each uses the principal’s dashboard, and the administrator chooses which parts it shows.' },
      { title: 'The growth report', where: 'Dashboard → School growth', text: 'Fees collected, salaries paid and what families owe, in a clear chart, by month or by year. Not part of the free trial.' },
      { title: 'Your own school website', where: 'Website', text: 'Built automatically from your data: classes, campuses, teachers, open jobs, with online admission, careers, a photo gallery and events.' },
      { title: 'And much more, included', text: 'Excel import and export of any list; your own colour and logo; your own web domain; several campuses; GPS staff attendance; online document requests for marksheets and certificates; hiring with a careers page; staff tasks; payroll with verified bank accounts; receipts and report cards; promoting a class to the next year; dark mode; live notifications; and a guided tour for every new user.' },
      { title: 'Warnings when you outgrow your plan', where: 'Plans & Billing', text: 'The system compares your students, staff and stored files with your plan. You are warned at 80% (by email and a banner), have 14 days after passing the limit to change plan, and only then is access paused. Nothing is deleted.' },
    ],
  },
  {
    id: 'security', title: 'Security and your data', icon: ShieldCheck, who: 'Everyone',
    summary: 'How your school’s information is protected.',
    steps: [
      { title: 'Every school’s data is separate', text: 'Each school’s records are kept apart inside the database itself, so one school can never see another’s.' },
      { title: 'Sign-in protection', text: 'The owner’s console asks for a code sent by email after the password. Ten wrong passwords lock an account for fifteen minutes. Passwords are stored encrypted, never as plain text, and your first sign-in always asks for a new password.' },
      { title: 'Everything is recorded', text: 'Important changes are written to an activity log, so you can always see who did what, and when.' },
      { title: 'Safe files and backups', text: 'Uploaded documents are checked before they are accepted. The data is backed up every day.' },
      { title: 'Staying safe', text: 'We never ask for your password or a code by phone, WhatsApp or email. Only sign in on your school’s own address, and never share a code with anyone who asks.' },
    ],
  },
];
