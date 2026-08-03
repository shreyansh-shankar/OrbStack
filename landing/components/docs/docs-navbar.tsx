"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SOCIAL_LINKS } from "@/lib/constants";

const DocsSearch = dynamic(() => import("./search"), { ssr: false });

export default function DocsNavbar({
  isSubdomain,
  onMenuOpen,
}: {
  isSubdomain: boolean;
  onMenuOpen?: () => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mainSiteUrl, setMainSiteUrl] = useState("/");

  useEffect(() => {
    const host = window.location.host;
    if (host.startsWith("docs.localhost")) {
      setMainSiteUrl("http://localhost:3002/");
    } else if (host.startsWith("docs.")) {
      setMainSiteUrl("https://thelastdeploy.com/");
    } else {
      setMainSiteUrl("/");
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="docs-navbar">
        <div className="docs-navbar-inner">
          {/* Left — logo + back to site */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Mobile hamburger */}
            <button
              onClick={onMenuOpen}
              className="docs-mobile-menu-btn"
              type="button"
              style={{
                display: "none",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#6666aa",
                padding: "4px",
              }}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <a
              href={mainSiteUrl}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <img src="/logo.png" alt="TLD" style={{ height: "28px", width: "auto" }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0ff", letterSpacing: "-0.02em" }}>
                  The Last Deploy
                </span>
                <span style={{ fontSize: "10px", color: "#3a3a5a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Docs
                </span>
              </div>
            </a>

            {/* Divider */}
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.06)" }} />

            <a
              href={mainSiteUrl}
              style={{
                fontSize: "12px",
                color: "#4a4a6a",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a0a0c0"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4a4a6a"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to site
            </a>
          </div>

          {/* Center — search */}
          <button
            onClick={() => setSearchOpen(true)}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#4a4a6a",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s",
              minWidth: "200px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.15)";
              (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ flex: 1, textAlign: "left" }}>Search docs...</span>
            <span style={{ display: "flex", gap: "3px" }}>
              <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: "3px", color: "#3a3a5a" }}>
                ⌘
              </kbd>
              <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: "3px", color: "#3a3a5a" }}>
                K
              </kbd>
            </span>
          </button>

          {/* Right — GitHub + version */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#6666aa",
                textDecoration: "none",
                borderRadius: "7px",
                border: "1px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f0f0ff";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#6666aa";
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                padding: "3px 8px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "999px",
                color: "#22c55e",
                fontWeight: 600,
              }}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </header>

      {searchOpen && <DocsSearch isSubdomain={isSubdomain} onClose={() => setSearchOpen(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .docs-mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
