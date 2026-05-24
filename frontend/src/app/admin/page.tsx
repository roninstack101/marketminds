"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FilterDropdown } from "@/components/FilterDropdown";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
  kycRejectionReason?: string;
  kycSubmittedAt?: string;
  createdAt: string;
  phone?: string;
  referralGroup?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
    upiId?: string;
  };
}

interface Plan {
  _id: string;
  name: string;
  tagline?: string;
  description?: string;
  minAmount: number;
  maxAmount?: number;
  durationMonths: number;
  expectedReturn?: string;
  features: string[];
  isActive: boolean;
  order: number;
}

interface Purchase {
  _id: string;
  user: { _id: string; name: string; email: string };
  plan: { _id: string; name: string };
  amount: number;
  reference: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

interface MemberGain {
  _id: string;
  memberName: string;
  invested: number;
  currentValue: number;
  totalReturnPct: number;
  monthlyReturnPct: number;
  isPublished: boolean;
  publishedAt?: string;
}

interface Settings {
  paymentQrCode?: string;
  paymentInstructions?: string;
  paymentEmail?: string;
  paymentUpiId?: string;
}

const NAV_ITEMS = [
  { label: "Users",    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: "KYC",     icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { label: "Plans",   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { label: "Payments",icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { label: "Profit",  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "Settings",icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: "Gains",   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
];

function kycBadge(s: string) {
  const m: Record<string, string> = {
    none:     "bg-[var(--border)] text-[var(--text-3)]",
    pending:  "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    approved: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    rejected: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
  };
  return m[s] ?? m.none;
}
function statusBadge(s: string) {
  const m: Record<string, string> = {
    pending:   "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    completed: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    failed:    "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
  };
  return m[s] ?? "";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtAmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function initials(name: string) {
  return (name || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

const inputCls = "w-full bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-4)] text-sm rounded-xl px-4 py-3 outline-none focus:border-[#C9A227]/40 transition-colors";
const labelCls = "block text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)] mb-2";

function Spinner() {
  return <div className="text-center py-16 text-[var(--text-3)] text-xs uppercase tracking-wider">Loading…</div>;
}
function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-16 text-[var(--text-3)] text-xs uppercase tracking-wider">{msg}</div>;
}

export default function AdminPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Users");
  const [token, setToken] = useState("");

  // per-tab data
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [kycList, setKycList] = useState<User[]>([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycFilter, setKycFilter] = useState("pending");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchaseFilter, setPurchaseFilter] = useState("pending");

  const [settings, setSettings] = useState<Settings>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const [gains, setGains] = useState<MemberGain[]>([]);
  const [gainsLoading, setGainsLoading] = useState(false);

  // modal state
  const [kycModal, setKycModal] = useState<{ user: User; action: "approve" | "reject" } | null>(null);
  const [kycReason, setKycReason] = useState("");
  const [kycBusy, setKycBusy] = useState(false);

  const [planModal, setPlanModal] = useState<Partial<Plan> | null>(null);
  const [planBusy, setPlanBusy] = useState(false);

  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [purchaseBusy, setPurchaseBusy] = useState(false);

  const [profitMode, setProfitMode] = useState<"single" | "bulk">("single");
  const [profitUserId, setProfitUserId] = useState("");
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [profitAmt, setProfitAmt] = useState("");
  const [profitNote, setProfitNote] = useState("");
  const [profitBusy, setProfitBusy] = useState(false);
  const [profitMsg, setProfitMsg] = useState("");

  const [gainModal, setGainModal] = useState<Partial<MemberGain> | null>(null);
  const [gainBusy, setGainBusy] = useState(false);

  // add / delete user modals
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [addUserBusy, setAddUserBusy] = useState(false);
  const [addUserMsg, setAddUserMsg] = useState("");
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [deleteUserReason, setDeleteUserReason] = useState("");
  const [deleteUserBusy, setDeleteUserBusy] = useState(false);

  // search + filter states
  const [userSearch, setUserSearch] = useState("");
  const [userKycFilter, setUserKycFilter] = useState("all");
  const [paySearch, setPaySearch] = useState("");
  const [gainsSearch, setGainsSearch] = useState("");
  const [gainsPublishFilter, setGainsPublishFilter] = useState("all");
  const [bulkSearch, setBulkSearch] = useState("");
  const [profitGroupFilter, setProfitGroupFilter] = useState("all");

  // auth
  useEffect(() => {
    const t = localStorage.getItem("mm_token");
    const u = localStorage.getItem("mm_user");
    if (!t || !u) { router.replace("/login"); return; }
    try {
      const parsed = JSON.parse(u);
      if (parsed.role !== "admin") { router.replace("/dashboard"); return; }
      setToken(t);
    } catch { router.replace("/login"); }
  }, [router]);

  const h = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // fetchers
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/users`, { headers: h() });
      const d = await r.json();
      if (d.success) setUsers(d.users ?? d.data ?? []);
    } catch { /* backend unreachable */ } finally { setUsersLoading(false); }
  }, [token, h]);

  const fetchKYC = useCallback(async (filter: string) => {
    if (!token) return;
    setKycLoading(true);
    try {
      const q = filter === "all" ? "" : `?status=${filter}`;
      const r = await fetch(`${API}/api/admin/kyc${q}`, { headers: h() });
      const d = await r.json();
      if (d.success) setKycList(d.data ?? []);
    } catch { /* backend unreachable */ } finally { setKycLoading(false); }
  }, [token, h]);

  const fetchPlans = useCallback(async () => {
    if (!token) return;
    setPlansLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/plans`, { headers: h() });
      const d = await r.json();
      if (d.success) setPlans(d.data ?? []);
    } catch { /* backend unreachable */ } finally { setPlansLoading(false); }
  }, [token, h]);

  const fetchPurchases = useCallback(async (filter: string) => {
    if (!token) return;
    setPurchasesLoading(true);
    try {
      const q = filter === "all" ? "" : `?status=${filter}`;
      const r = await fetch(`${API}/api/admin/purchases${q}`, { headers: h() });
      const d = await r.json();
      if (d.success) setPurchases(d.data ?? []);
    } catch { /* backend unreachable */ } finally { setPurchasesLoading(false); }
  }, [token, h]);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setSettingsLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/settings`, { headers: h() });
      const d = await r.json();
      if (d.success) setSettings(d.data || {});
    } catch { /* backend unreachable */ } finally { setSettingsLoading(false); }
  }, [token, h]);

  const fetchGains = useCallback(async () => {
    if (!token) return;
    setGainsLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/member-gains`, { headers: h() });
      const d = await r.json();
      if (d.success) setGains(d.data ?? []);
    } catch { /* backend unreachable */ } finally { setGainsLoading(false); }
  }, [token, h]);

  // load on tab switch
  useEffect(() => {
    if (!token) return;
    if (activeTab === "Users") fetchUsers();
    if (activeTab === "KYC") fetchKYC(kycFilter);
    if (activeTab === "Plans") fetchPlans();
    if (activeTab === "Payments") fetchPurchases(purchaseFilter);
    if (activeTab === "Profit" && users.length === 0) fetchUsers();
    if (activeTab === "Settings") fetchSettings();
    if (activeTab === "Gains") fetchGains();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  function switchTab(t: string) {
    if (activeTab !== t) {
      if (t === "Users") setUsersLoading(true);
      if (t === "KYC") setKycLoading(true);
      if (t === "Plans") setPlansLoading(true);
      if (t === "Payments") setPurchasesLoading(true);
      if (t === "Settings") setSettingsLoading(true);
      if (t === "Gains") setGainsLoading(true);
      setActiveTab(t);
    }
    setSidebarOpen(false);
  }

  // KYC handlers
  async function doKYCReview() {
    if (!kycModal || kycBusy) return;
    if (kycModal.action === "reject" && !kycReason.trim()) return;
    setKycBusy(true);
    try {
      await fetch(`${API}/api/admin/kyc/${kycModal.user._id}`, {
        method: "PATCH", headers: h(),
        body: JSON.stringify({ action: kycModal.action, reason: kycReason }),
      });
      setKycModal(null); setKycReason("");
      fetchKYC(kycFilter);
    } finally { setKycBusy(false); }
  }

  // Plan handlers
  async function doSavePlan() {
    if (!planModal || planBusy) return;
    setPlanBusy(true);
    try {
      const isEdit = !!planModal._id;
      const url = isEdit ? `${API}/api/admin/plans/${planModal._id}` : `${API}/api/admin/plans`;
      await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: h(), body: JSON.stringify(planModal) });
      setPlanModal(null);
      fetchPlans();
    } finally { setPlanBusy(false); }
  }
  async function doDeletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    await fetch(`${API}/api/admin/plans/${id}`, { method: "DELETE", headers: h() });
    fetchPlans();
  }

  // Purchase handlers
  async function doApprove(id: string) {
    setPurchaseBusy(true);
    try {
      await fetch(`${API}/api/admin/purchases/${id}/approve`, { method: "PATCH", headers: h() });
      fetchPurchases(purchaseFilter);
    } finally { setPurchaseBusy(false); }
  }
  async function doReject() {
    if (!rejectModal || !rejectReason.trim() || purchaseBusy) return;
    setPurchaseBusy(true);
    try {
      await fetch(`${API}/api/admin/purchases/${rejectModal}/reject`, {
        method: "PATCH", headers: h(),
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectModal(null); setRejectReason("");
      fetchPurchases(purchaseFilter);
    } finally { setPurchaseBusy(false); }
  }

  // Profit handlers
  async function doSendProfit() {
    if (profitBusy || !profitAmt || Number(profitAmt) <= 0) return;
    if (profitMode === "single" && !profitUserId) return;
    if (profitMode === "bulk" && bulkIds.length === 0) return;
    setProfitBusy(true); setProfitMsg("");
    try {
      if (profitMode === "single") {
        const r = await fetch(`${API}/api/admin/profit`, {
          method: "POST", headers: h(),
          body: JSON.stringify({ userId: profitUserId, amount: Number(profitAmt), note: profitNote }),
        });
        const d = await r.json();
        setProfitMsg(d.success ? "Profit sent successfully!" : d.message);
      } else {
        const r = await fetch(`${API}/api/admin/profit/bulk`, {
          method: "POST", headers: h(),
          body: JSON.stringify({ userIds: bulkIds, amount: Number(profitAmt), note: profitNote }),
        });
        const d = await r.json();
        setProfitMsg(d.success ? `Profit sent to ${bulkIds.length} user(s).` : d.message);
        setBulkIds([]);
      }
      setProfitAmt(""); setProfitNote(""); setProfitUserId("");
    } finally { setProfitBusy(false); }
  }

  // Settings handler
  async function doSaveSettings() {
    if (settingsSaving) return;
    setSettingsSaving(true); setSettingsMsg("");
    try {
      const r = await fetch(`${API}/api/admin/settings`, { method: "PUT", headers: h(), body: JSON.stringify(settings) });
      const d = await r.json();
      setSettingsMsg(d.success ? "Settings saved." : d.message);
    } finally { setSettingsSaving(false); }
  }

  // Gain handlers
  async function doSaveGain() {
    if (!gainModal || gainBusy) return;
    setGainBusy(true);
    try {
      const isEdit = !!gainModal._id;
      const url = isEdit ? `${API}/api/admin/member-gains/${gainModal._id}` : `${API}/api/admin/member-gains`;
      await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: h(), body: JSON.stringify(gainModal) });
      setGainModal(null);
      fetchGains();
    } finally { setGainBusy(false); }
  }
  async function doDeleteGain(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`${API}/api/admin/member-gains/${id}`, { method: "DELETE", headers: h() });
    fetchGains();
  }
  async function doTogglePublish(id: string) {
    await fetch(`${API}/api/admin/member-gains/${id}/publish`, { method: "PATCH", headers: h() });
    fetchGains();
  }

  const nonAdminUsers = users.filter(u =>
    u.role !== "admin" &&
    (profitGroupFilter === "all" || u.referralGroup === profitGroupFilter)
  );

  return (
    <div className="flex h-dvh bg-[var(--bg)] overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-[var(--surface-deep)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 relative flex-shrink-0"><Image src="/logo.png" alt="MarketMinds" fill className="object-contain" /></div>
            <span className="text-sm font-bold text-gold-gradient" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>MarketMinds</span>
          </Link>
          <button className="lg:hidden p-1.5 text-[var(--text-3)] hover:text-[var(--text)]" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-[10px] font-bold flex-shrink-0">A</div>
            <div>
              <p className="text-[var(--text)] text-xs font-semibold">Admin Panel</p>
              <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">Super Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.label} onClick={() => switchTab(item.label)}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-widest transition-colors duration-150 ${activeTab === item.label ? "text-[#C9A227]" : "text-[var(--text-3)] hover:text-[var(--text)]"}`}
            >
              <AnimatePresence>
                {activeTab === item.label && (
                  <motion.div
                    key="pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 rounded-xl bg-[#C9A227]/8 border border-[#C9A227]/15 pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 flex-shrink-0">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-3 pb-5 border-t border-[var(--border)] pt-4"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
          <button onClick={() => { localStorage.removeItem("mm_token"); localStorage.removeItem("mm_user"); router.replace("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/5 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-[var(--surface-deep)] border-b border-[var(--border)] flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-[var(--text-3)] hover:text-[var(--text)]" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xs uppercase tracking-[0.25em] text-[var(--text-2)]">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/8 border border-[#22C55E]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#22C55E] text-[9px] uppercase tracking-widest font-medium">Live</span>
            </span>
            <button onClick={() => { localStorage.removeItem("mm_token"); localStorage.removeItem("mm_user"); router.replace("/login"); }}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/5 transition-all border border-[var(--border)]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8">

          {/* USERS */}
          {activeTab === "Users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <h2 className="text-[var(--text)] font-semibold">All Users</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">{users.length} registered</p>
                </div>
                <button
                  onClick={() => { setAddUserOpen(true); setAddUserMsg(""); setAddUserForm({ name: "", email: "", phone: "", password: "", role: "user" }); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add User
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text" placeholder="Search by name or email…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <FilterDropdown
                  value={userKycFilter}
                  onChange={setUserKycFilter}
                  className="w-40"
                  options={[
                    { value: "all",      label: "All KYC"  },
                    { value: "approved", label: "Approved" },
                    { value: "pending",  label: "Pending"  },
                    { value: "rejected", label: "Rejected" },
                    { value: "none",     label: "None"     },
                  ]}
                />
              </div>
              {usersLoading ? <Spinner /> : (
                <div className="space-y-2">
                  {users.filter(u => {
                    const q = userSearch.toLowerCase();
                    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    const matchKyc = userKycFilter === "all" || u.kycStatus === userKycFilter;
                    return matchSearch && matchKyc;
                  }).map(u => (
                    <div key={u._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-start gap-3 hover:border-[#C9A227]/15 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-[10px] font-bold flex-shrink-0">{initials(u.name)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <p className="text-[var(--text)] text-sm font-medium">{u.name}</p>
                            <p className="text-[var(--text-3)] text-xs mt-0.5 truncate">{u.email}</p>
                            {u.phone && <p className="text-[var(--text-3)] text-xs">{u.phone}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${kycBadge(u.kycStatus)}`}>{u.kycStatus || "none"}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${u.role === "admin" ? "bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20" : "bg-[var(--border)] text-[var(--text-3)]"}`}>{u.role}</span>
                            {u.referralGroup && (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">{u.referralGroup}</span>
                            )}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => { setDeleteUserTarget(u); setDeleteUserReason(""); }}
                                className="p-1.5 rounded-full text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete user"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[var(--text-4)] text-[10px] mt-1.5">Joined {fmtDate(u.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <Empty msg="No users yet" />}
                  {users.length > 0 && users.filter(u => { const q = userSearch.toLowerCase(); return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (userKycFilter === "all" || u.kycStatus === userKycFilter); }).length === 0 && <Empty msg="No users match the filters" />}
                </div>
              )}
            </div>
          )}

          {/* KYC */}
          {activeTab === "KYC" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <h2 className="text-[var(--text)] font-semibold">KYC Requests</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">{kycList.length} results</p>
                </div>
                <FilterDropdown
                  value={kycFilter}
                  onChange={v => { setKycFilter(v); fetchKYC(v); }}
                  className="w-44"
                  options={[
                    { value: "pending",  label: "Pending"  },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "none",     label: "Not Started" },
                    { value: "all",      label: "All"      },
                  ]}
                />
              </div>
              {kycLoading ? <Spinner /> : (
                <div className="space-y-3">
                  {kycList.map(u => (
                    <div key={u._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[#C9A227]/15 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-xs font-bold flex-shrink-0">{initials(u.name)}</div>
                          <div>
                            <p className="text-[var(--text)] font-medium">{u.name}</p>
                            <p className="text-[var(--text-3)] text-xs mt-0.5">{u.email}</p>
                            {u.kycSubmittedAt && <p className="text-[var(--text-4)] text-[10px] mt-1">Submitted {fmtDate(u.kycSubmittedAt)}</p>}
                            {u.kycRejectionReason && <p className="text-[#EF4444] text-[10px] mt-1">Reason: {u.kycRejectionReason}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${kycBadge(u.kycStatus)}`}>{u.kycStatus}</span>
                          {u.kycStatus === "pending" && (
                            <>
                              <button onClick={() => { setKycModal({ user: u, action: "approve" }); setKycReason(""); }} className="px-3 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-[#22C55E]/20 transition-colors">Approve</button>
                              <button onClick={() => { setKycModal({ user: u, action: "reject" }); setKycReason(""); }} className="px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-[#EF4444]/20 transition-colors">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                      {u.bankDetails && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            ["Account Holder", u.bankDetails.accountHolderName],
                            ["Account Number", u.bankDetails.accountNumber],
                            ["IFSC Code",      u.bankDetails.ifscCode],
                            ["Bank Name",      u.bankDetails.bankName],
                            ["UPI ID",         u.bankDetails.upiId],
                          ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label as string}>
                              <p className="text-[9px] uppercase tracking-wider text-[var(--text-3)] mb-0.5">{label}</p>
                              <p className="text-[var(--text)] text-xs font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {kycList.length === 0 && <Empty msg={`No KYC requests with status "${kycFilter}"`} />}
                </div>
              )}
            </div>
          )}

          {/* PLANS */}
          {activeTab === "Plans" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[var(--text)] font-semibold">Investment Plans</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">{plans.length} plans</p>
                </div>
                <button onClick={() => setPlanModal({ features: [], isActive: true, order: 0 })} className="px-5 py-2.5 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all">+ New Plan</button>
              </div>
              {plansLoading ? <Spinner /> : (
                <div className="space-y-3">
                  {plans.map(p => (
                    <div key={p._id} className={`bg-[var(--surface)] border rounded-2xl p-5 transition-colors ${p.isActive ? "border-[var(--border)] hover:border-[#C9A227]/15" : "border-[var(--border)]/50 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[var(--text)] font-semibold">{p.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.isActive ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" : "bg-[var(--border)] text-[var(--text-3)]"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                          </div>
                          {p.tagline && <p className="text-[var(--text-3)] text-xs mb-2">{p.tagline}</p>}
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span className="text-[var(--text-2)]">Min: <span className="text-[#C9A227] font-semibold">{fmtAmt(p.minAmount)}</span></span>
                            {p.maxAmount ? <span className="text-[var(--text-2)]">Max: <span className="text-[#C9A227] font-semibold">{fmtAmt(p.maxAmount)}</span></span> : null}
                            <span className="text-[var(--text-2)]">Duration: <span className="text-[var(--text)] font-semibold">{p.durationMonths}mo</span></span>
                            {p.expectedReturn ? <span className="text-[var(--text-2)]">Return: <span className="text-[#22C55E] font-semibold">{p.expectedReturn}</span></span> : null}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPlanModal({ ...p })} className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-3)] text-[9px] font-bold uppercase tracking-wider rounded-full hover:text-[var(--text)] transition-colors">Edit</button>
                          <button onClick={() => doDeletePlan(p._id)} className="px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-[#EF4444]/20 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {plans.length === 0 && <Empty msg="No plans yet. Create your first plan." />}
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === "Payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <h2 className="text-[var(--text)] font-semibold">Plan Purchases</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">{purchases.length} results</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text" placeholder="Search by user name or email…"
                  value={paySearch} onChange={e => setPaySearch(e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <FilterDropdown
                  value={purchaseFilter}
                  onChange={v => { setPurchaseFilter(v); fetchPurchases(v); }}
                  className="w-44"
                  options={[
                    { value: "pending",   label: "Pending"   },
                    { value: "completed", label: "Completed" },
                    { value: "failed",    label: "Failed"    },
                    { value: "all",       label: "All"       },
                  ]}
                />
              </div>
              {purchasesLoading ? <Spinner /> : (
                <div className="space-y-3">
                  {purchases.filter(p => {
                    const q = paySearch.toLowerCase();
                    return !q || p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q);
                  }).map(p => (
                    <div key={p._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[#C9A227]/15 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-xs font-bold flex-shrink-0">{initials(p.user?.name || "U")}</div>
                          <div>
                            <p className="text-[var(--text)] font-medium">{p.user?.name}</p>
                            <p className="text-[var(--text-3)] text-xs mt-0.5">{p.user?.email}</p>
                            <p className="text-[var(--text-4)] text-[10px] mt-1">{p.plan?.name} · {fmtDate(p.createdAt)}</p>
                            {p.reference && <p className="text-[var(--text-3)] text-[10px] mt-0.5">Ref: <span className="text-[var(--text-2)] font-medium">{p.reference}</span></p>}
                            {p.rejectionReason && <p className="text-[#EF4444] text-[10px] mt-1">Reason: {p.rejectionReason}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="text-right">
                            <p className="text-[#C9A227] font-bold text-lg">{fmtAmt(p.amount)}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadge(p.status)}`}>{p.status}</span>
                          {p.status === "pending" && (
                            <>
                              <button onClick={() => doApprove(p._id)} disabled={purchaseBusy} className="px-3 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-[#22C55E]/20 transition-colors disabled:opacity-50">Approve</button>
                              <button onClick={() => { setRejectModal(p._id); setRejectReason(""); }} className="px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-[#EF4444]/20 transition-colors">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {purchases.length === 0 && <Empty msg={`No purchases with status "${purchaseFilter}"`} />}
                  {purchases.length > 0 && purchases.filter(p => { const q = paySearch.toLowerCase(); return !q || p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q); }).length === 0 && <Empty msg="No purchases match your search" />}
                </div>
              )}
            </div>
          )}

          {/* PROFIT */}
          {activeTab === "Profit" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-[var(--text)] font-semibold mb-1">Distribute Profit</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)]">Creates a profit transaction and notifies the user by email</p>
                </div>
                <FilterDropdown
                  label="Filter by group"
                  value={profitGroupFilter}
                  onChange={v => { setProfitGroupFilter(v); setBulkIds([]); setProfitUserId(""); }}
                  className="w-44"
                  options={[
                    { value: "all",    label: "All Users" },
                    { value: "vishal", label: "Vishal's Group" },
                    { value: "bablu",  label: "Bablu's Group" },
                  ]}
                />
              </div>
              <div className="flex gap-2">
                {(["single","bulk"] as const).map(m => (
                  <button key={m} onClick={() => { setProfitMode(m); setBulkIds([]); setProfitMsg(""); }}
                    className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${profitMode === m ? "bg-[#C9A227] text-black" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)]"}`}
                  >{m === "single" ? "Single User" : "Bulk (same amount)"}</button>
                ))}
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                {profitMode === "single" ? (
                  <div>
                    <label className={labelCls}>Select User</label>
                    <FilterDropdown
                      value={profitUserId}
                      onChange={setProfitUserId}
                      options={[
                        { value: "", label: "— choose a user —" },
                        ...nonAdminUsers.map(u => ({ value: u._id, label: `${u.name} (${u.email})` })),
                      ]}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + " mb-0"}>Select Users ({bulkIds.length} selected)</label>
                      {nonAdminUsers.length > 0 && (
                        <button onClick={() => setBulkIds(bulkIds.length === nonAdminUsers.length ? [] : nonAdminUsers.map(u => u._id))} className="text-[10px] text-[#C9A227] hover:text-[#E8C65A] uppercase tracking-wider">
                          {bulkIds.length === nonAdminUsers.length ? "Deselect all" : "Select all"}
                        </button>
                      )}
                    </div>
                    <input
                      type="text" placeholder="Search users…"
                      value={bulkSearch} onChange={e => setBulkSearch(e.target.value)}
                      className={`${inputCls} mb-2`}
                    />
                    <div className="max-h-52 overflow-y-auto border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]/50">
                      {nonAdminUsers.filter(u => {
                        const q = bulkSearch.toLowerCase();
                        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                      }).map(u => (
                        <label key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-alt)] cursor-pointer transition-colors">
                          <input type="checkbox" checked={bulkIds.includes(u._id)} onChange={e => setBulkIds(prev => e.target.checked ? [...prev, u._id] : prev.filter(id => id !== u._id))} className="accent-[#C9A227]" />
                          <div>
                            <p className="text-[var(--text)] text-sm">{u.name}</p>
                            <p className="text-[var(--text-3)] text-[10px]">{u.email}</p>
                          </div>
                        </label>
                      ))}
                      {nonAdminUsers.length === 0 && <p className="px-4 py-6 text-[var(--text-3)] text-xs text-center">No users found</p>}
                      {nonAdminUsers.length > 0 && nonAdminUsers.filter(u => { const q = bulkSearch.toLowerCase(); return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q); }).length === 0 && <p className="px-4 py-6 text-[var(--text-3)] text-xs text-center">No users match your search</p>}
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelCls}>Amount (₹)</label>
                  <input type="number" min={1} value={profitAmt} onChange={e => setProfitAmt(e.target.value)} placeholder="Enter amount" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Note (optional)</label>
                  <input type="text" value={profitNote} onChange={e => setProfitNote(e.target.value)} placeholder="e.g. April 2026 profit" className={inputCls} />
                </div>
                {profitMsg && (
                  <p className={`text-xs font-medium ${profitMsg.includes("success") || profitMsg.includes("sent") ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{profitMsg}</p>
                )}
                <button onClick={doSendProfit} disabled={profitBusy || !profitAmt || Number(profitAmt) <= 0 || (profitMode === "single" ? !profitUserId : bulkIds.length === 0)}
                  className="w-full py-3 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {profitBusy ? "Sending…" : profitMode === "single" ? "Send Profit" : `Send to ${bulkIds.length || "..."} User${bulkIds.length === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "Settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[var(--text)] font-semibold mb-1">Payment Settings</h2>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)]">QR code and instructions shown on the plan purchase modal</p>
              </div>
              {settingsLoading ? <Spinner /> : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                  <div>
                    <label className={labelCls}>Payment QR Code</label>
                    <label className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-[var(--border)] hover:border-[#C9A227]/40 rounded-xl p-6 cursor-pointer transition-colors group">
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setSettings(s => ({ ...s, paymentQrCode: ev.target?.result as string }));
                        reader.readAsDataURL(file);
                      }} />
                      {settings.paymentQrCode ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.paymentQrCode} alt="QR Preview" className="w-36 h-36 object-contain rounded-xl" />
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-[var(--text-3)] group-hover:text-[#C9A227] transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                          <p className="text-xs text-[var(--text-3)] group-hover:text-[var(--text-2)] transition-colors">Click to upload QR image</p>
                          <p className="text-[9px] text-[var(--text-4)] uppercase tracking-widest">PNG, JPG, SVG</p>
                        </>
                      )}
                    </label>
                    {settings.paymentQrCode && (
                      <button type="button" onClick={() => setSettings(s => ({ ...s, paymentQrCode: "" }))}
                        className="mt-2 text-[10px] text-[#EF4444] hover:text-red-400 uppercase tracking-widest transition-colors">
                        Remove image
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>UPI ID</label>
                    <input type="text" value={settings.paymentUpiId || ""} onChange={e => setSettings(s => ({ ...s, paymentUpiId: e.target.value }))} placeholder="yourname@upi" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Payment Email (users send screenshot here)</label>
                    <input type="email" value={settings.paymentEmail || ""} onChange={e => setSettings(s => ({ ...s, paymentEmail: e.target.value }))} placeholder="payments@marketminds.in" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Payment Instructions</label>
                    <textarea value={settings.paymentInstructions || ""} onChange={e => setSettings(s => ({ ...s, paymentInstructions: e.target.value }))} rows={4} placeholder={"1. Scan QR and pay\n2. Note your reference ID\n3. Email screenshot + reference to the payment email"} className={`${inputCls} resize-none`} />
                  </div>
                  {settingsMsg && (
                    <p className={`text-xs font-medium ${settingsMsg === "Settings saved." ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{settingsMsg}</p>
                  )}
                  <button onClick={doSaveSettings} disabled={settingsSaving} className="w-full py-3 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40">
                    {settingsSaving ? "Saving…" : "Save Settings"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAINS */}
          {activeTab === "Gains" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <h2 className="text-[var(--text)] font-semibold">Member Gains</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mt-0.5">Live sheet shown to users — only published entries appear</p>
                </div>
                <button onClick={() => setGainModal({ isPublished: false })} className="px-5 py-2.5 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all">+ Add Entry</button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text" placeholder="Search by member name…"
                  value={gainsSearch} onChange={e => setGainsSearch(e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <FilterDropdown
                  value={gainsPublishFilter}
                  onChange={setGainsPublishFilter}
                  className="w-40"
                  options={[
                    { value: "all",       label: "All"       },
                    { value: "published", label: "Published" },
                    { value: "draft",     label: "Draft"     },
                  ]}
                />
              </div>
              {gainsLoading ? <Spinner /> : (
                <div className="space-y-2">
                  {gains.filter(g => {
                    const q = gainsSearch.toLowerCase();
                    const matchSearch = !q || g.memberName.toLowerCase().includes(q);
                    const matchPublish = gainsPublishFilter === "all"
                      || (gainsPublishFilter === "published" && g.isPublished)
                      || (gainsPublishFilter === "draft" && !g.isPublished);
                    return matchSearch && matchPublish;
                  }).map(g => (
                    <div key={g._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 hover:border-[#C9A227]/15 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-[var(--text)] font-medium">{g.memberName}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                            <span className="text-[var(--text-3)]">Invested: <strong className="text-[var(--text)]">{fmtAmt(g.invested)}</strong></span>
                            <span className="text-[var(--text-3)]">Value: <strong className="text-[var(--text)]">{fmtAmt(g.currentValue)}</strong></span>
                            <span className="text-[var(--text-3)]">Total: <strong className="text-[#22C55E]">+{g.totalReturnPct}%</strong></span>
                            <span className="text-[var(--text-3)]">Monthly: <strong className="text-[#22C55E]">+{g.monthlyReturnPct}%</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <button onClick={() => doTogglePublish(g._id)} className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${g.isPublished ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" : "bg-[var(--border)] text-[var(--text-3)]"}`}>
                            {g.isPublished ? "Published" : "Draft"}
                          </button>
                          <button onClick={() => setGainModal({ ...g })} className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--bg)] border border-[var(--border)] text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors">Edit</button>
                          <button onClick={() => doDeleteGain(g._id)} className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {gains.length === 0 && <Empty msg="No entries yet. Add your first member gain." />}
                  {gains.length > 0 && gains.filter(g => { const q = gainsSearch.toLowerCase(); const ms = !q || g.memberName.toLowerCase().includes(q); const mp = gainsPublishFilter === "all" || (gainsPublishFilter === "published" && g.isPublished) || (gainsPublishFilter === "draft" && !g.isPublished); return ms && mp; }).length === 0 && <Empty msg="No entries match the filters" />}
                </div>
              )}
            </div>
          )}

        </main>

      </div>

      {/* Add User Modal */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-[var(--text)] font-semibold mb-5">Add User</h3>
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Arjun Sharma" },
                { label: "Email", key: "email", type: "email", placeholder: "name@email.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "9876543210" },
                { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(addUserForm as Record<string, string>)[f.key]}
                    onChange={e => setAddUserForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#C9A227]/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-1 block">Role</label>
                <FilterDropdown
                  value={addUserForm.role}
                  onChange={v => setAddUserForm(p => ({ ...p, role: v }))}
                  options={[
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              </div>
            </div>
            {addUserMsg && <p className="text-xs mt-3 text-red-400">{addUserMsg}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddUserOpen(false)} className="flex-1 py-2.5 rounded-full border border-[var(--border)] text-xs text-[var(--text-2)] hover:border-[var(--text-3)] transition-colors">Cancel</button>
              <button
                disabled={addUserBusy}
                onClick={async () => {
                  setAddUserBusy(true); setAddUserMsg("");
                  try {
                    const r = await fetch(`${API}/api/admin/users`, { method: "POST", headers: h(), body: JSON.stringify(addUserForm) });
                    const d = await r.json();
                    if (d.success) { setAddUserOpen(false); fetchUsers(); }
                    else setAddUserMsg(d.message || d.errors?.[0]?.msg || "Failed to create user.");
                  } catch { setAddUserMsg("Network error."); }
                  finally { setAddUserBusy(false); }
                }}
                className="flex-1 py-2.5 rounded-full bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {addUserBusy ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUserTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-[var(--text)] font-semibold mb-1">Delete User</h3>
            <p className="text-[var(--text-3)] text-xs mb-4">Are you sure you want to delete <span className="text-[var(--text)] font-medium">{deleteUserTarget.name}</span>? This cannot be undone.</p>
            <div className="text-left mb-5">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-1.5 block">Reason for deletion</label>
              <textarea
                rows={3}
                placeholder="Enter reason…"
                value={deleteUserReason}
                onChange={e => setDeleteUserReason(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[#C9A227]/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUserTarget(null)} className="flex-1 py-2.5 rounded-full border border-[var(--border)] text-xs text-[var(--text-2)] hover:border-[var(--text-3)] transition-colors">Cancel</button>
              <button
                disabled={deleteUserBusy || !deleteUserReason.trim()}
                onClick={async () => {
                  setDeleteUserBusy(true);
                  try {
                    const r = await fetch(`${API}/api/admin/users/${deleteUserTarget._id}`, { method: "DELETE", headers: h() });
                    const d = await r.json();
                    if (d.success) { setDeleteUserTarget(null); setDeleteUserReason(""); fetchUsers(); }
                  } catch { /* ignore */ }
                  finally { setDeleteUserBusy(false); }
                }}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteUserBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {kycModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-[var(--text)] font-semibold mb-1">{kycModal.action === "approve" ? "Approve KYC" : "Reject KYC"}</h3>
            <p className="text-[var(--text-3)] text-xs mb-5">{kycModal.user.name} · {kycModal.user.email}</p>
            {kycModal.action === "reject" ? (
              <div className="mb-4">
                <label className={labelCls}>Rejection Reason *</label>
                <textarea value={kycReason} onChange={e => setKycReason(e.target.value)} rows={3} placeholder="Enter reason for rejection…" className={`${inputCls} resize-none`} />
              </div>
            ) : (
              <p className="text-[var(--text-2)] text-xs mb-5">A confirmation email will be sent to the user upon approval.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setKycModal(null)} className="flex-1 py-3 border border-[var(--border)] text-[var(--text-2)] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--surface)] transition-colors">Cancel</button>
              <button onClick={doKYCReview} disabled={kycBusy || (kycModal.action === "reject" && !kycReason.trim())}
                className={`flex-1 py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 ${kycModal.action === "approve" ? "bg-[#22C55E] hover:bg-[#16A34A]" : "bg-[#EF4444] hover:bg-[#DC2626]"}`}
              >{kycBusy ? "Processing…" : kycModal.action === "approve" ? "Approve" : "Reject"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide p-6 space-y-4">
            <h3 className="text-[var(--text)] font-semibold">{planModal._id ? "Edit Plan" : "New Plan"}</h3>
            {([
              ["Plan Name *",        "name",            "text",   "e.g. HyperGrowth"],
              ["Tagline",            "tagline",         "text",   "Short marketing line"],
              ["Min Amount (₹) *",   "minAmount",       "number", "500"],
              ["Max Amount (₹)",     "maxAmount",       "number", "Leave blank for unlimited"],
              ["Duration (months)*", "durationMonths",  "number", "12"],
              ["Expected Return",    "expectedReturn",  "text",   "e.g. 18–22% p.a."],
              ["Display Order",      "order",           "number", "0"],
            ] as [string, keyof Plan, string, string][]).map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input type={type} value={(planModal[key] as string | number) ?? ""} placeholder={placeholder}
                  onChange={e => setPlanModal(m => ({ ...m, [key]: type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={planModal.description || ""} onChange={e => setPlanModal(m => ({ ...m, description: e.target.value }))} rows={2} placeholder="Plan description…" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Features (one per line)</label>
              <textarea value={Array.isArray(planModal.features) ? planModal.features.join("\n") : ""} onChange={e => setPlanModal(m => ({ ...m, features: e.target.value.split("\n") }))} rows={3} placeholder={"Guaranteed returns\nMonthly payouts\nNo lock-in"} className={`${inputCls} resize-none`} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!planModal.isActive} onChange={e => setPlanModal(m => ({ ...m, isActive: e.target.checked }))} className="accent-[#C9A227]" />
              <span className="text-[var(--text-2)] text-xs uppercase tracking-wider">Active (visible to users)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPlanModal(null)} className="flex-1 py-3 border border-[var(--border)] text-[var(--text-2)] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--surface)] transition-colors">Cancel</button>
              <button onClick={doSavePlan} disabled={planBusy} className="flex-1 py-3 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40">
                {planBusy ? "Saving…" : planModal._id ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Purchase Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-[var(--text)] font-semibold mb-1">Reject Purchase</h3>
            <p className="text-[var(--text-3)] text-xs mb-5">The user will receive an email with this reason.</p>
            <div className="mb-4">
              <label className={labelCls}>Rejection Reason *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="e.g. Reference ID not matching records" className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-3 border border-[var(--border)] text-[var(--text-2)] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--surface)] transition-colors">Cancel</button>
              <button onClick={doReject} disabled={purchaseBusy || !rejectReason.trim()} className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40">
                {purchaseBusy ? "Processing…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gain Modal */}
      {gainModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-deep)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-[var(--text)] font-semibold">{gainModal._id ? "Edit Entry" : "New Entry"}</h3>
            {([
              ["Member Name *",        "memberName",       "text",   "e.g. R. Sharma"],
              ["Invested Amount (₹)*", "invested",         "number", "100000"],
              ["Current Value (₹)*",  "currentValue",     "number", "120000"],
              ["Total Return % *",    "totalReturnPct",   "number", "20"],
              ["Monthly Return % *",  "monthlyReturnPct", "number", "1.5"],
            ] as [string, keyof MemberGain, string, string][]).map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input type={type} value={(gainModal[key] as string | number) ?? ""} placeholder={placeholder}
                  onChange={e => setGainModal(m => ({ ...m, [key]: type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!gainModal.isPublished} onChange={e => setGainModal(m => ({ ...m, isPublished: e.target.checked }))} className="accent-[#C9A227]" />
              <span className="text-[var(--text-2)] text-xs uppercase tracking-wider">Publish immediately</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setGainModal(null)} className="flex-1 py-3 border border-[var(--border)] text-[var(--text-2)] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--surface)] transition-colors">Cancel</button>
              <button onClick={doSaveGain} disabled={gainBusy} className="flex-1 py-3 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40">
                {gainBusy ? "Saving…" : gainModal._id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
