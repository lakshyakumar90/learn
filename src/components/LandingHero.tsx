'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { KnowledgeMap } from './KnowledgeMap';

/**
 * Landing hero: headline and subtitle about the site itself,
 * two CTAs, and the decorative knowledge map.
 */
export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
      <div>
        <motion.p
          {...rise}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider opacity-70"
        >
          A reading room for software
        </motion.p>
        <motion.h1
          {...rise}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          Understand real codebases, one diagram at a time.
        </motion.h1>
        <motion.p
          {...rise}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-4 max-w-md text-lg leading-relaxed opacity-70"
        >
          learn collects slow, careful notes on real projects — plus the topics and books
          around them. Read the docs, see the diagrams, watch the flows.
        </motion.p>
        <motion.div
          {...rise}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-stone-900"
          >
            Browse projects <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="#how-to"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
          >
            How it works <ArrowDown size={16} aria-hidden />
          </Link>
        </motion.div>
      </div>
      <motion.div
        {...(reduceMotion
          ? {}
          : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 } })}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto w-full max-w-md"
      >
        <KnowledgeMap />
      </motion.div>
    </section>
  );
}
