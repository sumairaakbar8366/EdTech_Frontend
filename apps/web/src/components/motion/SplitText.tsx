import { motion, useReducedMotion } from 'motion/react';

/** Text whose words rise and unfold one after another, like a slide title coming in. */
export function SplitText({ text, delay = 0, stagger = 0.06, className = '' }: { text: string; delay?: number; stagger?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          initial={{ opacity: 0, y: '0.6em', rotateX: -70 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: delay + i * stagger, type: 'spring', stiffness: 140, damping: 18 }}
          className="mr-[0.25em] inline-block [transform-origin:50%_100%] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
