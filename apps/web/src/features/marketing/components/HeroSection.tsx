import { ArrowRight, CircleCheck, Presentation, Receipt, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { usePointerParallax } from '@/features/marketing/hooks/usePointerParallax';

const HEADLINE = ['One', 'platform', 'for', 'every', 'school,', 'every', 'campus,', 'every', 'role.'];
const GRADIENT_WORDS = new Set([4]);

/** A layer that drifts with the pointer; deeper layers (bigger depth) move further. */
function Layer({ x, y, depth, className = '', children }: { x: MotionValue<number>; y: MotionValue<number>; depth: number; className?: string; children: ReactNode }) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return <motion.div style={{ x: tx, y: ty }} className={className}>{children}</motion.div>;
}

/** Floating status card for a school operation. */
function Chip({ icon: Icon, tone, title, sub, delay }: { icon: typeof Receipt; tone: string; title: string; sub: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
      className="flex items-center gap-2 border border-white/30 bg-white/95 px-2.5 py-2 text-left text-slate-800 shadow-md backdrop-blur-md"
    >
      <span className={`flex h-7 w-7 items-center justify-center border-l-2 border-primary-400 ${tone}`}><Icon size={14} strokeWidth={1.75} /></span>
      <span>
        <span className="block text-xs font-semibold leading-tight">{title}</span>
        <span className="block text-[10px] text-slate-500">{sub}</span>
      </span>
    </motion.div>
  );
}

