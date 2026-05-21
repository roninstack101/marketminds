"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import MagneticWrapper from "@/components/MagneticWrapper";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const update = useCallback((idx: number, char: string) => {
    const next = [...value];
    next[idx] = char;
    onChange(next);
    if (char && idx < 5) refs.current[idx + 1]?.focus();
  }, [value, onChange]);

  function onKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (value[idx]) { update(idx, ""); }
      else if (idx > 0) { refs.current[idx - 1]?.focus(); update(idx - 1, ""); }
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    digits.split("").forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  }

  const allFilled = value.every(Boolean);

  return (
    <div className="flex gap-2.5 sm:gap-3 justify-center" onPaste={onPaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} animate={value[i] ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.25, type: "tween", ease: "easeInOut" }}>
          <motion.input
            ref={(el) => { refs.current[i] = el; }}
            type="text" inputMode="numeric" maxLength={1}
            value={value[i] || ""}
            onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(-1); update(i, c); }}
            onKeyDown={(e) => onKey(i, e)}
            onFocus={(e) => e.target.select()}
            whileFocus={{ scale: 1.1 }}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border bg-[var(--input-bg)] text-[var(--text)] outline-none transition-colors duration-150 cursor-pointer"
            style={{
              borderColor: allFilled ? "#22c55e" : value[i] ? "#C9A227" : "var(--border)",
              boxShadow: allFilled ? "0 0 0 2px #22c55e20" : value[i] ? "0 0 0 2px #C9A22720" : "none",
              color: allFilled ? "#22c55e" : "var(--text)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function GoldButton({ loading, disabled, children }: { loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: loading || disabled ? 1 : 1.015 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.985 }}
      className="relative w-full py-3.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold uppercase tracking-widest transition-colors duration-300 shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_35px_rgba(201,162,39,0.55)] overflow-hidden flex items-center justify-center gap-2"
    >
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

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit OTP"); return; }
    setError("");
    setStep("password");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const STEPS: Step[] = ["email", "otp", "password"];
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-dvh flex bg-[var(--bg)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[var(--surface-deep)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(var(--dot-matrix-color) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.3,
          }}
        />
        <motion.div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#C9A227] opacity-[0.07] blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#C9A227] opacity-[0.05] blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-dvh lg:px-12 lg:py-10">
        <motion.div
          className="w-full lg:max-w-xl lg:w-[540px] xl:w-[580px] flex flex-col flex-1 lg:flex-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex-1 lg:flex-none flex flex-col bg-[var(--surface)]/95 lg:bg-[var(--surface)]/98 backdrop-blur-2xl lg:rounded-3xl premium-card overflow-hidden">

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-5 lg:px-10 border-b border-[var(--border)]/60 bg-[var(--surface)] lg:bg-[var(--surface-deep)]/30">
              <MagneticWrapper>
                <Link
                  href="/"
                  className="font-display font-bold text-xl sm:text-2xl text-gold-gradient block transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(201,162,39,0.6)]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  MarketMinds
                </Link>
              </MagneticWrapper>
              <ThemeToggle />
            </div>

            <div className="px-6 py-8 lg:px-10">

              {/* Step indicator */}
              {step !== "done" && (
                <div className="flex items-center gap-2 mb-8">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                        i < stepIndex ? "bg-[#C9A227] text-black" :
                        i === stepIndex ? "bg-[#C9A227]/20 border border-[#C9A227] text-[#C9A227]" :
                        "bg-[var(--border)] text-[var(--text-3)]"
                      }`}>
                        {i < stepIndex ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-px w-8 transition-colors duration-300 ${i < stepIndex ? "bg-[#C9A227]" : "bg-[var(--border)]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">

                {/* ── Step 1: Email ── */}
                {step === "email" && (
                  <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="mb-8">
                      <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                        Forgot password?
                      </h1>
                      <p className="text-sm text-[var(--text-2)]">Enter your email and we&apos;ll send you a reset OTP.</p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleEmail} className="space-y-5">
                      <FadeField delay={0.1}>
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Email Address</label>
                          <input type="email" required autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all" />
                        </div>
                      </FadeField>
                      <FadeField delay={0.2}>
                        <GoldButton loading={loading}>
                          {loading ? (
                            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</>
                          ) : "Send OTP →"}
                        </GoldButton>
                      </FadeField>
                    </form>

                    <FadeField delay={0.3}>
                      <p className="text-center text-sm text-[var(--text-2)] mt-7">
                        Remember it?{" "}
                        <Link href="/login" className="text-[#C9A227] hover:text-[#E8C65A] font-medium transition-colors">Sign in →</Link>
                      </p>
                    </FadeField>
                  </motion.div>
                )}

                {/* ── Step 2: OTP ── */}
                {step === "otp" && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <MagneticWrapper className="inline-block mb-7">
                      <button onClick={() => { setStep("email"); setOtp(Array(6).fill("")); setError(""); }}
                        className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                      </button>
                    </MagneticWrapper>

                    <div className="mb-8 text-center">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-[#C9A22715] border border-[#C9A22730] flex items-center justify-center mx-auto mb-5"
                        animate={{ boxShadow: ["0 0 0 0 #C9A22730", "0 0 0 12px #C9A22700"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth={1.5}>
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                      <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                        Check your email.
                      </h1>
                      <p className="text-sm text-[var(--text-2)] leading-relaxed">
                        We sent a 6-digit code to{" "}
                        <span className="text-[var(--text)] font-medium">{email}</span>
                      </p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleOtp} className="space-y-6">
                      <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
                      <GoldButton loading={false} disabled={otp.join("").length < 6}>
                        Continue →
                      </GoldButton>
                    </form>

                    <div className="mt-6 text-center space-y-1">
                      <p className="text-sm text-[var(--text-2)]">
                        Didn&apos;t receive it?{" "}
                        <button type="button" onClick={() => { setStep("email"); setOtp(Array(6).fill("")); setError(""); }}
                          className="text-[#C9A227] hover:text-[#E8C65A] transition-colors font-medium">
                          Try again
                        </button>
                      </p>
                      <p className="text-[11px] text-[var(--text-3)]">Code expires in 10 minutes</p>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: New Password ── */}
                {step === "password" && (
                  <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="mb-8">
                      <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                        New password
                      </h1>
                      <p className="text-sm text-[var(--text-2)]">Choose a strong password for your account.</p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleReset} className="space-y-5">
                      <FadeField delay={0.1}>
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">New Password</label>
                          <div className="relative">
                            <input type={showPass ? "text" : "password"} required value={password}
                              onChange={(e) => { setPassword(e.target.value); setError(""); }}
                              placeholder="Min 8 chars, uppercase, digit"
                              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all" />
                            <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors p-1">
                              {showPass ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </FadeField>
                      <FadeField delay={0.2}>
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Confirm Password</label>
                          <div className="relative">
                            <input type={showConfirm ? "text" : "password"} required value={confirm}
                              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                              placeholder="Re-enter password"
                              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all" />
                            <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors p-1">
                              {showConfirm ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </FadeField>
                      <FadeField delay={0.3}>
                        <GoldButton loading={loading}>
                          {loading ? (
                            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Resetting…</>
                          ) : "Reset Password →"}
                        </GoldButton>
                      </FadeField>
                    </form>
                  </motion.div>
                )}

                {/* ── Done ── */}
                {step === "done" && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                    className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                    <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      Password reset!
                    </h2>
                    <p className="text-sm text-[var(--text-2)] mb-8">Your password has been updated. You can now sign in.</p>
                    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                      <Link href="/login"
                        className="inline-block px-8 py-3.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] text-black text-sm font-semibold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                        Sign In →
                      </Link>
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
