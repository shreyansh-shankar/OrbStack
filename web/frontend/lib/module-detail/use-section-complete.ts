// web/frontend/lib/module-detail/use-section-complete.ts

import { useCallback, useRef } from "react";
import { patchCacheUser, readCache, patchDashboardCacheModuleSectionCompleted } from "@/lib/dashboard/use-dashboard-cache";
import { patchModulesMemoryCache } from "@/hooks/use-modules";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.thelastdeploy.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

interface Options {
  onComplete: (sectionId: string, xpAwarded: number) => void;
}

export function useSectionComplete({ onComplete }: Options) {
  const firedRef = useRef<Set<string>>(new Set());

  const completeSection = useCallback(
    async (moduleId: string, sectionId: string, sectionXp: number) => {
      if (firedRef.current.has(sectionId)) return;
      firedRef.current.add(sectionId);

      const token = getToken();
      if (!token) return;

      // 1. Instant UI update + optimistic cache patch (section id + xp)
      onComplete(sectionId, sectionXp);

      // 2. Optimistic cache update — add section to completed + add xp immediately
      //    This persists even if browser closes before API responds
      const cache = readCache();
      const optimisticXp = cache ? cache.user.xp + sectionXp : undefined;
      patchCacheUser({
        completed_sections: [sectionId],
        ...(optimisticXp !== undefined && { xp: optimisticXp }),
      });
      patchModulesMemoryCache(moduleId, sectionId);
      patchDashboardCacheModuleSectionCompleted(moduleId, sectionId);

      // 3. Background API call — confirms with backend's authoritative XP value
      try {
        const res = await fetch(
          `${API_BASE}/modules/${moduleId}/sections/${sectionId}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const { total_xp } = await res.json();
          // Overwrite with backend's confirmed total (handles edge cases like double-completion)
          patchCacheUser({ xp: total_xp });
        }
      } catch {
        // sendBeacon fallback for tab-close scenario
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob(
            [JSON.stringify({ token, module_id: moduleId, section_id: sectionId })],
            { type: "application/json" }
          );
          navigator.sendBeacon(`${API_BASE}/beacon/complete-section`, blob);
        }
        firedRef.current.delete(sectionId);
      }
    },
    [onComplete]
  );

  return { completeSection };
}