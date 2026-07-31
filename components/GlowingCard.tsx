"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type GlowingCardProps = {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
};

export function GlowingCard({
  href,
  children,
  ariaLabel,
}: GlowingCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="project-row glowing-card group relative h-full rounded-2xl"
      initial={false}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.02,
              y: -5,
            }
      }
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 opacity-0 blur-md transition duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden="true"
      />

      <Link
        className="project-glowing-card-content relative z-10 block h-full rounded-2xl bg-[var(--surface)] shadow-sm transition-shadow duration-500 group-hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
        href={href}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    </motion.article>
  );
}
