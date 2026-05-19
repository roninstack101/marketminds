"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedCounter({ value, className, style }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stripped = value.replace(/,/g, "");
    const match = stripped.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const target = parseFloat(match[2]);
    const suffix = match[3];
    const isDecimal = match[2].includes(".");
    const needsLocale = /\d,\d/.test(value);

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const duration = 1800;
        const t0 = performance.now();

        function tick(now: number) {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = target * eased;

          let numStr: string;
          if (needsLocale) numStr = Math.round(cur).toLocaleString("en-IN");
          else if (isDecimal) numStr = cur.toFixed(1);
          else numStr = Math.round(cur).toString();

          setDisplay(`${prefix}${numStr}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <p ref={ref} className={className} style={style}>
      {display}
    </p>
  );
}
