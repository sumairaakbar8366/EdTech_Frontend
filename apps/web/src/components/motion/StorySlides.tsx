import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { photo } from '@/config/site';

export interface Story {
  photo: string;
  alt: string;
  kicker: string;
  title: string;
  text: string;
}

/**
 * Full-bleed photo slideshow for side panels (sign-in, sign-up): slow Ken Burns zoom,
 * cross-fading photos and a text block that slides in with each story.
 */
export function StorySlides({ stories, interval = 7000 }: { stories: Story[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduce || stories.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % stories.length), interval);
    return () => clearTimeout(t);
  }, [index, reduce, stories.length, interval]);
  const s = stories[index]!;
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.img
          key={s.photo}
          {...photo(s.photo)}
          sizes="55vw"
          alt={s.alt}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: interval / 1000 + 1.5, ease: 'linear' } }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-linear-to-br from-[#0f1e3d]/92 via-[#1a3463]/76 to-[#1e3a8a]/50" />
      <div className="relative max-w-xl text-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="text-sm font-bold uppercase text-primary-200">{s.kicker}</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-none">{s.title}</h1>
            <p className="mt-4 max-w-lg text-lg text-white/85">{s.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex gap-1.5">
          {stories.map((st, i) => (
            <button key={st.photo} aria-label={`Show slide ${i + 1}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-10 bg-white' : 'w-4 bg-white/35 hover:bg-white/60'}`} />
          ))}
        </div>
      </div>
    </>
  );
}
