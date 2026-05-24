"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/AnimatedCounter";

const team = [
  { name: "Bablu Singh", role: "Founder", bio: "Built MarketMinds to give select individuals access to high-velocity algorithms and institutional-grade investment strategies.", initials: "BS" },
];

const milestones = [
  { year: "2019", event: "Founded in Mumbai. Began testing proprietary high-frequency models." },
  { year: "2021", event: "First private partners onboarded. Validated algo-driven strategies in live markets." },
  { year: "2023", event: "Opened our Hyper Growth pool to select partners. Consistent absolute returns delivered." },
  { year: "2025", event: "₹35L+ AUM. 100+ active partners. Introduced Daily Rewards and Weekly Payout systems." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden pt-20 sm:pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#C9A227]/4 rounded-full blur-[80px] sm:blur-[100px]" />
        </div>

        <p
          className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[#C9A227] mb-4 sm:mb-6 animate-hero"
          style={{ animationDelay: "100ms" }}
        >
          Our Story
        </p>
        <h1
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 sm:mb-8 max-w-3xl animate-hero"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif", animationDelay: "200ms" }}
        >
          Built for those<br />
          <span className="italic text-gold-gradient">who think exponential.</span>
        </h1>
        <p
          className="text-[var(--text-2)] text-base sm:text-lg max-w-sm sm:max-w-xl leading-relaxed font-light animate-hero"
          style={{ animationDelay: "300ms" }}
        >
          Traditional markets offer incremental growth. We leverage advanced algorithms 
          to generate high-velocity, absolute returns for our partners.
        </p>
      </section>

      {/* ── MISSION STATEMENT ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 border-y border-[var(--border)]">
        <AnimatedSection direction="fade" className="max-w-4xl mx-auto text-center">
          <p
            className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-[var(--text-2)]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            &ldquo;We don&apos;t believe in locking your money away for decades.
            <span className="text-[var(--text)] font-bold"> Our systems are designed to extract value daily, offering unmatched liquidity and growth.</span>&rdquo;
          </p>
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-xs font-bold flex-shrink-0">BS</div>
            <div className="text-left">
              <p className="text-[var(--text)] text-xs font-semibold">Bablu Singh</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-3)]">Founder</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          {[
            { val: "₹35L+", label: "Capital Deployed" },
            { val: "100+", label: "Active Partners" },
            { val: "42.5%",   label: "Avg. Annual Returns" },
            { val: "5 Yrs",   label: "In Private Markets" },
          ].map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 100} className="border-t border-[var(--border)] pt-5 sm:pt-6">
              <AnimatedCounter
                value={s.val}
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gold-gradient mb-1.5 sm:mb-2"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">{s.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-alt)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-10 sm:mb-16 text-center">Our Principles</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { n: "I",   title: "Absolute alignment.",          body: "We don't make money from entry loads or management fees. Our performance is measured by your returns, not by fees extracted from your capital." },
              { n: "II",  title: "High-velocity compounding.",           body: "We built this for high-velocity compounding and absolute returns. Every decision is driven by maximizing short-term yield safely." },
              { n: "III", title: "Unmatched liquidity.", body: "Daily rewards and weekly payouts. Your capital works hard, but the profits are always within your reach." },
              { n: "IV",  title: "Quantifiable edges.",        body: "Every trade is driven by quantitative analysis. We don't guess. We've spent years building models that consistently outperform traditional asset classes." },
            ].map((v, i) => (
              <AnimatedSection key={v.n} delay={i * 100} direction="up">
                <div className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[#C9A227]/20 rounded-[20px] sm:rounded-2xl p-6 sm:p-8 transition-all duration-500 h-full">
                  <span className="font-display text-xs text-[#C9A227] mb-3 sm:mb-4 block" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {v.n}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {v.title}
                  </h3>
                  <p className="text-[var(--text-2)] text-sm leading-relaxed">{v.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-10 sm:mb-16 text-center">The Journey</p>
          </AnimatedSection>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <AnimatedSection key={m.year} delay={i * 120} direction="left">
                <div className="flex gap-5 sm:gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-8 bg-[var(--border)]" style={{ opacity: i === 0 ? 0 : 1 }} />
                    <div className="w-2 h-2 rounded-full bg-[#C9A227] flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                    <div className="w-px flex-1 bg-[var(--border)]" style={{ opacity: i === milestones.length - 1 ? 0 : 1 }} />
                  </div>
                  <div className="pb-10 sm:pb-12 pt-1">
                    <p className="font-display font-bold text-[#C9A227] text-sm mb-1.5 sm:mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      {m.year}
                    </p>
                    <p className="text-[var(--text-2)] text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-alt)]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-2)] mb-10 sm:mb-16 text-center">The Team</p>
          </AnimatedSection>
          <div className="flex justify-center">
            {team.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 100} direction="up">
                <div className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[#C9A227]/20 rounded-[20px] sm:rounded-2xl p-6 sm:p-7 transition-all duration-500 w-72 sm:w-80">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] font-bold text-sm mb-4 sm:mb-5">
                    {member.initials}
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {member.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A227] mb-3 sm:mb-4">{member.role}</p>
                  <p className="text-[var(--text-2)] text-xs leading-relaxed">{member.bio}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#C9A227]/3 rounded-full blur-[80px] sm:blur-[100px]" />
        </div>
        <AnimatedSection direction="up" className="relative">
          <h2
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ready to join?
          </h2>
          <Link
            href="/dashboard"
            className="inline-block px-8 sm:px-10 py-4 sm:py-5 bg-[#C9A227] hover:bg-[#E8C65A] text-black text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-2xl shadow-[#C9A227]/20"
          >
            Start Investing
          </Link>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}
