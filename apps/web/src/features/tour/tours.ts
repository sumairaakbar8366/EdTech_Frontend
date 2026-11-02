/**
 * Guided tours, like the tutorial of a game: a dim screen, one thing lit up, an arrow to it, a short
 * line on what it is for, and "Next". Finishing (or skipping) a tour is remembered per person, so
 * each one appears once; "Guide" in the header replays them.
 *
 * `target`:  nav:<page>  a sidebar entry          tour:<name>  an element marked data-tour
 *            text:<words> a button / heading / tab with those words     css:<selector>
 * `route`:   a page of the person's area to open before the step ("/academics").
 * A step whose target is not on screen is shown as a centred card.
 */
export interface TourStep { title: string; body: string; target?: string; route?: string }
export interface Tour {
  key: string;
  /** Role area (admin, teacher…) or "platform" for the owner's console. */
  area: string;
  title: string;
  /** Starts by itself the first time the person opens this page (area-relative); without it, on the dashboard. */
  route?: string;
  steps: TourStep[];
}

const READY: TourStep = { title: 'You are ready!', body: 'That is everything you need to get going. You can replay any guide from the “Guide” button at the top, whenever you like.' };

export const TOURS: Tour[] = [
  // ---- School admin ---------------------------------------------------------------------------
  {
    key: 'admin-welcome', area: 'admin', title: 'Welcome, Admin',
    steps: [
      { title: 'Welcome to your school', body: 'This is your admin dashboard. We will show you, in order, what to set up first. It takes about a minute.' },
      { title: '1. Set up your academics', body: 'Start here: create the academic year and its terms, then your classes and sections, then subjects. Everything else (students, timetable, fees) hangs on these.', target: 'nav:academics', route: '/' },
      { title: '2. Add your teachers and staff', body: 'Add each teacher and staff member. You can also add your own extra questions to this form under Forms.', target: 'nav:staff' },
      { title: '3. Add students and parents', body: 'Enrol students with their parents. Admissions applications from your website also land in Admissions.', target: 'nav:students' },
      { title: '4. Decide who gets a login', body: 'People ask for access from your sign-in page. You approve them here, and only then their User ID and password are emailed.', target: 'nav:users-and-access' },
      { title: '5. Make the forms your own', body: 'Teachers, staff, students and parents each have a registration form. Add the fields your school needs; they appear everywhere that person is added or shown.', target: 'nav:forms' },
      { title: 'Complaints from your community', body: 'Parents, teachers, students and staff can raise a concern, even anonymously. You and the principal answer it here.', target: 'nav:complaints' },
      { title: 'Events', body: 'Add your science fair or admission drive here. Share it and Skool EdTech may offer your school a scholarship or sponsorship.', target: 'nav:events' },
      { title: 'Your public website', body: 'Your school has its own website. Edit its text, photos and admission form here.', target: 'nav:website' },
      READY,
    ],
  },
  {
    key: 'page-admin-academics', area: 'admin', route: '/academics', title: 'Academics',
    steps: [
      { title: 'Academics: set up in this order', body: 'First the academic year and its terms, then classes with their sections, then subjects. Use the tabs on this page.', target: 'text:Years & Terms' },
      { title: 'Classes & sections', body: 'Open this tab to add each class (for example “Class 5”) and its sections (A, B…). Students are placed into sections.', target: 'text:Classes & Sections' },
      { title: 'Subjects and rooms', body: 'Add the subjects you teach, then link them to classes. Rooms are used by the timetable.', target: 'text:Subjects' },
      READY,
    ],
  },
  {
    key: 'page-admin-staff', area: 'admin', route: '/staff', title: 'Staff',
    steps: [
      { title: 'Your teachers and staff', body: 'Everyone who works at the school is listed here. Click a person to see their profile, qualifications and service record.' },
      { title: 'Add a staff member', body: 'Use this button. Fill in their details and, if you wish, answer your own extra questions (set under Forms). A login is not created until you approve it under Users & Access, or tick “create login” here.', target: 'text:Add staff' },
      READY,
    ],
  },
  {
    key: 'page-admin-students', area: 'admin', route: '/students', title: 'Students',
    steps: [
      { title: 'Your students', body: 'All students are listed here. Search by name or admission number, and click a student for their profile, parents, attendance and fees.' },
      { title: 'Add a student', body: 'Add the student with a first parent, their class and, if needed, a login. Extra fields from your Student form appear at the bottom.', target: 'text:Add student' },
      READY,
    ],
  },
  {
    key: 'page-admin-users-and-access', area: 'admin', route: '/users-and-access', title: 'Users & Access',
    steps: [
      { title: 'Who can sign in', body: 'Every login of your school is here, with its role. You can reset passwords, change roles and switch logins off.' },
      { title: 'Requests for access', body: 'When someone asks for a login on your sign-in page, they appear here with their email already verified. Review each one, then approve: their User ID and password are emailed automatically. Nothing is sent before you approve.', target: 'tour:access-requests' },
      READY,
    ],
  },
  {
    key: 'page-admin-forms', area: 'admin', route: '/forms', title: 'Registration forms',
    steps: [
      { title: 'Design your own forms', body: 'Choose who the form is for: teachers, other staff, students, parents, or people requesting access.', target: 'tour:forms-tabs' },
      { title: 'Add a field', body: 'Press “Add a field”, give it a name, choose the kind of answer (text, number, date, choices…) and say whether it must be answered.', target: 'tour:designer-add' },
      { title: 'Save', body: 'When you save, the new fields appear everywhere that person is registered, edited or shown, immediately.', target: 'text:Save form' },
      READY,
    ],
  },
  {
    key: 'page-admin-complaints', area: 'admin', route: '/complaints', title: 'Complaints',
    steps: [
      { title: 'Complaints sent to you', body: 'These numbers show what needs attention. Serious and urgent ones (such as harassment) are marked so you see them first.', target: 'tour:complaint-stats' },
      { title: 'Filter the list', body: 'Narrow by status, topic or how serious it is. Anonymous complaints show only the kind of person who wrote them.', target: 'tour:complaint-filters' },
      { title: 'Answer and resolve', body: 'Open a complaint to reply, keep a private note, or mark it resolved. Writing how it was resolved is optional.', target: 'tour:complaint-new' },
      READY,
    ],
  },
  {
    key: 'page-admin-reports', area: 'admin', route: '/reports', title: 'Reports',
    steps: [
      { title: 'Is the school growing?', body: 'The “School growth” report compares this month or year with the one before: students, fees, salaries, attendance and complaints, with a plain verdict.', target: 'text:School growth' },
      READY,
    ],
  },
  // ---- Principal --------------------------------------------------------------------------------
  {
    key: 'principal-welcome', area: 'principal', title: 'Welcome, Principal',
    steps: [
      { title: 'Welcome', body: 'This is your dashboard: a view of the whole school, with the same pages as the admin for everything you oversee.' },
      { title: 'Complaints', body: 'Concerns from parents, students, teachers and staff arrive here, anonymous or not. You can answer, add private notes and resolve them.', target: 'nav:complaints', route: '/' },
      { title: 'Reports', body: 'Open Reports → School growth for monthly and yearly figures and a verdict on whether the school is growing.', target: 'nav:reports' },
      { title: 'Forms', body: 'Add fields to the teacher, staff, student and parent registration forms. They appear everywhere at once.', target: 'nav:forms' },
      { title: 'Activity', body: 'See everything that is changed in the school and who changed it.', target: 'nav:activity' },
      READY,
    ],
  },
  { key: 'page-principal-complaints', area: 'principal', route: '/complaints', title: 'Complaints', steps: [
    { title: 'What needs attention', body: 'Open and serious complaints are counted here.', target: 'tour:complaint-stats' },
    { title: 'Filter', body: 'By status, topic (harassment, fees, teaching…) or severity.', target: 'tour:complaint-filters' },
    READY] },
  // ---- Teacher ----------------------------------------------------------------------------------
  {
    key: 'teacher-welcome', area: 'teacher', title: 'Welcome, Teacher',
    steps: [
      { title: 'Welcome', body: 'This is your dashboard. Here is where to find the things you use every day.' },
      { title: 'Your classes today', body: 'See the classes you teach today and start one when it is time.', target: 'nav:todays-classes', route: '/' },
      { title: 'Take attendance', body: 'Mark each student present, absent or late for your class.', target: 'nav:class-attendance' },
      { title: 'Assignments and material', body: 'Set homework, share learning material, and mark what students hand in.', target: 'nav:assignments' },
      { title: 'Marks', body: 'Enter exam marks for your subjects here.', target: 'nav:exams-marks' },
      { title: 'Raise a concern', body: 'If something is wrong, tell the principal and admin here. You can stay anonymous.', target: 'nav:complaints' },
      READY,
    ],
  },
  // ---- Accounts ---------------------------------------------------------------------------------
  {
    key: 'accounts-welcome', area: 'accounts', title: 'Welcome, Accounts',
    steps: [
      { title: 'Welcome', body: 'This is your finance workspace: fees, invoices, payments and payroll.' },
      { title: 'Fee structures', body: 'Define what each class pays. Invoices are generated from these.', target: 'nav:fee-structures', route: '/' },
      { title: 'Invoices and payments', body: 'Create invoices, record payments and print receipts.', target: 'nav:student-invoices' },
      { title: 'Payroll', body: 'Prepare and review monthly salaries for the admin to approve.', target: 'nav:salary-processing' },
      READY,
    ],
  },
  // ---- Staff ------------------------------------------------------------------------------------
  {
    key: 'staff-welcome', area: 'staff', title: 'Welcome, Staff',
    steps: [
      { title: 'Welcome', body: 'This is your page: your attendance, leave and tasks.' },
      { title: 'Attendance', body: 'Check in when you arrive and see your attendance history.', target: 'nav:my-attendance', route: '/' },
      { title: 'Leave', body: 'Ask for leave and see whether it was approved.', target: 'nav:leave' },
      { title: 'Tasks and payslips', body: 'Tasks assigned to you, and your payslips.', target: 'nav:assigned-tasks' },
      READY,
    ],
  },
  // ---- Student ----------------------------------------------------------------------------------
  {
    key: 'student-welcome', area: 'student', title: 'Welcome, Student',
    steps: [
      { title: 'Welcome', body: 'This is your page. Let us show you where everything is.' },
      { title: 'Your classes and timetable', body: 'See your classes and when they are.', target: 'nav:timetable', route: '/' },
      { title: 'Assignments', body: 'Homework you need to hand in, with the deadline.', target: 'nav:assignments' },
      { title: 'Results', body: 'Your exam results once they are published.', target: 'nav:results' },
      { title: 'Speak up', body: 'If something is wrong at school (bullying, unfairness, anything), you can tell the principal here, and you can stay anonymous.', target: 'nav:complaints' },
      READY,
    ],
  },
  // ---- Parent -----------------------------------------------------------------------------------
  {
    key: 'parent-welcome', area: 'parent', title: 'Welcome, Parent',
    steps: [
      { title: 'Welcome', body: 'This is your page. Follow your child’s school life from here.' },
      { title: 'Your children', body: 'Open a child for their profile, attendance and results.', target: 'nav:my-children', route: '/' },
      { title: 'Fees and receipts', body: 'See what is due and download receipts.', target: 'nav:fees' },
      { title: 'Talk to teachers', body: 'Write privately to your child’s teachers.', target: 'nav:teacher-communication' },
      { title: 'Raise a concern', body: 'If something worries you, tell the principal and admin here. You can stay anonymous and follow the reply.', target: 'nav:complaints' },
      READY,
    ],
  },
  // ---- Owner (platform) -------------------------------------------------------------------------
  {
    key: 'platform-welcome', area: 'platform', title: 'Welcome, Owner',
    steps: [
      { title: 'Welcome to the console', body: 'This is where you run the platform: schools, registrations, scholarships and the public website.' },
      { title: 'Applications', body: 'Every school applies here. Your team verifies the CNIC, NTN and school by hand, then you approve it (the school is created) or decline it. You can also edit the application form and the trial length by school size.', target: 'nav:applications', route: '/dashboard' },
      { title: 'Schools', body: 'All schools on the platform, with their plan and people.', target: 'nav:schools' },
      { title: 'Scholarships', body: 'Sponsors and programs, the events schools share, one-click offers, requests, and the children who receive scholarships, with the money.', target: 'nav:scholarships' },
      { title: 'Website posts', body: 'Write a post with photos after an awards ceremony and it appears on the public website. No code changes.', target: 'nav:posts' },
      { title: 'Plans and payments', body: 'Subscription plans and the payments schools make.', target: 'nav:tiers' },
      READY,
    ],
  },
  { key: 'page-platform-registrations', area: 'platform', route: '/applications', title: 'Applications', steps: [
    { title: 'New schools apply here', body: 'Each application waits for your team. Open one to see everything the applicant gave.' },
    { title: 'Verify by hand', body: 'Press “Show to verify” to see the CNIC and check it on NADRA’s portal, check the NTN on FBR’s, and confirm the school. Tick each check as you do it.', target: 'text:Applications' },
    { title: 'Approve or decline', body: 'When the three checks are ticked, “Approve & create the school” creates the school and emails the owner their login. Decline sends the applicant your reason.', target: 'text:Form & trial rules' },
    { title: 'Form and trial rules', body: 'Choose how long the free trial is for small, medium and large schools, and add your own questions to the application form.' },
    READY] },
  { key: 'page-platform-scholarships', area: 'platform', route: '/scholarships', title: 'Scholarships', steps: [
    { title: 'Start with a program', body: 'Create a sponsor, then a scholarship program (amount, number of students, who can receive it) and set it to “recruiting”.', target: 'text:Programs & sponsors' },
    { title: 'Answer an opportunity', body: 'When a school opens admissions or shares an event, it appears under Opportunities. One click sends the school’s administrator a private request form.', target: 'text:Opportunities' },
    { title: 'Follow it to the child', body: 'Approve the school’s request, record the children who receive it, and mark each payment. Everything is counted in the Overview.', target: 'text:Offers & requests' },
    { title: 'Your own request form', body: 'Edit the form schools fill in: add your questions, then every new offer carries them.', target: 'text:Request form' },
    READY] },
  { key: 'page-platform-posts', area: 'platform', route: '/posts', title: 'Website posts', steps: [
    { title: 'Post to the website', body: 'Add a title, what happened, the event name, date and place, then photos. Tick “Show on the public website” and it is live.', target: 'tour:post-new' },
    READY] },
];

export const tourByKey = (key: string) => TOURS.find((t) => t.key === key);
