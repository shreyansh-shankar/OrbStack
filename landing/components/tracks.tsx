"use client";

import { TRACKS, TRACK_COLORS } from "@/lib/constants";

const TRACK_ICONS: Record<string, React.ReactNode> = {
  Linux: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h.01M12 8h.01M17 8h.01M7 12h10"/>
    </svg>
  ),
  Git: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M6 9v6M15.5 6.5l-9 9"/>
    </svg>
  ),
  Docker: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="9" width="4" height="4"/><rect x="7" y="9" width="4" height="4"/>
      <rect x="12" y="9" width="4" height="4"/><rect x="7" y="4" width="4" height="4"/>
      <rect x="12" y="4" width="4" height="4"/>
      <path d="M20 12c0 4-2 6-8 6s-8-2-8-6"/>
      <path d="M22 10c-1 0-2 .5-2 1.5"/>
    </svg>
  ),
  Kubernetes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  Terraform: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="7" x2="22" y2="7"/>
    </svg>
  ),
  Nginx: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2C6 8 6 16 12 22M12 2c6 6 6 14 0 20"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  Jenkins: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      <circle cx="12" cy="12" r="7"/>
    </svg>
  ),
};

const TRACK_ACCENT: Record<string, { icon: string; glow: string; text: string; border: string; bg: string }> = {
  green:  { icon: "#22c55e", glow: "rgba(34,197,94,0.08)",   text: "#4ade80", border: "rgba(34,197,94,0.15)",  bg: "rgba(34,197,94,0.04)" },
  purple: { icon: "#a855f7", glow: "rgba(168,85,247,0.08)",  text: "#c084fc", border: "rgba(168,85,247,0.15)", bg: "rgba(168,85,247,0.04)" },
  orange: { icon: "#f97316", glow: "rgba(249,115,22,0.08)",  text: "#fb923c", border: "rgba(249,115,22,0.15)", bg: "rgba(249,115,22,0.04)" },
  red:    { icon: "#ef4444", glow: "rgba(239,68,68,0.08)",   text: "#f87171", border: "rgba(239,68,68,0.15)",  bg: "rgba(239,68,68,0.04)" },
  cyan:   { icon: "#06b6d4", glow: "rgba(6,182,212,0.08)",   text: "#22d3ee", border: "rgba(6,182,212,0.15)",  bg: "rgba(6,182,212,0.04)" },
  yellow: { icon: "#eab308", glow: "rgba(234,179,8,0.08)",   text: "#facc15", border: "rgba(234,179,8,0.15)",  bg: "rgba(234,179,8,0.04)" },
};

export default function Tracks() {
  return (
    <section
      className="section-divider"
      style={{ padding: "96px 24px", position: "relative", overflow: "hidden" }}
    >
      {/* bg glow */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "300px",
        background: "radial-gradient(ellipse, rgba(168,85,247,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-badge">Learning Tracks</span>
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            From kernel to{" "}
            <span className="text-gradient">cluster</span>
          </h2>
          <p style={{ fontSize: "18px", color: "#8888aa", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
            Hands-on labs across the full DevOps stack. Each track builds on the last.
          </p>
        </div>

        {/* Tracks grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {TRACKS.map((track) => {
            const accent = TRACK_ACCENT[track.color] ?? TRACK_ACCENT.green;
            return (
              <div
                key={track.name}
                style={{
                  borderRadius: "16px",
                  padding: "28px",
                  background: "rgba(13,13,31,0.7)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${accent.border}`,
                  cursor: "default",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = `0 0 30px ${accent.glow}, 0 20px 40px rgba(0,0,0,0.3)`;
                  el.style.borderColor = accent.icon + "40";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "none";
                  el.style.boxShadow = "none";
                  el.style.borderColor = accent.border;
                }}
              >
                {/* Background accent glow */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "120px",
                  height: "120px",
                  background: `radial-gradient(circle at top right, ${accent.glow}, transparent)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: accent.bg,
                    border: `1px solid ${accent.border}`,
                    color: accent.icon,
                  }}>
                    {TRACK_ICONS[track.name]}
                  </div>

                  {track.status === "coming-soon" ? (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#6a6a8a",
                    }}>
                      Coming Soon
                    </span>
                  ) : (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      border: `1px solid ${accent.border}`,
                      background: accent.bg,
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: accent.text,
                    }}>
                      <span style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: accent.icon,
                        display: "inline-block",
                        boxShadow: `0 0 4px ${accent.icon}`,
                      }} />
                      Available
                    </span>
                  )}
                </div>

                <h3 style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: accent.text,
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}>
                  {track.name}
                </h3>
                <p style={{
                  fontSize: "13px",
                  color: "#6a6a8a",
                  lineHeight: 1.65,
                }}>
                  {track.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* "And many more" hint */}
        <div style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "999px",
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a4a6a" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#4a4a6a", fontWeight: 500 }}>
              and many more tracks coming soon
            </span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
        </div>
      </div>
    </section>
  );
}
