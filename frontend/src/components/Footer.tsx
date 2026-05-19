import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-deep)] rounded-t-[24px] sm:rounded-t-[40px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-8 sm:gap-12 mb-10 sm:mb-16">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 relative flex-shrink-0">
                <Image src="/logo.png" alt="MarketMinds" fill className="object-contain" />
              </div>
              <span
                className="font-bold text-base tracking-tight text-gold-gradient"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                MarketMinds
              </span>
            </Link>
            <p className="text-[var(--text-3)] text-xs leading-relaxed">
              Wealth management for those who take the long view.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-3)] mb-5">Company</p>
              <ul className="space-y-3">
                {[
                  { label: "About", href: "/about" },
                  { label: "Team", href: "/about#team" },
                  { label: "Careers", href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-xs text-[var(--text-2)] hover:text-[#C9A227] transition-colors tracking-wide">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-3)] mb-5">Invest</p>
              <ul className="space-y-3">
                {[
                  { label: "Mutual Funds", href: "/dashboard" },
                  { label: "SIP Planner", href: "/dashboard" },
                  { label: "Tax Saver", href: "/dashboard" },
                  { label: "Portfolio", href: "/dashboard" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-xs text-[var(--text-2)] hover:text-[#C9A227] transition-colors tracking-wide">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="gold-line mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[var(--text-4)] text-[10px] leading-relaxed max-w-2xl">
            Mutual fund investments are subject to market risks. Past performance is not indicative of future returns.
            MarketMinds Financial Services Pvt. Ltd.
          </p>
          <div className="flex gap-5 flex-shrink-0">
            {["Privacy", "Terms", "Grievances"].map((item) => (
              <Link key={item} href="#" className="text-[10px] uppercase tracking-wider text-[var(--text-3)] hover:text-[#C9A227] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-[var(--text-4)] text-[10px] mt-4">
          © {new Date().getFullYear()} MarketMinds Financial Services Pvt. Ltd.
        </p>
      </div>
    </footer>
  );
}
