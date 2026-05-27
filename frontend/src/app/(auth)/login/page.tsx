"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticWrapper from "@/components/MagneticWrapper";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ── Floating particles on left panel ─────────────────────────── */
const PARTICLES = [
  { x: 12, y: 18, s: 3, d: 0,   dur: 8, vx: 15, vy: -25 },
  { x: 38, y: 55, s: 2, d: 1.2, dur: 10, vx: -20, vy: -40 },
  { x: 62, y: 30, s: 4, d: 0.6, dur: 7, vx: 25, vy: -20 },
  { x: 80, y: 70, s: 2, d: 2.1, dur: 9, vx: -15, vy: -50 },
  { x: 22, y: 82, s: 3, d: 1.8, dur: 8.5, vx: 30, vy: -35 },
  { x: 75, y: 12, s: 2, d: 0.4, dur: 6.5, vx: -25, vy: 20 },
  { x: 50, y: 45, s: 3, d: 3.0, dur: 9.5, vx: 10, vy: -45 },
  { x: 90, y: 38, s: 2, d: 1.5, dur: 8, vx: -10, vy: 30 },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C9A227]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
          animate={{ y: [0, p.vy, 0], x: [0, p.vx, 0], opacity: [0.08, 0.45, 0.08] }}
          transition={{ duration: p.dur, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Left panel stats ──────────────────────────────────────────── */
const STATS = [
  { value: "₹35L+", label: "Capital Deployed" },
  { value: "42.5%", label: "Avg Annual Return" },
  { value: "100+", label: "Active Partners" },
];

const FEATURES = [
  "Algo-driven portfolio management",
  "Real-time performance dashboards",
  "Institutional-grade risk controls",
];

/* ── Staggered form field wrapper ─────────────────────────────── */
function FadeField({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Shimmer button ────────────────────────────────────────────── */
function GoldButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.015 }}
      whileTap={{ scale: loading ? 1 : 0.985 }}
      className="relative w-full py-3.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold uppercase tracking-widest transition-colors duration-300 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_35px_rgba(201,162,39,0.55)] overflow-hidden flex items-center justify-center gap-2"
    >
      {/* shimmer sweep */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mouseXPos = useMotionValue(0);
  const mouseYPos = useMotionValue(0);

  const orbX = useTransform(mouseX, [0, 1], [-18, 18]);
  const orbY = useTransform(mouseY, [0, 1], [-18, 18]);
  const orbX2 = useTransform(orbX, (v: number) => -v * 0.6);
  const orbY2 = useTransform(orbY, (v: number) => -v * 0.6);

  useEffect(() => {
    if (localStorage.getItem("mm_token")) router.replace("/dashboard");
  }, [router]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);

  function onGlobalMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseXPos.set(x);
    mouseYPos.set(y);
    const relX = x / rect.width;
    mouseX.set(relX);
    mouseY.set(y / rect.height);
    setIsHoveringText(relX < 0.48 && window.innerWidth >= 1024);
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError("");
    };
  }

  const emailValid = /\S+@\S+\.\S+/.test(form.email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Login failed");
      localStorage.setItem("mm_token", data.token);
      localStorage.setItem("mm_user", JSON.stringify(data.user));
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex bg-[var(--bg)] relative overflow-hidden" onMouseMove={onGlobalMouseMove}>
      
      {/* ── Full-Screen Animated Background ── */}
      <div className="absolute inset-0 z-0 bg-[var(--surface-deep)]">
        {/* Abstract Expanding Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-40">
          <motion.div
            className="absolute w-[60vw] h-[60vw] lg:w-[40vw] lg:h-[40vw] rounded-full border border-[#C9A227] opacity-0"
            animate={{ scale: [0.8, 2.5], opacity: [0, 0.12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-[60vw] h-[60vw] lg:w-[40vw] lg:h-[40vw] rounded-full border border-[#C9A227] opacity-0"
            animate={{ scale: [0.8, 2.5], opacity: [0, 0.12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 4 }}
          />
          <motion.div
            className="absolute w-[60vw] h-[60vw] lg:w-[40vw] lg:h-[40vw] rounded-full border border-[#C9A227] opacity-0"
            animate={{ scale: [0.8, 2.5], opacity: [0, 0.12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 8 }}
          />
        </div>

        {/* Animated Dot Matrix */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(var(--dot-matrix-color) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.35,
          }}
          animate={{ opacity: isHoveringText ? 0.12 : 0.35 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Mouse Spotlight Glow / Dot Highlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none hidden lg:block z-0"
          style={{
            backgroundImage: "radial-gradient(var(--spotlight-color) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            filter: "var(--spotlight-filter)",
            WebkitMaskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseXPos}px ${mouseYPos}px, black, transparent 100%)`,
            maskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseXPos}px ${mouseYPos}px, black, transparent 100%)`,
            opacity: 0,
          }}
          animate={{ opacity: isHoveringText ? 0.15 : 0.7 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {/* Sweeping Gradient */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, #C9A227 0%, transparent 60%)",
          }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.15, 0.05],
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Parallax orbs */}
        <motion.div
          className="absolute -top-32 -right-32 lg:-right-16 w-80 h-80 rounded-full bg-[#C9A227] opacity-[0.09] blur-3xl pointer-events-none"
          style={{ x: orbX, y: orbY }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#C9A227] opacity-[0.07] blur-3xl pointer-events-none"
          style={{ x: orbX2, y: orbY2 }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Floating particles */}
        <FloatingParticles />
      </div>

      {/* ── Foreground Layer ── */}
      <div 
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-dvh lg:px-12 lg:py-10"
      >
        {/* ── Left Content (Desktop Only) ── */}
        <motion.div
          className="hidden lg:flex flex-col justify-between h-full py-10 w-[45%]"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MagneticWrapper className="inline-block">
              <Link href="/" className="group">
                <span
                  className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(201,162,39,0.6)] group-hover:scale-[1.02]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", display: "inline-block" }}
                >
                  MarketMinds
                </span>
              </Link>
            </MagneticWrapper>
          </motion.div>

          {/* Middle content */}
          <div className="relative z-10 space-y-10">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#C9A227]">Private Investment Platform</p>
              <h2
                className="font-display text-4xl xl:text-5xl font-bold leading-[1.15] text-[var(--text)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Not everyone<br />invests this well.
              </h2>
              <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-xs">
                Systematic, algo-driven strategies built for India&apos;s serious long-term investors.
              </p>
            </motion.div>

            {/* Feature list */}
            <motion.ul
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  whileHover={{ x: 6, color: "var(--text)" }}
                  className="flex items-center gap-3 text-sm text-[var(--text-2)] transition-colors cursor-default"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-[#C9A227] flex-shrink-0"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity }}
                  />
                  {f}
                </motion.li>
              ))}
            </motion.ul>

            {/* Animated stats */}
            <motion.div
              className="flex gap-6 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <AnimatedCounter
                    value={s.value}
                    className="font-display text-xl font-bold text-gold-gradient"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  />
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            className="relative z-10 text-[10px] text-[var(--text-3)] tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            © 2025 MarketMinds. Investments are subject to market risk.
          </motion.p>
        </motion.div>

        {/* ── Right Form Area ── */}
        <motion.div 
          className="w-full lg:max-w-xl lg:w-[540px] xl:w-[600px] flex flex-col flex-1 lg:flex-none relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="flex-1 lg:flex-none flex flex-col bg-[var(--surface)]/95 lg:bg-[var(--surface)]/98 dark:lg:bg-[var(--surface)]/70 backdrop-blur-2xl lg:rounded-3xl premium-card overflow-hidden">
            
            {/* Form Top Bar */}
            <div className="flex items-center justify-between px-6 py-5 lg:px-10 border-b border-[var(--border)]/60 bg-[var(--surface)] lg:bg-[var(--surface-deep)]/30">
              <MagneticWrapper>
                <Link
                  href="/"
                  className="lg:hidden font-display font-bold text-xl sm:text-2xl text-gold-gradient block transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(201,162,39,0.6)] hover:scale-[1.02]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  MarketMinds
                </Link>
              </MagneticWrapper>
              <ThemeToggle />
            </div>

            <div className="px-6 py-8 lg:px-10">
              {/* Heading */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              >
                <h1
                  className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Welcome back.
                </h1>
                <p className="text-sm text-[var(--text-2)]">Sign in to your MarketMinds account</p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <FadeField delay={0.5}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Email</label>
                      <AnimatePresence>
                        {emailValid && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-emerald-400 text-xs flex items-center gap-1"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Valid
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.input
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      whileFocus={{ scale: 1.005 }}
                      className="w-full px-4 py-3.5 rounded-xl bg-[var(--input-bg)] border text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none transition-all duration-200"
                      style={{
                        borderColor: emailValid && form.email ? "#C9A22780" : "var(--border)",
                        boxShadow: emailValid && form.email ? "0 0 0 3px #C9A22715" : "none",
                      }}
                    />
                  </div>
                </FadeField>

                {/* Password */}
                <FadeField delay={0.6}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Password</label>
                      <Link href="/forgot-password" className="text-xs text-[#C9A227] hover:text-[#E8C65A] transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <motion.input
                        type={showPass ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={form.password}
                        onChange={set("password")}
                        placeholder="••••••••"
                        whileFocus={{ scale: 1.005 }}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showPass ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </FadeField>

                {/* Submit */}
                <FadeField delay={0.7}>
                  <GoldButton loading={loading}>
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      "Sign In →"
                    )}
                  </GoldButton>
                </FadeField>
              </form>

              <FadeField delay={0.8}>
                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-3)] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <p className="text-center text-sm text-[var(--text-2)]">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-[#C9A227] hover:text-[#E8C65A] font-medium transition-colors">
                    Create one →
                  </Link>
                </p>
              </FadeField>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
