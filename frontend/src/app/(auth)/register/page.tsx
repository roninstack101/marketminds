"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import MagneticWrapper from "@/components/MagneticWrapper";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ── Particles ─────────────────────────────────────────────────── */
const PARTICLES = [
  { x: 10, y: 25, s: 3, d: 0,   dur: 8.5, vx: 18, vy: -20 },
  { x: 40, y: 60, s: 2, d: 1.3, dur: 10,  vx: -15, vy: -45 },
  { x: 65, y: 28, s: 4, d: 0.7, dur: 7.5, vx: 20, vy: -25 },
  { x: 82, y: 72, s: 2, d: 2.2, dur: 9,   vx: -22, vy: -55 },
  { x: 25, y: 88, s: 3, d: 1.9, dur: 8,   vx: 30, vy: -30 },
  { x: 73, y: 10, s: 2, d: 0.3, dur: 6.5, vx: -20, vy: 25 },
  { x: 52, y: 48, s: 3, d: 3.1, dur: 9.5, vx: 12, vy: -40 },
  { x: 92, y: 35, s: 2, d: 1.6, dur: 7.5, vx: -14, vy: 35 },
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

/* ── Password strength ─────────────────────────────────────────── */
function strengthOf(pwd: string) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  return s;
}
const STRENGTH_COLOR = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];

function PasswordStrength({ password }: { password: string }) {
  const s = strengthOf(password);
  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mt-2 space-y-1.5"
    >
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: s >= i ? "100%" : "0%" }}
              style={{ backgroundColor: s >= i ? STRENGTH_COLOR[s] : "transparent" }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      {s > 0 && (
        <motion.p
          key={s}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-medium"
          style={{ color: STRENGTH_COLOR[s] }}
        >
          {STRENGTH_LABEL[s]} password
        </motion.p>
      )}
    </motion.div>
  );
}

