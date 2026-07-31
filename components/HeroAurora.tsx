"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroAurora() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="hero-aurora-layer pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        /* 
          1. 채도 살짝 빼기: 기존 색상에 /80을 붙여서 원색의 쨍함을 미세하게 덜어냄
        */
        className="hero-aurora rounded-full bg-gradient-to-r from-green-200/80 via-lime-200/80 to-transparent blur-3xl"
        initial={false}
        animate={
          shouldReduceMotion
            ? { scale: 1, opacity: 0.4 }
            : {
                /* 2. 투명도 조금 낮추기: [0.4, 0.7, 0.4] -> [0.3, 0.6, 0.3] 으로 조정 */
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
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