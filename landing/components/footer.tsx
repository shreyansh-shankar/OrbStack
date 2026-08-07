"use client";

import { SOCIAL_LINKS } from "@/lib/constants";

const footerLinks = [
  { label: "App", href: "https://app.thelastdeploy.com" },
  { label: "Docs", href: "https://docs.thelastdeploy.com" },
  { label: "GitHub", href: SOCIAL_LINKS.github },
  { label: "Discord", href: SOCIAL_LINKS.discord },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
  { label: "Blog", href: SOCIAL_LINKS.blog },
];

export default function Footer() {
  return (
    <footer style={{
      position: "relative",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "32px 24px",
    }}>
      {/* top accent line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.2) 30%, rgba(168,85,247,0.2) 70%, transparent)",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          {/* Logo */}
          <a
            href="/"
            aria-label="The Last Deploy — home"
            style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          >
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "14px",
              fontWeight: 700,
            }}>
              <span style={{ color: "#22c55e" }}>~/</span>
              <span style={{ color: "#f0f0ff" }}>tld</span>
            </span>
          </a>

          {/* Links */}
          <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "13px",
                  color: "#4a4a6a",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#a0a0cc"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#4a4a6a"; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p style={{ fontSize: "12px", color: "#3a3a5a" }}>
            © {new Date().getFullYear()} The Last Deploy · Open Source · Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
