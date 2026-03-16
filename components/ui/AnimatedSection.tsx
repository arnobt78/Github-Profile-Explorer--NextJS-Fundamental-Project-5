"use client";

/**
 * Wrapper that fades in and slides up (Framer Motion). Optional delay for stagger.
 * Used in UserProfile for error/not-found blocks and chart sections.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

type AnimatedSectionProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function AnimatedSection({
  children,
  delay = 0,
  className,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
