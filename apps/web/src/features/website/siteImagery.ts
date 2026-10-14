// Which pictures a school website shows. The site tier (standard: Starter/Growth plans, premium:
// Scale/Enterprise) decides how many pictures and where; the school's slug picks which ones, so
// each school gets its own stable set and neighbouring schools rarely look alike.
// The *-bg and *-hero files are blurred at source, so they are only ever shown faded.

export type SiteTier = 'standard' | 'premium';

/** `light`: the default. `classic`: dark steel hero band, top bar and footer, with a fixed picture set. */
export type SiteStyle = 'light' | 'classic';

/** Schools kept on the Classic style (by slug). */
const CLASSIC_SITES = new Set(['demo']);

export const siteStyle = (slug: string): SiteStyle => (CLASSIC_SITES.has(slug) ? 'classic' : 'light');

export interface SitePicture { src: string; srcSet?: string; alt: string }

export interface SiteImagery {
  /** Faded behind the hero when the school has not chosen its own cover photo. */
  hero: SitePicture;
  /** Hero picture opacity on the Classic style's dark band. */
  heroOpacity: number;
  /** Mirror the hero picture (keeps lettering on a building from reading as the school's name). */
  heroMirror: boolean;
  /** Shown clearly beside the About text. */
  feature: SitePicture;
  /** A second clear picture overlapping the feature (premium only). */
  inset: SitePicture | null;
  /** Faded section backgrounds (premium only). */
  admissionsBackdrop: string | null;
  contactBackdrop: string | null;
}

const SITE = '/images/school-site';
const STOCK = '/images/marketing';
/** Licensed stock photos (CREDITS.md), each at 800 and 1600 px. */
const stock = (name: string, alt: string): SitePicture => ({ src: `${STOCK}/${name}-1600.webp`, srcSet: `${STOCK}/${name}-800.webp 800w, ${STOCK}/${name}-1600.webp 1600w`, alt });

const P = {
  aiLearning: { src: `${SITE}/ai-learning-1024.webp`, srcSet: `${SITE}/ai-learning-640.webp 640w, ${SITE}/ai-learning-1024.webp 1024w`, alt: 'A student learning with a tablet' },
  classroom: { src: `${SITE}/classroom-678.webp`, alt: 'A classroom ready for lessons' },
  // Lightly blurred at source: the lettering on the building must not read as the school's name.
  campusModern: { src: `${SITE}/campus-modern-hero-1200.webp`, srcSet: `${SITE}/campus-modern-hero-800.webp 800w, ${SITE}/campus-modern-hero-1200.webp 1200w`, alt: '' },
  campusArchway: stock('campus-archway', 'Students walking through the campus'),
  campusAutumn: stock('campus-autumn', 'The school building in autumn'),
  classLesson: stock('class-lesson', 'A teacher with students in class'),
  classroomTeacher: stock('classroom-teacher', 'Students and their teacher in a classroom'),
  happyStudents: stock('happy-students', 'Students in their classroom'),
  handsRaised: stock('hands-raised', 'Students raising their hands in a lecture'),
  studentHand: stock('student-hand', 'A student raising a hand in class'),
  studentsBooks: stock('students-books', 'Students in uniform holding books'),
  studentsLaptop: stock('students-laptop', 'Students working together on a laptop'),
  studentsUniform: stock('students-uniform', 'Students in school uniform'),
  teacherWhiteboard: stock('teacher-whiteboard', 'A teacher at the whiteboard'),
} satisfies Record<string, SitePicture>;

const POOLS = {
  standard: {
    hero: [P.classroom, P.classLesson, P.teacherWhiteboard, P.happyStudents, P.studentsUniform],
    feature: [P.aiLearning, P.classroomTeacher, P.studentsBooks, P.studentHand, P.studentsLaptop, P.happyStudents],
  },
  premium: {
    hero: [P.campusModern, P.campusArchway, P.campusAutumn, P.handsRaised],
    feature: [P.aiLearning, P.studentsLaptop, P.classroomTeacher, P.studentsBooks, P.handsRaised],
    inset: [P.classroom, P.studentHand, P.teacherWhiteboard, P.studentsUniform, P.classLesson],
    backdrops: [`${SITE}/science-lab-bg-640.webp`, `${SITE}/campus-classic-bg-1400.webp`],
  },
};

/** Stable 32-bit hash (FNV-1a), so a school always gets the same pictures. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A pick from `pool` (driven by a slice of `seed`) that is not already in `used`. */
function pick(pool: SitePicture[], seed: number, slot: number, used: SitePicture[]): SitePicture {
  const free = pool.filter((p) => !used.includes(p));
  const from = free.length ? free : pool;
  return from[(seed >>> (slot * 6)) % from.length]!;
}

/** The Classic style's fixed pictures. */
function classicImagery(tier: SiteTier): SiteImagery {
  return tier === 'premium'
    ? { hero: P.campusModern, heroOpacity: 0.24, heroMirror: true, feature: P.aiLearning, inset: P.classroom, admissionsBackdrop: POOLS.premium.backdrops[0]!, contactBackdrop: POOLS.premium.backdrops[1]! }
    : { hero: { ...P.classroom, alt: '' }, heroOpacity: 0.17, heroMirror: false, feature: P.aiLearning, inset: null, admissionsBackdrop: null, contactBackdrop: null };
}

export function siteImagery(tier: SiteTier, slug: string): SiteImagery {
  if (siteStyle(slug) === 'classic') return classicImagery(tier);
  const seed = hash(slug);
  if (tier === 'premium') {
    const pool = POOLS.premium;
    const hero = pick(pool.hero, seed, 0, []);
    const feature = pick(pool.feature, seed, 1, [hero]);
    const inset = pick(pool.inset, seed, 2, [hero, feature]);
    const flip = (seed >>> 20) % 2 === 1;
    return {
      hero,
      heroOpacity: 0.55,
      heroMirror: hero === P.campusModern,
      feature,
      inset,
      admissionsBackdrop: pool.backdrops[flip ? 1 : 0]!,
      contactBackdrop: pool.backdrops[flip ? 0 : 1]!,
    };
  }
  const pool = POOLS.standard;
  const hero = pick(pool.hero, seed, 0, []);
  return { hero, heroOpacity: 0.55, heroMirror: false, feature: pick(pool.feature, seed, 1, [hero]), inset: null, admissionsBackdrop: null, contactBackdrop: null };
}
