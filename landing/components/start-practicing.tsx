"use client";

export default function StartPracticing() {
  return (
    <section
      id="start-practicing"
      style={{
        position: "relative",
        padding: "80px 24px",
        overflow: "hidden",
      }}
    >
      {/* Section divider top */}
      <div className="section-divider" style={{ marginBottom: "80px" }} />

      {/* Background glow */}
      <div
        className="animate-float-slow"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)",
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
        {/* Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(13,13,31,0.9) 0%, rgba(10,10,22,0.95) 100%)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "20px",
            padding: "clamp(40px, 6vw, 72px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(34,197,94,0.06)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "0",
          }}
        >
          {/* Inner grid pattern */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            borderRadius: "20px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          }} />

          {/* Top accent line */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)",
            borderRadius: "1px",
          }} />

          {/* Badge */}
          <div style={{ marginBottom: "28px", position: "relative", zIndex: 1 }}>
            <span className="section-badge" style={{
              background: "rgba(34,197,94,0.1)",
              borderColor: "rgba(34,197,94,0.3)",
              color: "#4ade80",
              fontSize: "12px",
              padding: "6px 16px",
            }}>
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 8px rgba(34,197,94,0.9)",
              }} />
              Now Live · Free to Use
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "clamp(30px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              marginBottom: "18px",
              color: "#f0f0ff",
            }}
          >
            Ready to break{" "}
            <span style={{
              background: "linear-gradient(135deg, #22c55e 0%, #86efac 60%, #22c55e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% auto",
              animation: "gradient-shift 4s ease infinite",
            }}>
              real systems?
            </span>
          </h2>

          {/* Description */}
          <p style={{
            position: "relative",
            zIndex: 1,
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#8888aa",
            lineHeight: 1.7,
            maxWidth: "520px",
            marginBottom: "40px",
          }}>
            Jump into the platform. Spin up a lab, break something, fix it — all locally with no sign-up required.
          </p>

          {/* Stats row */}
          <div style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "32px",
            marginBottom: "44px",
          }}>
            {[
              { value: "7+", label: "Learning Tracks" },
              { value: "100%", label: "Open Source" },
              { value: "0$", label: "Cloud Fees" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg, #22c55e, #86efac)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "12px", color: "#5a5a7a", letterSpacing: "0.04em", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <a
              href="https://app.thelastdeploy.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "18px 44px",
                fontSize: "16px",
                fontWeight: 700,
                color: "#030a04",
                background: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)",
                backgroundSize: "200% auto",
                animation: "gradient-shift 3s ease infinite",
                borderRadius: "12px",
                textDecoration: "none",
                border: "1px solid rgba(34,197,94,0.5)",
                boxShadow: "0 0 30px rgba(34,197,94,0.3), 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.1)",
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(34,197,94,0.45), 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(34,197,94,0.3), 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.1)";
              }}
            >
              {/* Terminal icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              Start Practicing — It&apos;s Free
            </a>

            <p style={{
              marginTop: "14px",
              fontSize: "12px",
              color: "#4a4a6a",
              letterSpacing: "0.03em",
            }}>
              No credit card. No account required. Just Docker.
            </p>
          </div>

          {/* Bottom accent */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent)",
          }} />
        </div>
      </div>
    </section>
  );
}
