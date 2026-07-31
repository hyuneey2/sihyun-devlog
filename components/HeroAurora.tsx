"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroAurora() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="hero-aurora-layer pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <motion.div
        className="hero-aurora rounded-full bg-gradient-to-r from-emerald-300 via-teal-100 to-transparent blur-3xl"
        initial={false}
        animate={
          shouldReduceMotion
            ? { scale: 1, opacity: 0.35 }
            : {
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
    </div>
  );
}
