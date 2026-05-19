"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import MouseOrb from "@/components/MouseOrb";
import MagneticWrapper from "@/components/MagneticWrapper";
import SpotlightCard from "@/components/SpotlightCard";
import TiltCard from "@/components/TiltCard";
import { motion, AnimatePresence } from "framer-motion";



const features = [
  { icon: "✦", title: "Fast Onboarding", body: "Sign up in under 2 minutes. No paperwork. No branch visits." },
  { icon: "↻", title: "Auto Invest", body: "Set it and forget it. Automatic monthly deposits." },
  { icon: "◫", title: "Live Portfolio", body: "Real-time NAV updates and performance tracking." },
  { icon: "◈", title: "Tax Optimized", body: "Strategies designed for maximum tax efficiency." },
  { icon: "◉", title: "Risk Analysis", body: "Quantitative models match funds to your risk profile." },
  { icon: "≡", title: "No Hidden Fees", body: "Zero entry load. Transparent expense ratios." },
  { icon: "◎", title: "Goal Planning", body: "Set targets — retirement, house, education — and track." },
  { icon: "◆", title: "Bank Grade Security", body: "Encrypted and audited. Your money is always protected." },
];

const mediaLogos = [
  "Economic Times", "Mint", "MoneyControl", "CNBC TV18",
  "Bloomberg Quint", "The Hindu BusinessLine", "Forbes India", "Business Standard",
];

const investorReturns = [
  { investor: "Priya S.", city: "Pune", invested: "₹1,000/mo", duration: "4 Years", value: "₹82,400", gain: "+71.6%" },
  { investor: "Ramesh I.", city: "Chennai", invested: "₹5,000/mo", duration: "3 Years", value: "₹2.34L", gain: "+30.0%" },
  { investor: "Anita K.", city: "Jaipur", invested: "₹2,500/mo", duration: "5 Years", value: "₹2.91L", gain: "+94.0%" },
  { investor: "Deepak M.", city: "Hyderabad", invested: "₹500/mo", duration: "6 Years", value: "₹72,800", gain: "+102.2%" },
  { investor: "Kavya R.", city: "Bengaluru", invested: "₹10,000/mo", duration: "2 Years", value: "₹3.14L", gain: "+30.8%" },
];

