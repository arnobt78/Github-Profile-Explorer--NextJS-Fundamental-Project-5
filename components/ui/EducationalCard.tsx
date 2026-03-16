"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type EducationalCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
};

export function EducationalCard({
  title,
  description,
  icon,
  className,
  delay = 0,
}: EducationalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
