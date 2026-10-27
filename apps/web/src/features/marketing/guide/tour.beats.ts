import { CHAPTERS } from '@/features/marketing/guide/guide.content';
import shots from '@/features/marketing/guide/tour.shots.json';
import voice from '@/features/marketing/guide/tour.voice.json';

/**
 * The walkthrough's beats, on real screens of the app (captured from the demo school; see
 * public/guide/screens). Each beat shows one screenshot; the camera zooms to `focus`, the cursor
 * clicks `click`, and `toast` confirms the action. Areas are a target (the label of a button, tab or
 * field recorded with the screenshot), several targets (their union) or a box [x, y, w, h] in the
 * screenshot's page coordinates.
 */

export type Box = [x: number, y: number, w: number, h: number];
export type Area = Box | string | string[];

export interface TourBeat {
  shot: ShotId;
  /** What the narrator says (spoken by the walkthrough's voice; see tour.voice.json). */
  say: string;
  caption: string;
  /** Its voice clip (set below: "<chapter>-<index>"). */
  voice?: string;
  focus?: Area;
  click?: Area;
  toast?: string;
}

export type ShotId = keyof typeof shots;
export interface Shot { w: number; h: number; targets: Record<string, Box> }
export const SHOTS = shots as unknown as Record<ShotId, Shot>;
export const shotUrl = (id: ShotId) => `/guide/screens/${id}.jpg`;
export const isPhone = (id: ShotId) => id.startsWith('m-');

/** The box an area stands for on a screenshot (null if a target is missing). */
export function areaBox(shot: ShotId, area: Area | undefined): Box | null {
  if (!area) return null;
  if (typeof area[0] === 'number') return area as Box;
  const labels = typeof area === 'string' ? [area] : (area as string[]);
  const boxes = labels.map((l) => SHOTS[shot].targets[l]).filter(Boolean);
  if (!boxes.length) return null;
  const x1 = Math.min(...boxes.map((b) => b[0]));
  const y1 = Math.min(...boxes.map((b) => b[1]));
  const x2 = Math.max(...boxes.map((b) => b[0] + b[2]));
  const y2 = Math.max(...boxes.map((b) => b[1] + b[3]));
  return [x1, y1, x2 - x1, y2 - y1];
}

/**
 * Beats by chapter id (chapters and their written guide are in guide.content.ts). The story: a new
 * school (Bright Future School, filmed as it was set up) from an empty dashboard to its first
 * teacher, hire and enrolled student; then a school full of data (the demo school); then dark mode.
 * Chapters without beats are in the written guide only.
 */
