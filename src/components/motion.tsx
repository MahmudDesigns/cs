"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Reveal({
  children,
  i = 0,
  className = "",
  amount = 0.25,
}: {
  children: ReactNode;
  i?: number;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function HeroStagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
