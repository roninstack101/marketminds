"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navRef = useRef<HTMLElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeEl = nav.querySelector<HTMLElement>("[data-active]");
    if (!activeEl) { setUnderline(u => ({ ...u, visible: false })); return; }
    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setUnderline({ left: elRect.left - navRect.left, width: elRect.width, visible: true });
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--bg)]/40 backdrop-blur-md border-b border-[var(--border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="font-display font-bold text-2xl tracking-tight text-gold-gradient transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(201,162,39,0.6)] group-hover:scale-[1.02]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", display: "inline-block" }}
              >
                MarketMinds
              </span>
            </Link>

            {/* Desktop nav */}
            <nav ref={navRef} className="hidden md:flex items-center gap-8 relative">
              <motion.span
                className="absolute -bottom-px h-px bg-[#C9A227] pointer-events-none"
                animate={{ left: underline.left, width: underline.width, opacity: underline.visible ? 1 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive(link.href) ? "true" : undefined}
                  className={`text-xs font-medium uppercase tracking-widest transition-colors duration-300 py-1 ${
                    isActive(link.href)
                      ? "text-[#C9A227]"
                      : "text-[var(--text-2)] hover:text-[var(--text)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-xs uppercase tracking-widest text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="relative px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-black bg-[#C9A227] hover:bg-[#E8C65A] rounded-full transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="text-[var(--text-2)] hover:text-[var(--text)] transition-colors p-2"
                onClick={() => setMenuOpen(true)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-[var(--surface)] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <span
            className="font-display font-bold text-lg tracking-tight text-gold-gradient"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Menu
          </span>
          <button
            className="text-[var(--text-2)] hover:text-[var(--text)] transition-colors p-2 -mr-2 bg-[var(--bg)] rounded-full"
            onClick={() => setMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col py-6 px-6 space-y-2 flex-grow overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm uppercase tracking-widest font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? "text-[#C9A227] translate-x-2"
                  : "text-[var(--text-2)] hover:text-[var(--text)] hover:translate-x-2"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-deep)]">
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center w-full px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-black bg-[#C9A227] hover:bg-[#E8C65A] transition-colors rounded-full shadow-[0_0_15px_rgba(201,162,39,0.3)] hover:shadow-[0_0_25px_rgba(201,162,39,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
