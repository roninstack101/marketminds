"use client";

import { motion } from "framer-motion";

type Direction = "up" | "left" | "right" | "fade";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  threshold?: number;
}

const VARIANTS: Record<Direction, any> = {
  up: {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -35 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 35 },
    visible: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.08,
}: Props) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[direction]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Smooth snapping cubic-bezier
        delay: delay / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
