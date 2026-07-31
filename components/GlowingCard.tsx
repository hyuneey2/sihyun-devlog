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
      {/* 👇 수정한 은은한 네온 글로우 효과 부분 👇 */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-200 to-teal-100 opacity-0 blur-2xl transition duration-700 group-hover:opacity-40 group-focus-within:opacity-40"
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