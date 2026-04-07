import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type FadeInSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<'section'>, 'children'>;

const defaultTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

/**
 * Scroll-triggered fade + lift; respects `prefers-reduced-motion` via Framer defaults.
 */
export function FadeInSection({ children, className = '', delay = 0, ...motionProps }: FadeInSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ ...defaultTransition, delay }}
      {...motionProps}
    >
      {children}
    </motion.section>
  );
}
