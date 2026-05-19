"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function MouseOrb() {
  const [isClient, setIsClient] = useState(false);
  const springConfig = { damping: 30, stiffness: 50 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    setIsClient(true);
    // Initial center position
    cursorX.set(window.innerWidth / 2 - 250);
    cursorY.set(window.innerHeight / 2 - 250);

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX - 250); // Center the orb on cursor
      cursorY.set(e.clientY - 250);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [cursorX, cursorY]);

  if (!isClient) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#C9A227]/10 to-[#E8C65A]/5 blur-[100px] pointer-events-none z-0"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    />
  );
}
