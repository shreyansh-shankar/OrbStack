// landing/lib/analytics.ts

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8742";
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://api.thelastdeploy.com";
}

/**
 * Send an anonymous analytics event to the backend proxy endpoint.
 * Fire-and-forget, non-blocking, and 100% privacy-preserving.
 */
export function trackEvent(event: string, properties?: Record<string, any>): void {
  if (typeof window === "undefined") return;

  try {
    const url = `${getApiBaseUrl()}/analytics/track`;
    const payload = JSON.stringify({ event, properties });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently ignore errors
      });
    }
  } catch {
    // Non-fatal, ignore
  }
}