/** Tilted preview of the school operations dashboard. */
function PreviewCard({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const rotateY = useTransform(x, (v) => v * 12);
  const rotateX = useTransform(y, (v) => v * -10);
  const glareX = useTransform(x, (v) => `${50 + v * 40}%`);
  const glareY = useTransform(y, (v) => `${50 + v * 40}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.18), transparent 55%)`;
  const bars = [62, 80, 45, 92, 70, 85, 58];
  return (
    <motion.div style={{ rotateX, rotateY, transformPerspective: 1100 }} className="relative w-full max-w-md border border-white/40 bg-[#253746]/95 p-3 shadow-[0_30px_60px_-28px_rgb(30_48_64/0.48)] backdrop-blur-xl [transform-style:preserve-3d]">
      <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0" />
      <div className="flex items-center gap-1.5 pb-3">
        <span className="h-2 w-2 bg-slate-400" />
        <span className="h-2 w-2 bg-slate-500" />
        <span className="h-2 w-2 bg-orange-400" />
        <span className="ml-3 h-1.5 w-28 bg-white/20" />
      </div>
      <div className="grid grid-cols-3 gap-2 [transform:translateZ(30px)]">
        {['Students', 'Attendance', 'Admissions'].map((label, i) => (
          <div key={label} className="border border-white/10 bg-white/8 p-2.5">
            <div className={`h-5 w-5 border-l-2 ${i === 1 ? 'border-orange-400' : 'border-primary-300'} bg-primary-400/30`} />
            <div className="mt-2 h-1.5 w-12 bg-white/30" />
            <div className="mt-1.5 h-2.5 w-16 bg-white/60" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-24 items-end gap-2 border border-white/10 bg-white/5 p-3 [transform:translateZ(20px)]">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 0.45 + i * 0.06, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className={`flex-1 ${i === 3 ? 'bg-orange-400' : 'bg-primary-300/80'}`}
          />
        ))}
      </div>
      <div className="mt-3 space-y-2 [transform:translateZ(12px)]">
        {[70, 52, 84].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-5 w-5 bg-white/15" />
            <span className="h-1.5 bg-white/25" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Full-screen hero: pointer spotlight, layered parallax depth, 3D scene and the main call to action. */
export function HeroSection({ demoHref }: { demoHref: string }) {
  const reduce = useReducedMotion();
  const { x, y } = usePointerParallax();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section id="top" ref={ref} className="relative flex min-h-[min(760px,calc(100dvh-4.25rem))] items-center overflow-hidden">
      <img src="/images/marketing/ai-school-erp.png" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-[1.04] object-cover object-[center_38%] opacity-[0.28] blur-[2px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#f6f7f5]/90 via-[#f1f3f2]/58 to-[#e8edf0]/36 dark:from-[#0b1426]/92 dark:via-[#14213a]/72 dark:to-[#253341]/48" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_50%,rgb(113_135_154/0.10),transparent_52%)]" />

      <motion.div style={reduce ? undefined : { y: contentY, opacity: contentOpacity }} className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-14">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border-l-2 border-orange-500 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-primary-800 ring-1 ring-slate-200"
          >
            <ShieldCheck size={15} strokeWidth={1.75} className="text-primary-700" /> SCHOOL MANAGEMENT, DONE PROPERLY
          </motion.span>
          <h1 className="mt-4 max-w-2xl font-display font-semibold leading-tight">
            {HEADLINE.map((word, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { opacity: 0, y: 20, rotateX: -35 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.08 + i * 0.035, type: 'spring', stiffness: 110, damping: 18 }}
                className={`mr-[0.2em] inline-block [transform-origin:50%_100%] ${GRADIENT_WORDS.has(i) ? 'text-orange-700' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }} className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            Admissions, academics, attendance, fees, payroll and learning in one secure system, with a dashboard built for every
            administrator, accountant, teacher, student and parent.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="mt-6 flex flex-wrap gap-3">
            <motion.a
              href={demoHref}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="focus-ring group inline-flex items-center gap-2 border border-orange-500 bg-magenta-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-600"
            >
              Start Free Month <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </motion.a>
            <motion.a
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              href={demoHref}
              className="focus-ring inline-flex items-center gap-2 border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-primary-600 hover:text-primary-800"
            >
              Book a Demo
            </motion.a>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
            {['1-month full-featured trial', 'No card needed to start', 'Set up with your own data'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5"><CircleCheck size={14} className="text-primary-700" /> {t}</li>
            ))}
          </motion.ul>
        </div>

        <div className="relative mx-auto flex w-full max-w-lg items-center justify-center py-8 [perspective:1100px]">
          <Layer x={x} y={y} depth={10} className="relative w-full">
            <motion.div initial={reduce ? false : { opacity: 0, y: 35, rotateX: 15 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}>
              <PreviewCard x={x} y={y} />
            </motion.div>
          </Layer>
          <Layer x={x} y={y} depth={34} className="absolute -left-3 top-8 hidden sm:block">
            <motion.div animate={reduce ? undefined : { y: [0, -7, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <Chip icon={Presentation} tone="bg-primary-100" title="Class 7-B is live" sub="Mathematics · Room 12" delay={0.8} />
            </motion.div>
          </Layer>
          <Layer x={x} y={y} depth={42} className="absolute -right-4 bottom-20 hidden sm:block">
            <motion.div animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <Chip icon={Receipt} tone="bg-orange-50" title="Receipt issued" sub="Fee payment recorded" delay={1} />
            </motion.div>
          </Layer>
          <Layer x={x} y={y} depth={26} className="absolute -bottom-2 left-8 hidden xl:block">
            <motion.div animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Chip icon={UserCheck} tone="bg-primary-100" title="Checked in on campus" sub="GPS verified" delay={1.2} />
            </motion.div>
          </Layer>
          <Layer x={x} y={y} depth={50} className="absolute -top-1 left-1/3 hidden lg:block">
            <Chip icon={Sparkles} tone="bg-orange-50" title="Results published" sub="Report cards ready" delay={1.4} />
          </Layer>
        </div>
      </motion.div>

      <motion.a
        href="#features"
        aria-label="Scroll to features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: reduce ? 0 : [0, 8, 0] }}
        transition={{ delay: 2, y: { duration: 2, repeat: Infinity } }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 border border-slate-300 p-1.5 sm:block"
      >
        <span className="block h-7 w-4 border border-slate-400">
          <span className="mx-auto mt-1 block h-2 w-0.5 bg-orange-500" />
        </span>
      </motion.a>
    </section>
  );
}
