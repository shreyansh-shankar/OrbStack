"use client";

import { SOCIAL_LINKS } from "@/lib/constants";

const socials = [
  {
    name: "GitHub",
    href: SOCIAL_LINKS.github,
    handle: "@thelastdeploy",
    description: "Star the repo, open issues, contribute to labs and the platform",
    accent: "#f0f0ff",
    bg: "rgba(240,240,255,0.04)",
    border: "rgba(240,240,255,0.08)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: SOCIAL_LINKS.discord,
    handle: "discord.gg/tgShvdV8f",
    description: "Ask questions, share progress, and help shape the platform with the community",
    accent: "#818cf8",
    bg: "rgba(88,101,242,0.05)",
    border: "rgba(88,101,242,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: SOCIAL_LINKS.linkedin,
    handle: "thelastdeploy",
    description: "Follow us on LinkedIn for platform updates and news",
    accent: "#0a66c2",
    bg: "rgba(10,102,194,0.05)",
    border: "rgba(10,102,194,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    name: "Blog",
    href: SOCIAL_LINKS.blog,
    handle: "thelastdeploy.hashnode.dev",
    description: "Read our technical articles and posts on DevOps and architecture",
    accent: "#2563eb",
    bg: "rgba(37,99,235,0.05)",
    border: "rgba(37,99,235,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M22.348 11.23L12.77 1.654a1.088 1.088 0 0 0-1.54 0L1.654 11.23a1.088 1.088 0 0 0 0 1.54l9.577 9.577a1.088 1.088 0 0 0 1.54 0l9.577-9.577a1.088 1.088 0 0 0 0-1.54zM12 16.27a4.27 4.27 0 1 1 0-8.54 4.27 4.27 0 0 1 0 8.54z"/>
      </svg>
    ),
  },
];

export default function Community() {
  return (
    <section
      className="section-divider"
      style={{ padding: "96px 24px", position: "relative", overflow: "hidden" }}
    >
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "200px",
        background: "radial-gradient(ellipse, rgba(88,101,242,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-badge" style={{
              borderColor: "rgba(88,101,242,0.25)",
              background: "rgba(88,101,242,0.06)",
              color: "#818cf8",
            }}>
              Community
            </span>
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Follow the journey
          </h2>
          <p style={{ fontSize: "18px", color: "#8888aa", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
            We build in public. Watch, star, and become part of it.
          </p>
        </div>

        {/* Social cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          maxWidth: "720px",
          margin: "0 auto",
        }}>
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "28px",
                borderRadius: "16px",
                background: social.bg,
                border: `1px solid ${social.border}`,
                backdropFilter: "blur(12px)",
                textDecoration: "none",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = `0 0 24px ${social.bg.replace("0.04", "0.15").replace("0.05", "0.15")}, 0 16px 32px rgba(0,0,0,0.3)`;
                el.style.borderColor = social.accent + "35";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "none";
                el.style.boxShadow = "none";
                el.style.borderColor = social.border;
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: social.accent }}>
                  {social.icon}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a4a6a" strokeWidth="2">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f0f0ff", marginBottom: "4px" }}>
                  {social.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#4a4a6a", fontFamily: "JetBrains Mono, monospace", marginBottom: "8px" }}>
                  {social.handle}
                </p>
                <p style={{ fontSize: "13px", color: "#6a6a8a", lineHeight: 1.55 }}>
                  {social.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