/* ── Field with inline validation check ───────────────────────── */
function Field({
  label, type = "text", name, value, onChange, placeholder, autoComplete, error, valid, suffix,
}: {
  label: string; type?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; autoComplete?: string; error?: string; valid?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">{label}</label>
        <AnimatePresence>
          {valid && !error && (
            <motion.span
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              className="text-emerald-400 text-xs flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative">
        <motion.input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          whileFocus={{ scale: 1.004 }}
          className={`w-full px-4 py-3 ${suffix ? "pr-12" : ""} rounded-xl bg-[var(--input-bg)] border text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none transition-all duration-200 ${
            error
              ? "border-red-500/50 focus:border-red-500/80"
              : valid
              ? "border-emerald-500/40 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718]"
              : "border-[var(--border)] focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718]"
          }`}
        />
        {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── OTP Input ─────────────────────────────────────────────────── */
function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const update = useCallback(
    (idx: number, char: string) => {
      const next = [...value];
      next[idx] = char;
      onChange(next);
      if (char && idx < 5) refs.current[idx + 1]?.focus();
    },
    [value, onChange]
  );

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
        <motion.div
          key={i}
          animate={value[i] ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 0.25, type: "tween", ease: "easeInOut" }}
        >
          <motion.input
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(-1); update(i, c); }}
            onKeyDown={(e) => onKey(i, e)}
            onFocus={(e) => e.target.select()}
            whileFocus={{ scale: 1.1 }}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border bg-[var(--input-bg)] text-[var(--text)] outline-none transition-colors duration-150 cursor-pointer"
            style={{
              borderColor: allFilled ? "#22c55e" : value[i] ? "#C9A227" : "var(--border)",
              boxShadow: allFilled
                ? "0 0 0 2px #22c55e20"
                : value[i]
                ? "0 0 0 2px #C9A22720"
                : "none",
              color: allFilled ? "#22c55e" : "var(--text)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Gold button ───────────────────────────────────────────────── */
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

/* ── Page ──────────────────────────────────────────────────────── */
type FormState = { name: string; email: string; phone: string; password: string; confirmPassword: string; referralCode: string };
type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mouseXPos = useMotionValue(0);
  const mouseYPos = useMotionValue(0);

  const orbX = useTransform(mouseX, [0, 1], [-18, 18]);
  const orbY = useTransform(mouseY, [0, 1], [-18, 18]);

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
      setError("");
    };
  }

  // Per-field live validation
  const valid = {
    name: form.name.trim().length >= 2,
    email: /\S+@\S+\.\S+/.test(form.email),
    phone: /^[6-9]\d{9}$/.test(form.phone),
    password: form.password.length >= 8 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /\d/.test(form.password),
    confirmPassword: form.confirmPassword.length > 0 && form.confirmPassword === form.password,
  };

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!valid.email) errs.email = "Enter a valid email";
    if (!valid.phone) errs.phone = "Valid 10-digit Indian mobile number";
    if (form.password.length < 8) errs.password = "At least 8 characters";
    else if (!valid.password) errs.password = "Include uppercase, lowercase, and a digit";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.toLowerCase(), phone: form.phone, password: form.password, referralCode: form.referralCode.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Registration failed");
      setStep(2); startCooldown();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit OTP"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Verification failed");
      localStorage.setItem("mm_token", data.token);
      localStorage.setItem("mm_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOtp(Array(6).fill("")); startCooldown();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    }
  }

  function startCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((n) => { if (n <= 1) { clearInterval(cooldownRef.current!); return 0; } return n - 1; });
    }, 1000);
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors p-1">
      {show ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  const STEPS = ["Details", "Verify Email", "Dashboard"];

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
        <motion.div
          className="absolute -top-32 -right-32 lg:-right-16 w-80 h-80 rounded-full bg-[#C9A227] opacity-[0.09] blur-3xl pointer-events-none"
          style={{ x: orbX, y: orbY }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#C9A227] opacity-[0.07] blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.14, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
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

          {/* Middle */}
          <div className="relative z-10 space-y-10">
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C9A227]">Join the Circle</p>
              <h2
                className="font-display text-4xl xl:text-5xl font-bold leading-[1.15] text-[var(--text)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Built for those<br />who think<br />exponential.
              </h2>
              <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-xs">
                Join a private network of investors with access to systematic, high-conviction strategies.
              </p>
            </motion.div>

            {/* Animated step roadmap */}
            <div className="space-y-0">
              {STEPS.map((s, i) => {
                const done = (step === 1 && i < 0) || (step === 2 && i === 0) || (step > 2 && i <= 1);
                const active = (step === 1 && i === 0) || (step === 2 && i === 1);
                return (
                  <motion.div
                    key={s}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 py-3 cursor-default transition-transform"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                  >
                    <motion.div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border"
                      animate={active ? { boxShadow: ["0 0 0 0 #C9A22740", "0 0 0 6px #C9A22700"] } : {}}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      style={{
                        backgroundColor: done ? "#C9A22740" : active ? "#C9A227" : "transparent",
                        borderColor: done || active ? "#C9A227" : "var(--border)",
                        color: active ? "#000" : done ? "#C9A227" : "var(--text-3)",
                      }}
                    >
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" strokeLinecap="round" />
                        </svg>
                      ) : (i + 1)}
                    </motion.div>
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${active ? "text-[#C9A227]" : done ? "text-[var(--text-2)]" : "text-[var(--text-3)]"}`}>{s}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="absolute left-[calc(3rem+14px)] w-px bg-[var(--border)]" style={{ height: "24px", marginTop: "28px" }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.p className="relative z-10 text-[10px] text-[var(--text-3)] tracking-wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
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

            {/* Mobile step dots */}
            <div className="relative z-10 lg:hidden flex items-center gap-2 px-6 pt-5 pb-1">
              {[1, 2].map((s) => (
                <motion.div
                  key={s}
                  animate={{ width: s === step ? 24 : 8, backgroundColor: s === step ? "#C9A227" : s < step ? "#C9A22760" : "var(--border)" }}
                  className="h-1.5 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            <div className="px-6 py-6 lg:px-10">
              <AnimatePresence mode="wait">

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div className="mb-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                        Create account.
                      </h1>
                      <p className="text-sm text-[var(--text-2)]">Start your journey with MarketMinds</p>
                    </motion.div>

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

                    <form onSubmit={handleRegister} className="space-y-4">
                      {([
                        { delay: 0.1, field: "name" as const, label: "Full Name", placeholder: "Arjun Sharma", ac: "name" },
                        { delay: 0.18, field: "email" as const, label: "Email", placeholder: "you@example.com", type: "email", ac: "email" },
                        { delay: 0.26, field: "phone" as const, label: "Mobile Number", placeholder: "9876543210", type: "tel", ac: "tel" },
                      ]).map(({ delay, field, label, placeholder, type, ac }) => (
                        <motion.div key={field} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
                          <Field
                            label={label} type={type} name={field} value={form[field]}
                            onChange={set(field)} placeholder={placeholder} autoComplete={ac}
                            error={fieldErrors[field]} valid={valid[field]}
                          />
                        </motion.div>
                      ))}

                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.34 }}>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Reference Code</label>
                            <span className="text-[10px] text-[var(--text-3)] italic">Optional</span>
                          </div>
                          <motion.input
                            type="text" name="referralCode" value={form.referralCode}
                            onChange={set("referralCode")} placeholder="Enter code if you have one"
                            autoComplete="off" whileFocus={{ scale: 1.004 }}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] outline-none transition-all duration-200"
                          />
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.42 }}>
                        <Field
                          label="Password" type={showPass ? "text" : "password"} name="password"
                          value={form.password} onChange={set("password")} placeholder="••••••••"
                          autoComplete="new-password" error={fieldErrors.password} valid={valid.password}
                          suffix={eyeBtn(showPass, () => setShowPass((v) => !v))}
                        />
                        <AnimatePresence>{form.password && <PasswordStrength password={form.password} />}</AnimatePresence>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                        <Field
                          label="Confirm Password" type={showConfirm ? "text" : "password"} name="confirmPassword"
                          value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••"
                          autoComplete="new-password" error={fieldErrors.confirmPassword} valid={valid.confirmPassword}
                          suffix={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))}
                        />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.58 }}>
                        <GoldButton loading={loading}>
                          {loading ? (
                            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>Sending OTP…</>
                          ) : "Continue →"}
                        </GoldButton>
                      </motion.div>
                    </form>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[var(--border)]" />
                        <span className="text-xs text-[var(--text-3)] uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[var(--border)]" />
                      </div>
                      <p className="text-center text-sm text-[var(--text-2)]">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#C9A227] hover:text-[#E8C65A] font-medium transition-colors">Sign in →</Link>
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Step 2 (OTP) ── */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MagneticWrapper className="inline-block mb-7">
                      <button
                        onClick={() => { setStep(1); setError(""); setOtp(Array(6).fill("")); }}
                        className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                      >
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
                        <span className="text-[var(--text)] font-medium">{form.email}</span>
                      </p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <OTPInput value={otp} onChange={setOtp} />

                      <GoldButton loading={loading} disabled={otp.join("").length < 6}>
                        {loading ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>Verifying…</>
                        ) : "Verify & Continue →"}
                      </GoldButton>
                    </form>

                    <div className="mt-6 text-center space-y-1">
                      <p className="text-sm text-[var(--text-2)]">
                        Didn&apos;t receive it?{" "}
                        {resendCooldown > 0 ? (
                          <span className="text-[var(--text-3)]">Resend in {resendCooldown}s</span>
                        ) : (
                          <button onClick={handleResend} className="text-[#C9A227] hover:text-[#E8C65A] font-medium transition-colors">
                            Resend OTP
                          </button>
                        )}
                      </p>
                      <p className="text-[11px] text-[var(--text-3)]">Code expires in 10 minutes</p>
                    </div>
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
