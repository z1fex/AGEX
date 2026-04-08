"use client";

import { motion, type Variants } from "framer-motion";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

// --- Fade In ---
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE_OUT_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Stagger Children ---
export function StaggerChildren({
  children,
  staggerDelay = 0.05,
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Stagger Item (use inside StaggerChildren) ---
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: EASE_OUT_SMOOTH },
    },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

// --- Slide Up ---
export function SlideUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Glow Card (hover glow effect for space theme) ---
export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -2,
        boxShadow: "0 0 20px -5px hsl(var(--glow) / 0.3)",
        borderColor: "hsl(var(--primary) / 0.4)",
      }}
      transition={{ duration: 0.2, ease: EASE_OUT_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}

// --- Animated Counter ---
export function AnimatedCounter({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_SMOOTH }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// --- Page Transition Wrapper ---
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: EASE_OUT_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
