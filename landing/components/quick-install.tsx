"use client";

import { useState } from "react";

export default function QuickInstall() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"linux" | "mac" | "wsl">("linux");

  const installCommand = "curl -fsSL https://install.thelastdeploy.com | sh";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="install"
      style={{
        position: "relative",
        padding: "80px 24px",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        className="animate-float-slow"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "350px",
          background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-badge" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)", color: "#4ade80" }}>
              ⚡ One-Line Installation
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#f0f0ff",
              marginBottom: "12px",
            }}
          >
            Get Started in Seconds
          </h2>
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "#8888aa",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            Install the native <code style={{ color: "#4ade80" }}>tld</code> binary directly via shell script.
            No dependencies required except Docker.
          </p>
        </div>

        {/* Platform Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          {(
            [
              { id: "linux", label: "Linux" },
              { id: "mac", label: "macOS" },
              { id: "wsl", label: "Windows (WSL2)" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: activeTab === tab.id ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.06)",
                background: activeTab === tab.id ? "rgba(34,197,94,0.15)" : "rgba(13,13,31,0.6)",
                color: activeTab === tab.id ? "#4ade80" : "#8888aa",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Command Box */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(13,13,31,0.95) 0%, rgba(10,10,22,0.98) 100%)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(34,197,94,0.05)",
            position: "relative",
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ marginLeft: "8px", fontSize: "12px", color: "#5a5a7a", fontFamily: "monospace" }}>
                {activeTab === "wsl" ? "ubuntu@wsl:~$" : "bash"}
              </span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: copied ? "#22c55e" : "#e2e8f0",
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                border: copied ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Command
                </>
              )}
            </button>
          </div>

          {/* Command Code Display */}
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "clamp(13px, 1.8vw, 15px)",
              color: "#4ade80",
              wordBreak: "break-all",
              lineHeight: 1.6,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ color: "#5a5a7a", userSelect: "none" }}>$</span>
            <span>{installCommand}</span>
          </div>

          {/* Tab Specific Note */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px dashed rgba(255,255,255,0.06)",
              fontSize: "13px",
              color: "#8888aa",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#eab308" }}>💡</span>
            {activeTab === "linux" && (
              <span>Detects x86_64 and ARM64 architecture automatically and verifies SHA-256 checksums.</span>
            )}
            {activeTab === "mac" && (
              <span>Supports both Intel and Apple Silicon (M1/M2/M3/M4) Macs natively.</span>
            )}
            {activeTab === "wsl" && (
              <span>Open your <strong>Ubuntu WSL2 terminal</strong> and paste the command above to install.</span>
            )}
          </div>
        </div>

        {/* Post Install Guidance */}
        <div
          style={{
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(13,13,31,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#5a5a7a", marginBottom: "4px", fontWeight: 600 }}>NEXT STEP 1</div>
            <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#f0f0ff" }}>tld doctor</div>
            <div style={{ fontSize: "12px", color: "#8888aa", marginTop: "4px" }}>Checks Docker daemon and environment setup</div>
          </div>

          <div
            style={{
              background: "rgba(13,13,31,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#5a5a7a", marginBottom: "4px", fontWeight: 600 }}>NEXT STEP 2</div>
            <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#f0f0ff" }}>tld sync --all</div>
            <div style={{ fontSize: "12px", color: "#8888aa", marginTop: "4px" }}>Downloads all lab challenges to your machine</div>
          </div>
        </div>
      </div>
    </section>
  );
}
