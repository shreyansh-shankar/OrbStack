"use client";

import { SOCIAL_LINKS } from "@/lib/constants";


export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        overflow: "hidden",
      }}
    >
      {/* ── Background layers ──────────────────── */}

      {/* Deep space grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 110%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 110%)",
      }} />

      {/* Primary glow orb */}
      <div
        className="animate-float-slow"
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.03) 50%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Secondary purple orb */}
      <div
        className="animate-float"
        style={{
          position: "absolute",
          top: "30%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
          animationDelay: "2s",
        }}
      />

      {/* Tertiary cyan orb */}
      <div
        className="animate-float"
        style={{
          position: "absolute",
          top: "20%",
          left: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          filter: "blur(25px)",
          pointerEvents: "none",
          animationDelay: "4s",
        }}
      />

      {/* ── Content ──────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "900px",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
          <span className="section-badge animate-pulse-glow" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)", color: "#4ade80" }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(34,197,94,0.8)",
            }} />
            Now Live · Start Practicing Today
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up-1"
          style={{
            fontSize: "clamp(42px, 7vw, 88px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            marginBottom: "24px",
          }}
        >
          Learn DevOps by
          <br />
          <span className="text-gradient">fixing real systems</span>
          <span style={{ color: "#22c55e" }}>.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="animate-fade-in-up-2"
          style={{
            fontSize: "clamp(17px, 2vw, 21px)",
            color: "#8888aa",
            lineHeight: 1.65,
            maxWidth: "600px",
            margin: "0 auto 40px",
            fontWeight: 400,
          }}
        >
          An open-source platform where you learn by doing.{" "}
          <span style={{ color: "#a0a0cc" }}>
            Local labs. Real terminals. No cloud fees.
          </span>
        </p>

        {/* Secondary CTAs — no "Start Practicing" (moved to dedicated section) */}
        <div
          className="animate-fade-in-up-3"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "56px",
          }}
        >
          <a
            href="https://docs.thelastdeploy.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 500,
              color: "#c8c8e0",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            Read Docs
          </a>

          <a
            href={SOCIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 500,
              color: "#c8c8e0",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join Discord
          </a>

          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 500,
              color: "#c8c8e0",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        {/* Live badge strip */}
        <div
          className="animate-fade-in-up-4"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}
        >
          {[
            { icon: "🚀", text: "Platform is live" },
            { icon: "🔓", text: "No sign-up required" },
            { icon: "🐋", text: "Just needs Docker" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px" }}>{icon}</span>
              <span style={{ fontSize: "12px", color: "#5a5a7a", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.04em" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating terminal preview ──────────── */}
      <div
        className="animate-fade-in-up-5"
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "64px",
          width: "100%",
          maxWidth: "720px",
        }}
      >
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#ff5f57" }} />
            <div className="terminal-dot" style={{ background: "#febc2e" }} />
            <div className="terminal-dot" style={{ background: "#28c840" }} />
            <span style={{
              marginLeft: "10px",
              fontSize: "12px",
              color: "#4a4a6a",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              ~ / tld
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: "#4a4a6a", fontFamily: "monospace" }}>bash</span>
            </div>
          </div>
          <div style={{
            padding: "20px 24px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "#4a4a6a", marginBottom: "4px" }}># Start your first real DevOps lab</div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ color: "#22c55e" }}>❯</span>
              {" "}<span style={{ color: "#f0f0ff" }}>tld start docker-fundamentals</span>
            </div>
            <div style={{ color: "#22c55e", marginBottom: "2px", paddingLeft: "12px" }}>
              ✓ Environment ready — 3 containers spun up
            </div>
            <div style={{ color: "#4a4a6a", paddingLeft: "12px", marginBottom: "12px" }}>
              → Break the system. Fix it. Validate.
            </div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ color: "#22c55e" }}>❯</span>
              {" "}<span style={{ color: "#f0f0ff" }}>tld check</span>
            </div>
            <div style={{ color: "#22c55e", paddingLeft: "12px", marginBottom: "4px" }}>
              ✓ All 5 checks passed
            </div>
            <div style={{ paddingLeft: "12px", color: "#a855f7" }}>
              🎉 +50 XP · Level up: <span style={{ color: "#e879f9" }}>Container Engineer II</span>
            </div>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#22c55e" }}>❯</span>
              {" "}
              <span className="animate-blink" style={{ color: "#f0f0ff", borderRight: "2px solid #22c55e", paddingRight: "2px" }}>
                {" "}
              </span>
            </div>
          </div>
        </div>

        {/* Glow under terminal */}
        <div style={{
          position: "absolute",
          bottom: "-30px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "60px",
          background: "radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        opacity: 0.4,
      }}>
        <span style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em", color: "#8888aa" }}>scroll</span>
        <div style={{
          width: "20px",
          height: "32px",
          border: "1.5px solid rgba(136,136,170,0.4)",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          paddingTop: "4px",
        }}>
          <div
            className="animate-float"
            style={{
              width: "4px",
              height: "8px",
              borderRadius: "2px",
              background: "#22c55e",
              animationDuration: "1.5s",
            }}
          />
        </div>
      </div>
    </section>
  );
}
