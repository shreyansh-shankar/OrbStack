"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      trackEvent("$pageview", {
        $current_url: typeof window !== "undefined" ? window.location.href : pathname,
        $pathname: pathname,
        $host: typeof window !== "undefined" ? window.location.host : "",
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