export const TOUR_BEATS: Record<string, TourBeat[]> = {
  signup: [
    { shot: 'signup', say: "Welcome! Let's set up a school from scratch. Choose Free trial, and continue with Google. No card needed.", caption: 'Open the main website, choose “Free trial” and click “Continue with Google”. No forms, no card.', focus: ['Free trial', 'Continue with Google', 'Continue with email'], click: 'Continue with Google' },
    { shot: 'signup', say: "Type your school's name, and the code Google sends to your Gmail. That's it. Your school is ready.", caption: 'Type your school’s name and the code Google sends to your Gmail. Your school is ready.', focus: ['Sign in', 'Continue with email'] },
  ],
  dashboard: [
    { shot: 'b-dashboard-empty', say: "Meet Bright Future School. It's brand new, and completely empty. Everything is set up from this menu.", caption: 'Meet Bright Future School: brand new and completely empty. Everything is set up from the menu.', focus: [12, 196, 1390, 320], click: 'Academics' },
  ],
  year: [
    { shot: 'b-years-empty', say: "First, Academics, then Years and Terms. There's no academic year yet.", caption: 'Academics → Years & Terms: no academic year yet.', focus: [292, 175, 1110, 360], click: 'New academic year' },
    { shot: 'b-year-form', say: "We add the session twenty twenty-six to twenty twenty-seven, and make it the current year.", caption: 'Session 2026-2027, made the current year.', focus: ['New academic year', 'Name', 'Make this the current year', 'Save'], click: 'Save', toast: 'Academic year saved' },
    { shot: 'b-years', say: "The year is ready, with term one and term two.", caption: 'The year is ready, with Term 1 and Term 2.', focus: [292, 300, 760, 320] },
  ],
  classes: [
    { shot: 'b-class-form', say: "Next, the classes, each with its level: grade one, grade two, and so on.", caption: 'Create each class with its level: Grade 1, Grade 2…', focus: ['New class', 'Name', 'Level', 'Save'], click: 'Save', toast: 'Class saved' },
    { shot: 'b-classes', say: "Every class gets its sections, with a capacity and a campus.", caption: 'Each class gets its sections, with capacity and campus.', focus: [292, 300, 1110, 250] },
    { shot: 'b-subjects', say: "Then the subjects with their short codes, and the rooms.", caption: 'Then the subjects with their codes, and the rooms.', focus: [292, 330, 1110, 320] },
  ],
  staff: [
    { shot: 'b-staff-empty', say: "Now the staff. Only the administrator is here so far. Click Add staff.", caption: 'Staff: only the administrator so far. Click “Add staff”.', focus: [292, 88, 1110, 420], click: 'Add staff' },
    { shot: 'b-accountant-login', say: "Add their details and photo, and a login with the right role.", caption: 'Details, photo, and a login with the right role: Teacher, Accounts, Principal…', focus: ['Create a login for this staff member', 'Teacher', 'Accounts', 'Principal', 'Add staff'], click: 'Add staff', toast: 'Staff member added' },
    { shot: 'b-teacher-done', say: "Their user ID and password are created instantly, and emailed to them.", caption: 'Their User ID and password are ready, and emailed to them.', focus: ['Staff member added · login details', 'Copy login details', 'Done'] },
    { shot: 'b-staff', say: "Now we have a teacher and an accountant, each with their own login.", caption: 'A teacher and an accountant, each with their own login.', focus: [292, 225, 1110, 420] },
  ],
  hiring: [
    { shot: 'b-hiring-empty', say: "Need a science teacher? Go to Hiring, and create a new job post.", caption: 'Need a Science teacher? Staff → Hiring → “New job post”.', focus: [292, 80, 1110, 380], click: 'New job post' },
    { shot: 'b-job-form', say: "Add the title, department, closing date and a short description, and set it to open.", caption: 'Title, department, closing date and description. Set it to Open.', focus: ['New job post', 'Job title', 'Description', 'Save'], click: 'Save', toast: 'Job post created' },
    { shot: 'b-site-careers', say: "The vacancy appears on the school's own website, under Careers. A candidate applies,", caption: 'It appears on the school’s website under Careers. A candidate applies…', focus: [380, 100, 680, 600], click: [560, 632, 125, 36] },
    { shot: 'b-job-apply-form', say: "with a photo, contact details, qualification, and experience.", caption: '…with a photo, contact details, qualification and experience.', focus: ['Apply · Science Teacher', 'Your photo', 'Highest qualification', 'Send application'], click: 'Send application' },
    { shot: 'b-interview-form', say: "Back in Hiring, shortlist the candidate, and schedule the interview.", caption: 'In Hiring: shortlist the candidate and schedule the interview.', focus: ['Date & time', 'Interviewer', 'Schedule'], click: 'Schedule', toast: 'Interview scheduled' },
    { shot: 'b-candidate-selected', say: "The interview went well: nine out of ten. Choose the joining date, and hire.", caption: 'Interview passed, 9/10. Choose the joining date and hire.', focus: [320, 560, 800, 260], click: 'Hire and add to staff', toast: 'Candidate hired and added to staff' },
    { shot: 'b-staff-3', say: "And the new science teacher joins the staff, with a login of their own.", caption: 'The new Science teacher joins the staff, with a login.', focus: [292, 520, 1110, 380] },
  ],
  website: [
    { shot: 'b-site', say: "The school website is built automatically. Parents just click Apply now.", caption: 'The school website is built automatically from its data. Parents click “Apply now”.', focus: [0, 0, 1440, 560], click: 'Apply now' },
  ],
  apply: [
    { shot: 'b-apply-form', say: "A parent fills in the admission form, and sends it. Every field is checked.", caption: 'A parent fills in the admission form and sends it. Every field is checked.', focus: [330, 60, 780, 760] },
    { shot: 'b-apply-done', say: "And it's received: the school's very first application.", caption: 'Received: APP-2026-0001, the school’s very first application.', focus: [320, 230, 800, 300] },
  ],
  admissions: [
    { shot: 'b-admissions', say: "In Admissions, the new application is waiting. Let's open it.", caption: 'Admissions: one new application. Open it.', focus: [292, 160, 1110, 300], click: [292, 420, 1110, 40] },
    { shot: 'b-adm-document', say: "Upload her birth certificate, and verify the documents.", caption: 'Upload her birth certificate and verify the documents.', focus: [292, 140, 1110, 560], click: 'Move to: Docs verified', toast: 'Application updated' },
    { shot: 'b-adm-assessed', say: "She passed her interview, eighty-eight out of a hundred. Review, and approve.", caption: 'Interview passed, 88/100. Move to review, then approve.', focus: [292, 40, 1110, 820], click: 'Move to: Under review', toast: 'Application updated' },
    { shot: 'b-adm-enroll', say: "Choose her section, and enroll. Student, parent, and logins, in one click.", caption: 'Choose her section and enroll: student, parent and logins in one click.', focus: [1050, 280, 360, 480], click: 'Enroll student', toast: 'Student enrolled' },
    { shot: 'b-enrolled', say: "Hania is enrolled, with the full history of every step.", caption: 'Enrolled as ADM-0001, with the full history.', focus: [292, 40, 1110, 500] },
    { shot: 'b-dashboard-after', say: "And the dashboard shows the school coming to life.", caption: 'The dashboard shows the school coming to life.', focus: [292, 280, 1110, 140] },
  ],
  showcase: [
    { shot: 'd-dashboard-light', say: "Now, here's a school in full swing. Everything at a glance.", caption: 'And this is a school in full swing: everything at a glance.', focus: [292, 88, 1110, 340] },
    { shot: 'admissions', say: "Admissions, with a count for every step.", caption: 'Admissions with a count for every step.', focus: [292, 160, 1110, 380] },
  ],
  import: [
    { shot: 'import', say: "Already have your data in Excel? Import it. Every row is checked first.", caption: 'Existing data? Import it from Excel. Every row is checked first.', focus: ['Import students', 'Excel template', 'CSV template', 'Cancel'], click: 'Excel template' },
  ],
  fees: [
    { shot: 'generate', say: "Generate a month's invoices for the whole school, in one go.", caption: 'Generate a month’s invoices for the whole school in one go.', focus: ['Generate invoices', 'Academic year', 'Due date', 'One-time', 'Annual', 'Cancel'], click: [829, 671, 112, 38], toast: 'Invoices generated' },
    { shot: 'invoices', say: "And see collected, outstanding and overdue fees at a glance.", caption: 'Collected, outstanding and overdue fees at a glance.', focus: [292, 180, 1110, 225] },
  ],
  daily: [
    { shot: 'timetable', say: "A full timetable for every section.", caption: 'A full timetable for every section.', focus: [292, 225, 1110, 470] },
    { shot: 'exams', say: "Exams, marks, results, and report cards.", caption: 'Exams, marks, results and report cards.', focus: [292, 88, 1110, 380] },
  ],
  portals: [
    { shot: 'm-parent', say: "Parents see each child right on their phone,", caption: 'Parents see each child on their phone…', focus: [10, 200, 370, 450] },
    { shot: 'm-fees', say: "with fees, receipts, attendance, and results.", caption: '…with fees, receipts, attendance and results.', focus: [10, 80, 370, 320] },
  ],
  theme: [
    { shot: 'd-dashboard-light', say: "Prefer a darker screen? Just click the moon.", caption: 'Prefer a darker screen? Click the moon.', focus: [1150, 0, 290, 120], click: 'Switch to dark mode' },
    { shot: 'd-dashboard-dark', say: "Dark mode. Easier on the eyes at night.", caption: 'Dark mode: easier on the eyes at night.', focus: [292, 88, 1110, 560] },
    { shot: 'd-admissions-dark', say: "Every page works in dark mode,", caption: 'Every page works in dark mode…', focus: [292, 88, 1110, 500] },
    { shot: 'm-dark-dashboard', say: "on your phone too.", caption: '…on the phone too.', focus: [10, 80, 370, 700] },
  ],
  help: [
    { shot: 'b-dashboard-after', say: "Need help? The help button opens this guide and video, any time.", caption: 'Need help? The help button opens this guide and video any time.', focus: [12, 600, 232, 110], click: 'Help and user guide' },
  ],
};

// Each beat's voice clip: public/guide/voice/<chapter>-<index>.mp3, spoken from `say` by a local
// text-to-speech voice (Kokoro, af_heart); tour.voice.json holds each clip's length in ms.
for (const [id, beats] of Object.entries(TOUR_BEATS)) beats.forEach((b, i) => { b.voice = `${id}-${i}`; });
export const VOICE_MS = voice as Record<string, number>;
export const voiceUrl = (key: string) => `/guide/voice/${key}.mp3`;

/** Chapters the video shows (some are in the written guide only). */
export const VIDEO_CHAPTERS = CHAPTERS.filter((c) => TOUR_BEATS[c.id]?.length);
