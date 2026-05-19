"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { FilterDropdown } from "@/components/FilterDropdown";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ── Types ─────────────────────────────────────────────────────── */
type User = {
  _id: string; name: string; email: string; phone?: string; role?: string;
  kycStatus?: "none" | "pending" | "approved" | "rejected";
  kycRejectionReason?: string;
  referralGroup?: string;
  bankDetails?: { accountHolderName?: string; accountNumber?: string; ifscCode?: string; bankName?: string; upiId?: string };
};
type Plan = { _id: string; name: string; tagline?: string; description?: string; minAmount: number; maxAmount?: number; durationMonths: number; expectedReturn?: string; features?: string[] };
type Transaction = { _id: string; date?: string; createdAt: string; type: string; description?: string; plan?: { name: string } | null; amount: number; status: string; reference?: string; rejectionReason?: string };
type MemberGain = { _id: string; memberName: string; invested: number; currentValue: number; totalReturnPct: number; monthlyReturnPct: number };
type Settings = { paymentQrCode?: string; paymentInstructions?: string; paymentEmail?: string; paymentUpiId?: string };

/* ── Tabs ───────────────────────────────────────────────────────── */
const TABS = [
  { id: "dashboard",    label: "Dashboard",    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: "plans",        label: "Plans",        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  { id: "transactions", label: "Transactions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { id: "profile",      label: "Profile",      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

/* ── Helpers ────────────────────────────────────────────────────── */
function fmtINR(n: number | undefined | null) { return "₹" + ((n ?? 0) || 0).toLocaleString("en-IN"); }
function safeFixed(n: number | undefined | null, digits = 2) { return ((n ?? 0) || 0).toFixed(digits); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function initials(name: string) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-[var(--border)] rounded-lg animate-pulse ${className}`} />;
}

/* ── KYC status badge ───────────────────────────────────────────── */
function KYCBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    none:     { label: "KYC Required",  cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    pending:  { label: "KYC Pending",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    approved: { label: "KYC Verified",  cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    rejected: { label: "KYC Rejected",  cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const c = cfg[status] ?? cfg.none;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${c.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {c.label}
    </span>
  );
}

/* ── Static fallback data ───────────────────────────────────────── */
const STATIC_DASH = { totalInvested: 0, currentValue: 0, totalReturns: 0, returnsPct: 0, monthlyReturn: 0, monthlyReturnPct: 0 };
const STATIC_GAINS: MemberGain[] = [
  { _id:"1", memberName:"Arjun S.",   invested:500000,  currentValue:847500,  totalReturnPct:69.5, monthlyReturnPct:4.20 },
  { _id:"2", memberName:"Priya M.",   invested:250000,  currentValue:391250,  totalReturnPct:56.5, monthlyReturnPct:3.85 },
  { _id:"3", memberName:"Rahul K.",   invested:750000,  currentValue:1192500, totalReturnPct:59.0, monthlyReturnPct:3.60 },
  { _id:"4", memberName:"Sneha D.",   invested:100000,  currentValue:148000,  totalReturnPct:48.0, monthlyReturnPct:2.90 },
  { _id:"5", memberName:"Vikram B.",  invested:1000000, currentValue:1640000, totalReturnPct:64.0, monthlyReturnPct:4.75 },
  { _id:"6", memberName:"Anita R.",   invested:200000,  currentValue:298000,  totalReturnPct:49.0, monthlyReturnPct:2.45 },
  { _id:"7", memberName:"Karan J.",   invested:300000,  currentValue:477000,  totalReturnPct:59.0, monthlyReturnPct:3.30 },
  { _id:"8", memberName:"Meera P.",   invested:450000,  currentValue:693000,  totalReturnPct:54.0, monthlyReturnPct:3.10 },
  { _id:"9", memberName:"Suresh N.",  invested:600000,  currentValue:966000,  totalReturnPct:61.0, monthlyReturnPct:4.00 },
  { _id:"10",memberName:"Deepika V.", invested:175000,  currentValue:259875,  totalReturnPct:48.5, monthlyReturnPct:2.80 },
];
const STATIC_PLANS: Plan[] = [];

/* ── Purchase Modal ─────────────────────────────────────────────── */
function PurchaseModal({ plan, settings, token, onClose, onSuccess }: {
  plan: Plan; settings: Settings; token: string;
  onClose: () => void; onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(String(plan.minAmount));
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!refId.trim()) { setError("Please enter your payment reference ID"); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < plan.minAmount) { setError(`Minimum investment is ${fmtINR(plan.minAmount)}`); return; }
    if (plan.maxAmount && amt > plan.maxAmount) { setError(`Maximum investment is ${fmtINR(plan.maxAmount)}`); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId: plan._id, amount: amt, referenceId: refId.trim() }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || "Submission failed");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-[var(--surface)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#C9A227] mb-1">Purchase Plan</p>
              <h3 className="font-display text-xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{plan.name}</h3>
            </div>
            <button onClick={onClose} className="p-2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 mb-5 space-y-2.5">
            <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)] font-semibold mb-3">Payment Instructions</p>
            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#C9A227]/15 text-[#C9A227] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Scan the QR code below and pay your chosen amount{settings.paymentUpiId ? ` to UPI ID: ${settings.paymentUpiId}` : ""}.
              </p>
            </div>
            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#C9A227]/15 text-[#C9A227] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                After payment, enter the UPI Reference / Transaction ID below and click <strong>Submit</strong>.
              </p>
            </div>
            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#C9A227]/15 text-[#C9A227] text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                {settings.paymentEmail
                  ? <>Email a screenshot of your successful payment to <span className="text-[#C9A227] font-medium">{settings.paymentEmail}</span> with your Reference ID in the subject.</>
                  : "Email a screenshot of your successful payment to admin with your Reference ID in the subject."}
              </p>
            </div>
            {settings.paymentInstructions && (
              <p className="text-xs text-[var(--text-3)] pt-1 border-t border-[var(--border)] mt-2">{settings.paymentInstructions}</p>
            )}
          </div>

          {/* QR */}
          {settings.paymentQrCode ? (
            <div className="flex justify-center mb-5">
              <div className="border-2 border-[#C9A227]/30 rounded-2xl p-3 bg-white inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.paymentQrCode} alt="Payment QR" width={160} height={160} className="rounded-xl w-40 h-40 object-contain" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-5">
              <div className="w-40 h-40 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center gap-2">
                <svg className="w-8 h-8 text-[var(--text-3)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path strokeLinecap="round" d="M14 14h2m2 0h1m-3 2v2m2 0h1" /></svg>
                <p className="text-[9px] text-[var(--text-3)] uppercase tracking-wider text-center">QR not set<br />by admin yet</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">
                Investment Amount <span className="text-[var(--text-3)] normal-case tracking-normal">(min {fmtINR(plan.minAmount)}{plan.maxAmount ? ` – max ${fmtINR(plan.maxAmount)}` : "+"})</span>
              </label>
              <input
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                min={plan.minAmount} max={plan.maxAmount}
                className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">UPI Reference / Transaction ID</label>
              <input
                type="text" value={refId} onChange={(e) => setRefId(e.target.value)} placeholder="e.g. 423892849234"
                className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all placeholder:text-[var(--text-3)]"
              />
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-3.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-widest transition-colors relative overflow-hidden"
            >
              {loading ? "Submitting…" : "Submit Payment Request →"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Dashboard state
  const [dashData, setDashData] = useState(STATIC_DASH);
  const [dashLoading, setDashLoading] = useState(true);
  const [memberGains, setMemberGains] = useState<MemberGain[]>([]);
  const [gainsLoading, setGainsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({});
  const [purchaseTarget, setPurchaseTarget] = useState<Plan | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txStatusFilter, setTxStatusFilter] = useState("all");

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", referralCode: "" });
  const [bankForm, setBankForm] = useState({ accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [bankMsg, setBankMsg] = useState("");
  const [kycMsg, setKycMsg] = useState("");

  /* ── Auth check ── */
  useEffect(() => {
    const t = localStorage.getItem("mm_token");
    const u = localStorage.getItem("mm_user");
    if (!t || !u) { router.replace("/login"); return; }
    const parsed = JSON.parse(u) as User;
    if (parsed.role === "admin") { router.replace("/admin"); return; }
    setToken(t);
    setUser(parsed);
    setProfileForm({ name: parsed.name, email: parsed.email, phone: parsed.phone || "", referralCode: "" });
    if (parsed.bankDetails) setBankForm({ ...{ accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "" }, ...parsed.bankDetails });
  }, [router]);

  /* ── Fetch fresh user (KYC status etc.) ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const u = d.user as User;
          setUser(u);
          localStorage.setItem("mm_user", JSON.stringify(u));
          setProfileForm({ name: u.name, email: u.email, phone: u.phone || "", referralCode: "" });
          if (u.bankDetails) setBankForm({ accountHolderName: u.bankDetails.accountHolderName || "", accountNumber: u.bankDetails.accountNumber || "", ifscCode: u.bankDetails.ifscCode || "", bankName: u.bankDetails.bankName || "", upiId: u.bankDetails.upiId || "" });
        }
      })
      .catch(() => {});
  }, [token]);

  /* ── Fetch dashboard + gains ── */
  useEffect(() => {
    if (!token) return;
    setDashLoading(true);
    fetch(`${API}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setDashData({ ...STATIC_DASH, ...d.data }); })
      .catch(() => {})
      .finally(() => setDashLoading(false));

    function fetchGains() {
      fetch(`${API}/api/dashboard/gains`, { headers: { Authorization: `Bearer ${token!}` } })
        .then((r) => r.json())
        .then((d) => { if (d.success) setMemberGains(d.data ?? []); else setMemberGains(STATIC_GAINS); })
        .catch(() => setMemberGains(STATIC_GAINS))
        .finally(() => { setGainsLoading(false); setLastUpdated(new Date()); });
    }
    fetchGains();
    const id = setInterval(fetchGains, 60000);
    return () => clearInterval(id);
  }, [token]);

  /* ── Fetch plans + settings when Plans tab opens ── */
  useEffect(() => {
    if (tab !== "plans" || !token) return;
    setPlansLoading(true);
    Promise.all([
      fetch(`${API}/api/plans`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([p, s]) => {
        setPlans(p.success && p.data?.length ? p.data : []);
        if (s.success && s.data) setSettings(s.data);
      })
      .catch(() => setPlans(STATIC_PLANS))
      .finally(() => setPlansLoading(false));
  }, [tab, token]);

  /* ── Fetch transactions ── */
  useEffect(() => {
    if (tab !== "transactions" || !token) return;
    setTxLoading(true);
    fetch(`${API}/api/purchases`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setTransactions(d.data ?? []); })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [tab, token]);

  /* ── Profile save ── */
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true); setProfileMsg("");
    try {
      const body: Record<string, string> = { name: profileForm.name, phone: profileForm.phone };
      if (profileForm.referralCode.trim()) body.referralCode = profileForm.referralCode.trim();
      const res = await fetch(`${API}/api/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.success) { setUser((u) => u ? { ...u, name: d.user.name, phone: d.user.phone, referralGroup: d.user.referralGroup } : u); localStorage.setItem("mm_user", JSON.stringify(d.user)); setProfileForm(f => ({ ...f, referralCode: "" })); setProfileMsg("saved"); }
      else setProfileMsg(d.message || "Error");
    } catch { setProfileMsg("Error saving"); }
    finally { setProfileSaving(false); setTimeout(() => setProfileMsg(""), 3000); }
  }

  /* ── Bank details save ── */
  async function saveBank(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBankSaving(true); setBankMsg("");
    try {
      const res = await fetch(`${API}/api/user/bank-details`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(bankForm) });
      const d = await res.json();
      if (d.success) { setUser((u) => u ? { ...u, bankDetails: d.bankDetails } : u); setBankMsg("saved"); }
      else setBankMsg(d.message || "Error");
    } catch { setBankMsg("Error saving"); }
    finally { setBankSaving(false); setTimeout(() => setBankMsg(""), 3000); }
  }

  /* ── KYC submit ── */
  async function submitKYC() {
    if (!token) return;
    setKycSubmitting(true); setKycMsg("");
    try {
      const res = await fetch(`${API}/api/user/kyc/submit`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) { setUser((u) => u ? { ...u, kycStatus: "pending" } : u); setKycMsg("submitted"); }
      else setKycMsg(d.message || "Error");
    } catch { setKycMsg("Error submitting"); }
    finally { setKycSubmitting(false); setTimeout(() => setKycMsg(""), 4000); }
  }

  function logout() { localStorage.removeItem("mm_token"); localStorage.removeItem("mm_user"); router.replace("/login"); }

  if (!user) return null;

  const kycApproved = user.kycStatus === "approved";

  return (
    <div className="flex h-dvh bg-[var(--bg)] overflow-hidden">

      {/* Sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 bg-black/70 z-20 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)] flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 relative flex-shrink-0"><Image src="/logo.png" alt="MarketMinds" fill className="object-contain" /></div>
            <span className="text-sm font-bold text-gold-gradient" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>MarketMinds</span>
          </Link>
          <button className="lg:hidden p-1.5 text-[var(--text-3)]" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-4 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C9A227]/12 border border-[#C9A227]/25 flex items-center justify-center text-[#C9A227] text-xs font-bold flex-shrink-0">{initials(user.name)}</div>
            <div className="min-w-0">
              <p className="text-[var(--text)] text-xs font-semibold truncate">{user.name}</p>
              <div className="mt-0.5"><KYCBadge status={user.kycStatus || "none"} /></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => {
                if (tab !== t.id) {
                  if (t.id === "plans") setPlansLoading(true);
                  if (t.id === "transactions") setTxLoading(true);
                  setTab(t.id);
                }
                setSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-widest transition-colors duration-150 ${tab === t.id ? "text-[#C9A227]" : "text-[var(--text-3)] hover:text-[var(--text)]"}`}>
              <AnimatePresence>
                {tab === t.id && (
                  <motion.div
                    key="pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 rounded-xl bg-[#C9A227]/8 border border-[#C9A227]/18 pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 flex-shrink-0">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex-shrink-0 px-3 pt-4 border-t border-[var(--border)] space-y-1"
          style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/5 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-[var(--text-3)]" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)]">{TABS.find((t) => t.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/5 transition-all border border-[var(--border)]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="p-5 sm:p-8 w-full">

              {/* ── DASHBOARD ───────────────────────────────────── */}
              {tab === "dashboard" && (
                <div className="space-y-6">
                  {/* KYC banner */}
                  {!kycApproved && (
                    <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${user.kycStatus === "rejected" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                      <div className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${user.kycStatus === "rejected" ? "text-red-400" : "text-amber-500"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                          <p className={`text-sm font-semibold ${user.kycStatus === "rejected" ? "text-red-400" : "text-amber-500"}`}>
                            {user.kycStatus === "pending" ? "KYC Under Review" : user.kycStatus === "rejected" ? "KYC Rejected" : "KYC Required to Invest"}
                          </p>
                          <p className="text-xs text-[var(--text-3)] mt-0.5">
                            {user.kycStatus === "pending" ? "Your KYC is being reviewed. You'll be notified once approved." :
                             user.kycStatus === "rejected" ? `Reason: ${user.kycRejectionReason || "Not specified"}. Update your bank details and resubmit.` :
                             "Complete your KYC in Profile to purchase investment plans."}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setTab("profile")} className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] hover:text-[#E8C65A] whitespace-nowrap transition-colors">
                        {user.kycStatus === "rejected" ? "Resubmit →" : "Go to Profile →"}
                      </button>
                    </div>
                  )}

                  {/* Greeting */}
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                      <span className="text-gold-gradient">{user.name.split(" ")[0]}.</span>
                    </h2>
                    <p className="text-xs text-[var(--text-3)] mt-1 uppercase tracking-widest">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Invested Amount", value: fmtINR(dashData.totalInvested), sub: "Total capital deployed" },
                      { label: "Current Value",   value: fmtINR(dashData.currentValue),  sub: `${(dashData.returnsPct ?? 0) >= 0 ? "+" : ""}${fmtINR(dashData.totalReturns)} overall`, accent: true },
                      { label: "Total Returns",   value: `${(dashData.returnsPct ?? 0) >= 0 ? "+" : ""}${safeFixed(dashData.returnsPct)}%`, sub: fmtINR(dashData.totalReturns) + " gain", accent: true },
                      { label: "Monthly Return",  value: `${(dashData.monthlyReturnPct ?? 0) >= 0 ? "+" : ""}${safeFixed(dashData.monthlyReturnPct)}%`, sub: `${(dashData.monthlyReturnPct ?? 0) >= 0 ? "+" : ""}${fmtINR(dashData.monthlyReturn)} this month`, accent: true },
                    ].map((c) => (
                      <div key={c.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[#C9A227]/20 transition-colors">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-3)] mb-3">{c.label}</p>
                        {dashLoading ? <><Skeleton className="h-7 w-20 mb-2" /><Skeleton className="h-3 w-14" /></> : (
                          <>
                            <p className={`font-display text-2xl font-bold mb-1 ${c.accent ? "text-gold-gradient" : "text-[var(--text)]"}`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{c.value}</p>
                            <p className="text-[10px] text-[var(--text-3)]">{c.sub}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Live member gains */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="px-5 sm:px-7 py-4 border-b border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)] font-semibold">Member Performance</h3>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Live
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {lastUpdated && <span className="text-[9px] text-[var(--text-3)] uppercase tracking-wider hidden sm:block">Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
                        <span className="text-[9px] text-[var(--text-3)] uppercase tracking-wider">Top 10</span>
                      </div>
                    </div>
                    {gainsLoading ? (
                      <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
                    ) : (memberGains.length === 0 ? STATIC_GAINS : memberGains).slice(0, 10).length === 0 ? (
                      <div className="py-12 text-center"><p className="text-[var(--text-3)] text-sm">No data published yet</p></div>
                    ) : (
                      <table className="w-full">
                        <thead><tr className="border-b border-[var(--border)]">
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium hidden sm:table-cell">#</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium">Member</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium">Invested</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium">Return</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium hidden sm:table-cell">Current Value</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium hidden sm:table-cell">Total Return</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] font-medium hidden sm:table-cell">This Month</th>
                        </tr></thead>
                        <tbody>
                          {(memberGains.length > 0 ? memberGains : STATIC_GAINS).slice(0, 10).map((row, i) => (
                            <tr key={row._id} className="border-b border-[var(--border)]/40 hover:bg-[var(--bg)] transition-colors">
                              <td className="px-4 sm:px-6 py-3.5 text-[var(--text-3)] text-xs w-8 hidden sm:table-cell">{i + 1}</td>
                              <td className="px-4 sm:px-6 py-3.5 text-[var(--text)] text-sm font-semibold">{row.memberName}</td>
                              <td className="px-4 sm:px-6 py-3.5 text-[var(--text-2)] text-sm">{fmtINR(row.invested)}</td>
                              <td className="px-4 sm:px-6 py-3.5"><span className="text-emerald-500 text-sm font-bold">+{fmtINR(row.currentValue - row.invested)}</span></td>
                              <td className="px-4 sm:px-6 py-3.5 text-[var(--text)] text-sm font-medium hidden sm:table-cell">{fmtINR(row.currentValue)}</td>
                              <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell"><span className="text-[#C9A227] text-sm font-bold">+{safeFixed(row.totalReturnPct, 1)}%</span></td>
                              <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell"><span className={`text-sm font-bold ${(row.monthlyReturnPct ?? 0) >= 0 ? "text-emerald-500" : "text-red-400"}`}>{(row.monthlyReturnPct ?? 0) >= 0 ? "+" : ""}{safeFixed(row.monthlyReturnPct)}%</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ── PLANS ───────────────────────────────────────── */}
              {tab === "plans" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Investment Plans</h2>
                    <p className="text-xs text-[var(--text-3)] mt-1 uppercase tracking-widest">Select a plan to start investing</p>
                  </div>

                  {/* KYC gate notice */}
                  {!kycApproved && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-xs text-amber-500">
                        {user.kycStatus === "pending" ? "Your KYC is under review. You can browse plans but cannot purchase until approved." : "Complete KYC in Profile to purchase plans."}
                      </p>
                    </div>
                  )}

                  {plansLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{[1,2,3].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {plans.map((plan, i) => (
                        <motion.div key={plan._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className="bg-[var(--surface)] border border-[var(--border)] hover:border-[#C9A227]/25 rounded-2xl p-6 flex flex-col transition-all duration-300 group">
                          {plan.tagline && <p className="text-[9px] uppercase tracking-[0.25em] text-[#C9A227] mb-3">{plan.tagline}</p>}
                          <h3 className="font-display text-2xl font-bold text-[var(--text)] mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{plan.name}</h3>
                          {plan.description && <p className="text-xs text-[var(--text-3)] leading-relaxed mb-4">{plan.description}</p>}

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[var(--bg)] rounded-xl p-3">
                              <p className="text-[9px] uppercase tracking-wider text-[var(--text-3)] mb-1">Min. Investment</p>
                              <p className="text-sm font-bold text-[var(--text)]">{fmtINR(plan.minAmount)}</p>
                            </div>
                            <div className="bg-[var(--bg)] rounded-xl p-3">
                              <p className="text-[9px] uppercase tracking-wider text-[var(--text-3)] mb-1">Expected Return</p>
                              <p className="text-sm font-bold text-[#C9A227]">{plan.expectedReturn || "—"}</p>
                            </div>
                          </div>

                          {plan.features && plan.features.length > 0 && (
                            <ul className="space-y-1.5 mb-5 flex-1">
                              {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                                  <svg className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="gold-line mb-4" />
                          <button
                            onClick={() => { if (kycApproved) setPurchaseTarget(plan); else setTab("profile"); }}
                            className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 ${kycApproved ? "bg-[#C9A227] hover:bg-[#E8C65A] text-black" : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-3)] cursor-not-allowed"}`}
                          >
                            {kycApproved ? "Purchase Plan →" : user.kycStatus === "pending" ? "KYC Pending" : "Complete KYC First"}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TRANSACTIONS ────────────────────────────────── */}
              {tab === "transactions" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Transactions</h2>
                    <p className="text-xs text-[var(--text-3)] mt-0.5 uppercase tracking-widest">Tap a row to see full details</p>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                    <FilterDropdown
                      label="Type"
                      value={txTypeFilter}
                      onChange={setTxTypeFilter}
                      className="flex-1"
                      options={[
                        { value: "all",          label: "All Types" },
                        { value: "plan_purchase", label: "Purchase"  },
                        { value: "profit",        label: "Profit"    },
                      ]}
                    />
                    <FilterDropdown
                      label="Status"
                      value={txStatusFilter}
                      onChange={setTxStatusFilter}
                      className="flex-1"
                      options={[
                        { value: "all",       label: "All Statuses" },
                        { value: "completed", label: "Completed"    },
                        { value: "pending",   label: "Pending"      },
                        { value: "failed",    label: "Failed"       },
                      ]}
                    />
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    {txLoading ? (
                      <div className="p-6 space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                    ) : transactions.length === 0 ? (
                      <div className="py-16 text-center space-y-2">
                        <p className="text-[var(--text-3)] text-sm">No transactions yet</p>
                        <button onClick={() => setTab("plans")} className="text-[10px] uppercase tracking-widest text-[#C9A227] hover:text-[#E8C65A] transition-colors">Browse Plans →</button>
                      </div>
                    ) : (() => {
                      const filtered = transactions.filter(tx =>
                        (txTypeFilter === "all" || tx.type === txTypeFilter) &&
                        (txStatusFilter === "all" || tx.status === txStatusFilter)
                      );
                      return filtered.length === 0 ? (
                        <div className="py-16 text-center">
                          <p className="text-[var(--text-3)] text-sm">No transactions match the selected filters</p>
                        </div>
                      ) : (
                      <div>
                        {filtered.map((tx, i) => {
                          const isPurchase = tx.type === "plan_purchase";
                          const isProfit   = tx.type === "profit";
                          const statusCls  = tx.status === "completed" ? "text-emerald-500"
                                           : tx.status === "pending"   ? "text-blue-400"
                                           : "text-red-400";
                          return (
                            <motion.button key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                              onClick={() => setSelectedTx(tx)}
                              className="w-full flex items-center gap-4 px-5 py-4 border-b border-[var(--border)]/40 hover:bg-[var(--bg)] active:bg-[var(--bg)] transition-colors text-left last:border-0">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isProfit ? "bg-emerald-500/10" : isPurchase ? "bg-[#C9A227]/10" : "bg-[var(--border)]"}`}>
                                {isProfit ? (
                                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" /></svg>
                                ) : (
                                  <svg className="w-4 h-4 text-[#C9A227]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                )}
                              </div>
                              {/* Label */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--text)] truncate">
                                  {tx.plan?.name ?? (tx.description?.replace(/\s*\(50%[^)]*\)/gi, "").trim() || (isPurchase ? "Plan Purchase" : "Profit Credit"))}
                                </p>
                                <p className="text-[10px] text-[var(--text-3)] mt-0.5">{fmtDate(tx.createdAt)}</p>
                              </div>
                              {/* Amount + status */}
                              <div className="text-right flex-shrink-0">
                                <p className={`text-sm font-bold ${isProfit ? "text-emerald-500" : "text-[var(--text)]"}`}>
                                  {isProfit ? "+" : ""}{fmtINR(tx.amount)}
                                </p>
                                <p className={`text-[10px] font-medium mt-0.5 capitalize ${statusCls}`}>{tx.status}</p>
                              </div>
                              <svg className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </motion.button>
                          );
                        })}
                      </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── PROFILE ─────────────────────────────────────── */}
              {tab === "profile" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Profile</h2>
                    <p className="text-xs text-[var(--text-3)] mt-0.5 uppercase tracking-widest">Manage your account</p>
                  </div>

                  {/* Avatar — full width */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#C9A227]/12 border-2 border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xl flex-shrink-0">{initials(user.name)}</div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{user.name}</h3>
                      <p className="text-[var(--text-3)] text-xs mt-0.5">{user.email}</p>
                      <div className="mt-2"><KYCBadge status={user.kycStatus || "none"} /></div>
                    </div>
                  </div>

                  {/* Row 1: Personal Info | Bank Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Left — Personal info */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)] mb-5">Personal Information</h3>
                      <form onSubmit={saveProfile} className="space-y-4">
                        {[
                          { label: "Full Name",     key: "name"  as const, type: "text",  ac: "name"  },
                          { label: "Email Address", key: "email" as const, type: "email", ac: "email", disabled: true },
                          { label: "Mobile Number", key: "phone" as const, type: "tel",   ac: "tel"   },
                        ].map(({ label, key, type, ac, disabled }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">{label}</label>
                            <input type={type} autoComplete={ac} disabled={disabled} value={profileForm[key]} onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                        ))}

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">Reference Code</label>
                            {user.referralGroup && <span className="text-[10px] italic text-[var(--text-3)]">Already set</span>}
                          </div>
                          {user.referralGroup ? (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)]">
                              <span className="w-2 h-2 rounded-full bg-[#6366F1] flex-shrink-0" />
                              <span className="text-sm text-[var(--text)] capitalize font-medium">{user.referralGroup}&apos;s Group</span>
                            </div>
                          ) : (
                            <input type="text" placeholder="Enter code if you have one" autoComplete="off"
                              value={profileForm.referralCode}
                              onChange={(e) => setProfileForm((f) => ({ ...f, referralCode: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all placeholder:text-[var(--text-3)]" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button type="submit" disabled={profileSaving} className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-widest transition-colors">
                            {profileSaving ? "Saving…" : "Save"}
                          </button>
                          {profileMsg === "saved" && <span className="text-xs text-emerald-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>Saved</span>}
                          {profileMsg && profileMsg !== "saved" && <span className="text-xs text-red-400">{profileMsg}</span>}
                        </div>
                      </form>
                    </div>

                    {/* Right — Bank details */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)] mb-1">Bank Details & UPI</h3>
                      <p className="text-[10px] text-[var(--text-3)] mb-5">Required for KYC verification</p>
                      <form onSubmit={saveBank} className="space-y-4">
                        {[
                          { label: "Account Holder Name", key: "accountHolderName" as const, placeholder: "As per bank records" },
                          { label: "Account Number",      key: "accountNumber"     as const, placeholder: "12-digit account number" },
                          { label: "IFSC Code",           key: "ifscCode"          as const, placeholder: "e.g. HDFC0001234" },
                          { label: "Bank Name",           key: "bankName"          as const, placeholder: "e.g. HDFC Bank" },
                          { label: "UPI ID",              key: "upiId"             as const, placeholder: "e.g. name@upi" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-[var(--text-2)]">{label}</label>
                            <input type="text" placeholder={placeholder} value={bankForm[key]} onChange={(e) => setBankForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A22718] transition-all placeholder:text-[var(--text-3)]" />
                          </div>
                        ))}
                        <div className="flex items-center gap-3 pt-1">
                          <button type="submit" disabled={bankSaving} className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-widest transition-colors">
                            {bankSaving ? "Saving…" : "Save Bank Details"}
                          </button>
                          {bankMsg === "saved" && <span className="text-xs text-emerald-500">Saved</span>}
                          {bankMsg && bankMsg !== "saved" && <span className="text-xs text-red-400">{bankMsg}</span>}
                        </div>
                      </form>
                    </div>

                  </div>

                  {/* Row 2: KYC | Session */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* KYC */}
                    <div className={`border rounded-2xl p-6 ${user.kycStatus === "approved" ? "bg-emerald-500/5 border-emerald-500/20" : user.kycStatus === "pending" ? "bg-blue-500/5 border-blue-500/20" : "bg-[var(--surface)] border-[var(--border)]"}`}>
                      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)] mb-1">KYC Verification</h3>
                      <p className="text-[10px] text-[var(--text-3)] mb-4">
                        {user.kycStatus === "approved" ? "Your KYC is verified. You can purchase investment plans." :
                         user.kycStatus === "pending"  ? "KYC is under admin review. You'll receive an email once reviewed." :
                         user.kycStatus === "rejected" ? `Rejected: ${user.kycRejectionReason || "No reason provided"}. Update bank details and resubmit.` :
                         "Save your bank details above, then submit for KYC review. Admin will review and send you an email."}
                      </p>
                      {user.kycStatus !== "approved" && user.kycStatus !== "pending" && (
                        <div className="flex items-center gap-3">
                          <button onClick={submitKYC} disabled={kycSubmitting || !bankForm.accountNumber || !bankForm.upiId}
                            className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#E8C65A] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-widest transition-colors">
                            {kycSubmitting ? "Submitting…" : user.kycStatus === "rejected" ? "Resubmit KYC →" : "Submit for KYC Review →"}
                          </button>
                          {kycMsg === "submitted" && <span className="text-xs text-emerald-500">Submitted for review</span>}
                          {kycMsg && kycMsg !== "submitted" && <span className="text-xs text-red-400">{kycMsg}</span>}
                        </div>
                      )}
                    </div>

                    {/* Session */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)] mb-4">Session</h3>
                      <button onClick={logout} className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/8 text-xs font-medium uppercase tracking-widest transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Transaction detail drawer */}
      <AnimatePresence>
        {selectedTx && (() => {
          const tx = selectedTx;
          const isPurchase = tx.type === "plan_purchase";
          const isProfit   = tx.type === "profit";
          const statusCls  = tx.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                           : tx.status === "pending"   ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                           : "bg-red-500/10 text-red-400 border-red-500/20";
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedTx(null)}>
              <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div
                initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full sm:max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl"
                style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
                </div>
                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#C9A227]">Transaction Detail</p>
                  <button onClick={() => setSelectedTx(null)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Amount hero */}
                <div className="px-6 pb-5 border-b border-[var(--border)]">
                  <p className={`font-display text-4xl font-bold ${isProfit ? "text-emerald-500" : "text-[var(--text)]"}`}
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {isProfit ? "+" : ""}{fmtINR(tx.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${isPurchase ? "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                      {isPurchase ? "Purchase" : isProfit ? "Profit" : tx.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusCls}`}>{tx.status}</span>
                  </div>
                </div>


                {/* Details rows */}
                <div className="px-6 py-4 space-y-4">
                  {[
                    { label: "Date",        value: fmtDate(tx.createdAt) },
                    { label: "Description", value: tx.plan?.name ?? (tx.description?.replace(/\s*\(50%[^)]*\)/gi, "").trim() || "—") },
                    ...(!isProfit ? [{ label: "Reference ID", value: tx.reference || "—", mono: true }] : []),
                    ...(tx.status === "failed" && tx.rejectionReason ? [{ label: "Rejection Reason", value: tx.rejectionReason, red: true }] : []),
                  ].map(({ label, value, mono, red }: { label: string; value: string; mono?: boolean; red?: boolean }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-3)] flex-shrink-0 pt-0.5">{label}</p>
                      <p className={`text-sm text-right ${mono ? "font-mono text-[var(--text-2)]" : red ? "text-red-400" : "text-[var(--text)] font-medium"}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Purchase modal */}
      <AnimatePresence>
        {purchaseTarget && !purchaseSuccess && token && (
          <PurchaseModal plan={purchaseTarget} settings={settings} token={token}
            onClose={() => setPurchaseTarget(null)}
            onSuccess={() => { setPurchaseSuccess(true); setTimeout(() => { setPurchaseSuccess(false); setPurchaseTarget(null); setTab("transactions"); }, 2500); }}
          />
        )}
        {purchaseSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--surface)] border border-emerald-500/30 rounded-3xl p-10 text-center max-w-sm mx-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Request Submitted</h3>
              <p className="text-xs text-[var(--text-3)] leading-relaxed">Your payment request has been submitted. Admin will review and confirm. Don&apos;t forget to email your payment screenshot.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
