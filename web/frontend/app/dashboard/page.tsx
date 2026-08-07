// web/frontend/app/dashboard/page.tsx
// v2026.08

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDashboardCache } from "@/lib/dashboard/use-dashboard-cache";
import { ModuleDetail } from "@/lib/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionBadge } from "@/components/dashboard/section-badge";
import { getRank, getNextRank, getXpProgress } from "@/lib/ranks";
import { Zap, Trophy, Terminal, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading } = useDashboardCache();

  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login");
  }, [authUser, authLoading, router]);

  if (authLoading || (loading && !data)) return <LoadingSpinner className="py-40" />;
  if (!data) return null;

  const { user, modules } = data;
  const rank = getRank(user.xp);
  const nextRank = getNextRank(user.xp);
  const xpProgress = getXpProgress(user.xp);

  const isModuleComplete = (m: ModuleDetail) => {
    const allLabs = m.sections.flatMap((s) => s.labs);
    // Module complete = all labs done + all reading sections done
    const allSections = m.sections;
    const labsDone = allLabs.length === 0 || allLabs.every((l) => user.completed_labs.includes(l.id));
    const readingDone = allSections
      .filter((s) => s.labs.length === 0)
      .every((s) => user.completed_sections.includes(s.id));
    return labsDone && readingDone && allSections.length > 0;
  };

  const isModuleInProgress = (m: ModuleDetail) => {
    const allLabs = m.sections.flatMap((s) => s.labs);
    const hasLabProgress = allLabs.some((l) => user.completed_labs.includes(l.id));
    const hasSectionProgress = m.sections.some((s) => user.completed_sections.includes(s.id));
    return (hasLabProgress || hasSectionProgress) && !isModuleComplete(m);
  };

  const labToModule: Record<string, string> = {};
  modules.forEach((m) => m.sections.forEach((s) => s.labs.forEach((l) => { labToModule[l.id] = m.id; })));

  const getModuleRecencyIndex = (m: ModuleDetail) => {
    const allLabs = m.sections.flatMap((s) => s.labs);
    const allSections = m.sections;
    
    let minIdx = Infinity;
    allLabs.forEach((l) => {
      const idx = user.completed_labs.indexOf(l.id);
      if (idx !== -1 && idx < minIdx) {
        minIdx = idx;
      }
    });
    allSections.forEach((s) => {
      const idx = user.completed_sections.indexOf(s.id);
      if (idx !== -1 && idx < minIdx) {
        minIdx = idx;
      }
    });
    
    return minIdx;
  };

  const completedModules = modules.filter(isModuleComplete);
  const inProgressModules = modules.filter(isModuleInProgress);

  const activeModules = modules
    .filter((m) => isModuleComplete(m) || isModuleInProgress(m))
    .sort((a, b) => getModuleRecencyIndex(a) - getModuleRecencyIndex(b));

  const activeModulesToShow = activeModules.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Top banner */}
      <div
        className="rounded-2xl border p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-card border-border shadow-sm"
        style={{
          background: `linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.06) 0%, rgba(0,0,0,0) 60%)`,
        }}
      >
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 border-2" style={{ borderColor: rank.color }}>
            <AvatarFallback className="text-xl font-black" style={{ backgroundColor: `${rank.color}20`, color: rank.color }}>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-foreground">{user.username}</h1>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full border"
                style={{ color: rank.color, borderColor: `${rank.color}40`, backgroundColor: `${rank.color}15` }}
              >
                {rank.label}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {nextRank && (
              <p className="text-xs text-muted-foreground mt-1">
                <span style={{ color: rank.color }} className="font-bold">{xpProgress.needed - xpProgress.current} XP</span>
                {" "}to reach <span style={{ color: nextRank.color }} className="font-bold">{nextRank.label}</span>
              </p>
            )}
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Rank Progress</span>
            <span className="font-mono font-bold" style={{ color: rank.color }}>
              {xpProgress.current} / {xpProgress.needed || "MAX"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpProgress.pct}%`, backgroundColor: rank.color, boxShadow: `0 0 8px ${rank.color}60` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">{rank.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-[var(--accent-primary)]" />
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total XP</span>
          </div>
          <p className="text-3xl font-black font-mono text-[var(--accent-primary)]">{user.xp}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: "var(--topic-linux)", borderColor: "var(--topic-linux-border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4" style={{ color: "var(--topic-linux-text)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--topic-linux-text)" }}>Completed Labs</span>
          </div>
          <p className="text-3xl font-black font-mono" style={{ color: "var(--topic-linux-text)" }}>
            {user.completed_labs.length}<span className="text-sm font-normal opacity-60 ml-1">labs</span>
          </p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: "var(--topic-kubernetes)", borderColor: "var(--topic-kubernetes-border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4" style={{ color: "var(--topic-kubernetes-text)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--topic-kubernetes-text)" }}>Completed</span>
          </div>
          <p className="text-3xl font-black font-mono" style={{ color: "var(--topic-kubernetes-text)" }}>
            {completedModules.length}
            <span className="text-sm font-normal opacity-60 ml-1">modules</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4" style={{ color: rank.color }} />
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Rank</span>
          </div>
          <p className="text-xl font-black" style={{ color: rank.color }}>{rank.label}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Modules progress */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg text-foreground">Recent Modules</h2>
              <div className="flex items-center gap-3">
                <Link href="/modules" className="text-xs font-bold flex items-center gap-1 hover:opacity-80 text-[var(--accent-primary)]">
                  Browse all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {activeModules.length === 0 ? (
              <div className="text-center py-10">
                <Terminal className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No modules started yet.</p>
                <Link href="/modules" className="text-sm font-semibold mt-2 inline-block hover:opacity-80 text-[var(--accent-primary)]">
                  Start your first module →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeModulesToShow.map((m) => {
                  const isComplete = isModuleComplete(m);
                  if (isComplete) {
                    return (
                      <Link key={m.id} href={`/modules/${m.id}`}>
                        <div
                          className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] hover:border-[rgba(var(--accent-primary-rgb),0.3)] cursor-pointer"
                          style={{ backgroundColor: "rgba(var(--accent-primary-rgb),0.03)", borderColor: "rgba(var(--accent-primary-rgb),0.15)" }}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent-primary)]" />
                            <div>
                              <p className="font-bold text-sm text-foreground">{m.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{m.sections.length} sections · {m.total_xp} XP earned</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 bg-[rgba(var(--accent-primary-rgb),0.08)] text-[var(--accent-primary)] border border-[rgba(var(--accent-primary-rgb),0.15)]">
                            Complete
                          </span>
                        </div>
                      </Link>
                    );
                  } else {
                    const allLabs = m.sections.flatMap((s) => s.labs);
                    const allItems = [
                      ...allLabs.map((l) => ({ id: l.id, type: "lab" })),
                      ...m.sections.filter((s) => s.labs.length === 0).map((s) => ({ id: s.id, type: "section" })),
                    ];
                    const done = allItems.filter((item) =>
                      item.type === "lab"
                        ? user.completed_labs.includes(item.id)
                        : user.completed_sections.includes(item.id)
                    ).length;
                    const pct = allItems.length > 0 ? Math.round((done / allItems.length) * 100) : 0;

                    return (
                      <Link key={m.id} href={`/modules/${m.id}`}>
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/20 transition-all hover:scale-[1.01] hover:bg-muted/40 cursor-pointer">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-5 h-5 rounded-full border-2 border-border shrink-0 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{m.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--accent-primary)" }} />
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">{done}/{allItems.length} completed</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-3 font-semibold">{pct}%</span>
                        </div>
                      </Link>
                    );
                  }
                })}
              </div>
            )}
          </div>

          {/* Completed labs badges */}
          {user.completed_labs.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg text-foreground">Recent Labs</h2>
                {user.completed_labs.length > 10 && (
                  <span className="text-xs text-muted-foreground font-semibold">
                    Showing 10 of {user.completed_labs.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {user.completed_labs.slice(0, 10).map((labId) => (
                  <SectionBadge key={labId} sectionId={labId} moduleId={labToModule[labId]} />
                ))}
                {user.completed_labs.length > 10 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground font-bold font-mono">
                    + {user.completed_labs.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-black text-lg mb-4 text-foreground">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Browse Modules", href: "/modules" },
                { label: "My Profile", href: "/profile" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/70 transition-all group cursor-pointer">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-black text-lg mb-4 text-foreground">Agent Reference</h2>
            <div className="space-y-2 font-mono text-xs">
              {[
                ["tld login", "Authenticate"],
                ["tld sync --all", "Fetch modules & labs"],
                ["tld start <lab-id>", "Start a lab"],
                ["tld check", "Validate & earn XP"],
                ["tld status", "Show active lab"],
              ].map(([cmd, desc]) => (
                <div key={cmd} className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <span className="font-bold" style={{ color: "var(--accent-primary)" }}>{cmd}</span>
                  <span className="text-muted-foreground text-[11px]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}