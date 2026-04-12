"use client";

import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface MotionFadeProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  slideUp?: boolean;
}

export function MotionFade({
  children,
  className,
  duration = 0.2,
  delay = 0,
  slideUp = true,
  ...props
}: MotionFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: slideUp ? 10 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: slideUp ? -10 : 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
