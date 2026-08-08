"use client";

import { SOCIAL_LINKS } from "@/lib/constants";

export default function CTA() {
  return (
    <section
      id="cta"
      style={{
        position: "relative",
        padding: "96px 24px 112px",
        overflow: "hidden",
      }}
    >
      {/* Border top with glow */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(88,101,242,0.5) 30%, rgba(168,85,247,0.4) 70%, transparent)",
      }} />

      {/* Big ambient glow */}
      <div
        className="animate-float-slow"
        style={{
          position: "absolute",
          top: "0%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background: "radial-gradient(ellipse at center, rgba(88,101,242,0.08) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(88,101,242,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(88,101,242,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 100% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 100% at 50% 50%, black 40%, transparent 100%)",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "640px",
        margin: "0 auto",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{ marginBottom: "24px" }}>
          <span className="section-badge" style={{
            borderColor: "rgba(88,101,242,0.3)",
            background: "rgba(88,101,242,0.08)",
            color: "#818cf8",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#5865F2",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(88,101,242,0.8)",
            }} />
            Community · Open to everyone
          </span>
        </div>

        <h2 style={{
          fontSize: "clamp(32px, 5vw, 60px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          marginBottom: "20px",
        }}>
          Come build with{" "}
          <span style={{
            background: "linear-gradient(135deg, #5865F2, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            us on Discord
          </span>
        </h2>

        <p style={{
          fontSize: "18px",
          color: "#8888aa",
          lineHeight: 1.65,
          maxWidth: "480px",
          margin: "0 auto 40px",
        }}>
          Ask questions, share your progress, help shape the platform, and stay on top of every new track and feature we ship.
        </p>

        {/* Discord CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <a
            href={SOCIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 36px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #5865F2, #4752c4)",
              borderRadius: "12px",
              textDecoration: "none",
              border: "1px solid rgba(88,101,242,0.4)",
              boxShadow: "0 0 24px rgba(88,101,242,0.25), 0 4px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(88,101,242,0.4), 0 8px 32px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(88,101,242,0.25), 0 4px 20px rgba(0,0,0,0.3)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join the Discord Server
          </a>

          {/* GitHub fallback */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#4a4a6a" }}>or</span>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#8888aa",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f0f0ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#8888aa"; }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Follow on GitHub instead
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