export default function HomePage() {
  const [activePlan, setActivePlan] = useState("100k");

  return (
    <div className="flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            {/* Note: Place your video file in the public folder as 'hero-bg.mp4' */}
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          {/* Gradient to blend smoothly into the next section's background color */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)] z-10" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-[#C9A227] mb-4 sm:mb-5 font-medium z-10 drop-shadow-md"
        >
          Est. 2019 · Mumbai, India
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="font-display text-4xl sm:text-6xl lg:text-8xl font-bold leading-[1.05] mb-4 sm:mb-5 max-w-4xl z-10 text-white drop-shadow-xl"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
        >
          Wealth,{" "}
          <span className="text-gold-gradient italic">Elevated.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white/80 text-base sm:text-lg max-w-sm sm:max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light z-10 drop-shadow-md"
        >
          Not just investing. A reflection of how seriously
          you take your financial future.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-10"
        >
          <MagneticWrapper>
            <Link
              href="/dashboard"
              className="block w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl shadow-[#C9A227]/30"
            >
              Start Investing
            </Link>
          </MagneticWrapper>
          <MagneticWrapper>
            <Link
              href="/about"
              className="block w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 border border-white/30 hover:border-white hover:bg-white/10 text-white text-xs sm:text-sm uppercase tracking-widest rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              Our Story
            </Link>
          </MagneticWrapper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 z-10"
        >
          <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-[var(--border)] py-4 sm:py-5 overflow-hidden">
        <div className="flex animate-marquee gap-12 sm:gap-16">
          {[...mediaLogos, ...mediaLogos].map((name, i) => (
            <span
              key={i}
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[var(--text-3)] flex-shrink-0 flex items-center gap-3 sm:gap-4"
            >
              <span className="w-1 h-1 rounded-full bg-[#C9A227] inline-block flex-shrink-0" />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="border-b border-[var(--border)] py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:flex md:flex-row">
          {[
            { val: "₹85Cr+", label: "Capital Deployed" },
            { val: "1,200+",   label: "Active Partners" },
            { val: "42.5%",  label: "Avg. Annual Returns" },
            { val: "5 Yrs",  label: "In Private Markets" },
          ].map((s, i) => (
            <AnimatedSection
              key={s.label}
              delay={i * 100}
              className={`flex-1 text-center py-6 md:py-0 px-4 sm:px-6 md:px-10 ${
                i % 2 !== 0 ? "border-l border-[var(--border)]" : ""
              } ${
                i >= 2 ? "border-t border-[var(--border)] md:border-t-0" : ""
              } ${
                i > 0 && i % 2 === 0 ? "md:border-l md:border-[var(--border)]" : ""
              } ${
                i === 1 || i === 3 ? "md:border-l md:border-[var(--border)]" : ""
              }`}
            >
              <AnimatedCounter
                value={s.val}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient mb-1.5 sm:mb-2"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[var(--text-3)]">{s.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── WHY MARKETMINDS ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-3 sm:mb-4">The Difference</p>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Why MarketMinds?
            </h2>
          </AnimatedSection>

          <SpotlightCard className="rounded-[24px] sm:rounded-[40px]">
            <div className="p-6 sm:p-10 md:p-12 grid grid-cols-1 md:grid-cols-3">
              {[
                { n: "01", title: "Institutional Grade", body: "Strategies built by ex-HDFC AMC and Mirae Asset fund managers. The same research available to ₹50L investors — now for everyone." },
                { n: "02", title: "India-First Design", body: "Built for long-term growth and tax efficiency. Not adapted from foreign tools. Every feature was designed for the Indian investor." },
                { n: "03", title: "Aligned Incentives", body: "We earn when your portfolio grows — not on transactions. Zero hidden fees. Zero entry loads. 100% transparency." },
              ].map((v, i) => (
                <AnimatedSection
                  key={v.n}
                  delay={i * 120}
                  direction="up"
                  className={`py-7 md:py-0 relative z-10 ${i > 0 ? "border-t md:border-t-0 md:border-l border-[var(--border)] md:pl-10 lg:pl-12" : ""} ${i < 2 ? "md:pr-10 lg:pr-12" : ""}`}
                >
                  <span
                    className="font-display text-xs text-[#C9A227] mb-3 sm:mb-4 block"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {v.n}
                  </span>
                  <h3
                    className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-[var(--text-2)] text-sm leading-relaxed">{v.body}</p>
                </AnimatedSection>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* ── OUR PLAN ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-alt)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-3 sm:mb-4">Choose Your Plan</p>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Hyper Growth
            </h2>
          </AnimatedSection>

          <AnimatedSection direction="up" className="max-w-4xl mx-auto">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Benefits */}
                <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--surface-deep)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] mb-6 sm:mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-[var(--text)] font-semibold">One time investment</span>
                  </div>
                  
                  <h3
                    className="font-display text-2xl sm:text-3xl font-bold mb-6"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Designed for maximum velocity.
                  </h3>
                  
                  <ul className="space-y-4 sm:space-y-5 mb-2">
                    {[
                      { title: "Daily Rewards", desc: "See your portfolio grow every single day." },
                      { title: "Weekly Payouts", desc: "Consistent liquidity with weekly withdrawals." },
                      { title: "Transparent Returns", desc: "Clear, consistent payouts with no hidden fees." },
                      { title: "3-Month Lock-in", desc: "Short term commitment for high velocity growth." },
                    ].map((b, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-5 h-5 rounded-full bg-[#C9A227]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#C9A227] text-[10px] font-bold">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">{b.title}</p>
                          <p className="text-xs text-[var(--text-2)] mt-0.5">{b.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Options */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-3)] mb-5 sm:mb-6 font-semibold">Select Capital</p>
                  
                  <div className="space-y-4 mb-8">
                    {/* 50k Option */}
                    <div 
                      className={`relative p-5 sm:p-6 rounded-[20px] border-2 transition-all duration-300 cursor-pointer ${activePlan === '50k' ? 'border-[#C9A227] bg-[#C9A227]/5' : 'border-[var(--border)] hover:border-[#C9A227]/30'}`} 
                      onClick={() => setActivePlan('50k')}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${activePlan === '50k' ? 'border-[#C9A227]' : 'border-[var(--border)]'}`}>
                          {activePlan === '50k' && <motion.div layoutId="radio" className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                        </div>
                        <div className="flex flex-col flex-grow">
                          <div className="flex justify-between items-center w-full mb-1">
                            <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)]">Standard Entry</p>
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-[var(--text)]">₹50,000</p>
                        </div>
                      </div>
                    </div>

                    {/* 100k Option */}
                    <div 
                      className={`relative p-5 sm:p-6 rounded-[20px] border-2 transition-all duration-300 cursor-pointer ${activePlan === '100k' ? 'border-[#C9A227] bg-[#C9A227]/5' : 'border-[var(--border)] hover:border-[#C9A227]/30'}`} 
                      onClick={() => setActivePlan('100k')}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${activePlan === '100k' ? 'border-[#C9A227]' : 'border-[var(--border)]'}`}>
                          {activePlan === '100k' && <motion.div layoutId="radio" className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                        </div>
                        <div className="flex flex-col flex-grow">
                          <div className="flex justify-between items-center w-full mb-1">
                            <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)]">Premium Entry</p>
                            <span className="bg-[#C9A227] text-black text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">Recommended</span>
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-[var(--text)]">₹1,00,000</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="block w-full text-center px-6 py-4 sm:py-4 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl shadow-[#C9A227]/20"
                  >
                    Start with {activePlan === '50k' ? '₹50,000' : '₹1,00,000'}
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── INVESTOR RETURNS (HORIZONTAL SCROLL) ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-8 sm:mb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-3 sm:mb-4">Real Returns</p>
            <div className="flex items-end justify-between">
              <h2
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Investor stories.
              </h2>
              <Link href="/about" className="hidden sm:block text-[10px] uppercase tracking-widest text-[var(--text-2)] hover:text-[#C9A227] transition-colors">
                All stories →
              </Link>
            </div>
          </AnimatedSection>

          <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-10 pt-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {investorReturns.map((r, i) => (
              <TiltCard key={i} className="flex-shrink-0 w-[220px] sm:w-[260px]">
                <div className="h-full bg-[var(--surface)] border border-[var(--border)] rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 shadow-xl shadow-black/5">
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-xs font-bold">
                      {r.investor[0]}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-[#22C55E] font-semibold">{r.gain}</span>
                  </div>
                  <p
                    className="font-display font-bold text-base sm:text-lg mb-0.5"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {r.investor}
                  </p>
                  <p className="text-[var(--text-3)] text-[10px] uppercase tracking-widest mb-5 sm:mb-6">{r.city}</p>
                  <div className="gold-line mb-5 sm:mb-6" />
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)] mb-1">Invested</p>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">{r.invested}</p>
                      <p className="text-[10px] text-[var(--text-3)]">{r.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-[var(--text-3)] mb-1">Value Today</p>
                      <p className="text-xs sm:text-sm font-bold text-[#C9A227]">{r.value}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-alt)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-3 sm:mb-4">The Process</p>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Start in three steps.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { n: "01", title: "Create Account", body: "Fast onboarding in under 2 minutes. No paperwork. No branch visits." },
              { n: "02", title: "Choose a Fund", body: "Equity, debt, or hybrid — curated to your risk appetite and financial goals." },
              { n: "03", title: "Invest & Grow", body: "Invest from ₹500/month. Watch your portfolio compound over time with real-time tracking." },
            ].map((step, i) => (
              <AnimatedSection key={step.n} delay={i * 150} direction="up">
                <div className="bg-[var(--surface)] border border-[var(--border)] hover:border-[#C9A227]/20 rounded-[20px] sm:rounded-[24px] p-7 sm:p-8 md:p-10 h-full transition-all duration-500">
                  <span
                    className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient block mb-6 sm:mb-8 leading-none"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {step.n}
                  </span>
                  <h3
                    className="font-display text-lg sm:text-xl font-bold mb-3 sm:mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[var(--text-2)] text-sm leading-relaxed">{step.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-3 sm:mb-4">Platform</p>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Everything you need.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 60} direction="up" className="h-full">
                <SpotlightCard className="rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 h-full">
                  <span className="text-[#C9A227] text-xl sm:text-2xl block mb-3 sm:mb-4 leading-none">{f.icon}</span>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 text-[var(--text)]">{f.title}</h3>
                  <p className="text-[var(--text-2)] text-[11px] sm:text-xs leading-relaxed">{f.body}</p>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-alt)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)]">Investor Stories</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { quote: "Started with ₹1,000/month. Portfolio is now ₹4.2 lakhs. MarketMinds changed how I think about money.", name: "Priya Sharma", loc: "Pune", tag: "Monthly Investor · 4 Years" },
              { quote: "The dashboard is the clearest I've seen. I know exactly where every rupee is. That's rare in this industry.", name: "Ramesh Iyer", loc: "Chennai", tag: "Growth Fund" },
              { quote: "Their Growth fund significantly improved my portfolio last year. First time investing has actually felt worth it.", name: "Anita Kapoor", loc: "Jaipur", tag: "Growth Investor" },
            ].map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 120} direction="up">
                <div className="bg-[var(--surface)] border border-[var(--border)] hover:border-[#C9A227]/20 rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 min-h-[18rem] sm:h-[22rem] flex flex-col justify-between transition-all duration-500">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#C9A227] mb-4 sm:mb-6">{t.tag}</p>
                    <p className="text-[var(--text)] text-sm sm:text-base leading-relaxed font-light">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 sm:pt-6 border-t border-[var(--border)] mt-5 sm:mt-0">
                    <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-xs font-bold flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-[var(--text)] text-xs font-semibold">{t.name}</p>
                      <p className="text-[var(--text-3)] text-[10px] uppercase tracking-wider">{t.loc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up">
            <div className="relative bg-[var(--surface)] border border-[#C9A227]/10 rounded-[24px] sm:rounded-[40px] px-6 py-14 sm:px-10 sm:py-20 text-center overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#C9A227]/4 rounded-full blur-[60px] sm:blur-[80px]" />
              </div>
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A227] mb-6 sm:mb-8">MarketMinds</p>
                <h2
                  className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Not everyone<br />
                  <span className="italic text-gold-gradient">invests this well.</span>
                </h2>
                <p className="text-[var(--text-2)] text-base sm:text-lg mb-8 sm:mb-12 font-light max-w-sm sm:max-w-lg mx-auto">
                  Your financial future deserves more than a savings account. Start today.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block px-8 sm:px-10 py-4 sm:py-5 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-2xl shadow-[#C9A227]/20"
                >
                  Open Free Account
                </Link>
                <p className="mt-5 sm:mt-6 text-[10px] uppercase tracking-widest text-[var(--text-3)]">
                  No Hidden Fees · Fast Onboarding · Est. 2019
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}

