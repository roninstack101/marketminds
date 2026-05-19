"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)] mb-1.5">
          {label}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--input-bg)] border text-sm text-[var(--text)] transition-colors ${
          open ? "border-[#C9A227]/50" : "border-[var(--border)]"
        }`}
      >
        <span className="font-medium truncate">{selected?.label ?? "—"}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-3.5 h-3.5 text-[var(--text-3)] flex-shrink-0 ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.88, y: -6 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.88, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto"
          >
            {options.map((o, i) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors
                  ${i !== options.length - 1 ? "border-b border-[var(--border)]/50" : ""}
                  ${o.value === value
                    ? "text-[#C9A227] font-semibold bg-[#C9A227]/6"
                    : "text-[var(--text)] hover:bg-[var(--bg-alt)]"}`}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
