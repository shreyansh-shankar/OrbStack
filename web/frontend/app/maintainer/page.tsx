// web/frontend/app/maintainer/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { 
  ShieldAlert, CheckCircle, Zap, Shield, BookOpen, Clock, 
  ExternalLink, User, HelpCircle, ChevronRight, Award, Trash2 
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/builder/confirm-modal";
import { Module, ModuleDetail } from "@/lib/types";

export default function MaintainerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [unverifiedModules, setUnverifiedModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [xpState, setXpState] = useState<Record<string, number>>({}); // maps sectionId or labId to its xp

  // Super Admin Management tabs & state
  const [activeTab, setActiveTab] = useState<"verify" | "maintainers">("verify");
  const [maintainers, setMaintainers] = useState<{ id: number; username: string; email: string }[]>([]);
  const [newMaintainerIdentity, setNewMaintainerIdentity] = useState("");
  const [loadingMaintainers, setLoadingMaintainers] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.id !== 2 && !user.is_maintainer) {
      setLoading(false);
      return;
    }

    loadModules();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.id === 2 && activeTab === "maintainers") {
      loadMaintainers();
    }
  }, [user, activeTab]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const res = await api.getModules();
      const unverified = res.modules.filter((m: any) => !m.is_official_verified);
      setUnverifiedModules(unverified);
    } catch (err: any) {
      setError(err.message || "Failed to load unverified modules");
    } finally {
      setLoading(false);
    }
  };

  const loadMaintainers = async () => {
    setLoadingMaintainers(true);
    try {
      const list = await api.adminGetMaintainers();
      setMaintainers(list);
    } catch (err: any) {
      console.error("Failed to load maintainers:", err);
    } finally {
      setLoadingMaintainers(false);
    }
  };

  const handleAddMaintainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintainerIdentity.trim()) return;
    try {
      await api.adminAddMaintainer(newMaintainerIdentity.trim());
      setNewMaintainerIdentity("");
      loadMaintainers();
    } catch (err: any) {
      alert("Error adding maintainer: " + err.message);
    }
  };

  const handleRemoveMaintainer = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} from maintainers?`)) return;
    try {
      await api.adminRemoveMaintainer(userId);
      loadMaintainers();
    } catch (err: any) {
      alert("Error removing maintainer: " + err.message);
    }
  };

  const handleSelectModule = async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getModule(id);
      setSelectedModule(detail);
      
      // Initialize XP states
      const initialXP: Record<string, number> = {};
      detail.sections.forEach((sec: any) => {
        initialXP[sec.id] = sec.xp || 10;
        sec.labs.forEach((lab: any) => {
          initialXP[lab.id] = lab.xp || 30;
        });
      });
      setXpState(initialXP);
    } catch (err: any) {
      alert("Failed to load module details: " + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleXpChange = (id: string, value: number) => {
    setXpState((prev) => ({
      ...prev,
      [id]: isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  const handleVerify = () => {
    if (!selectedModule) return;

    setModalConfig({
      isOpen: true,
      title: "Verify Module",
      message: `Are you sure you want to verify '${selectedModule.title}'? This will award XP to completing students and lock user deletions.`,
      confirmText: "Verify & Approve",
      type: "success",
      onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const payload = {
            sections: selectedModule.sections.map((sec) => ({
              id: sec.id,
              xp: xpState[sec.id] || 0,
              labs: sec.labs.map((lab) => ({
                id: lab.id,
                xp: xpState[lab.id] || 0,
              })),
            })),
          };

          await api.verifyModule(selectedModule.id, payload);
          setSelectedModule(null);
          loadModules();
        } catch (err: any) {
          alert("Failed to verify module: " + err.message);
        }
      },
    });
  };

  if (authLoading || loading) {
    return <LoadingSpinner className="py-40" />;
  }

  // Admin / Maintainer protection view
  if (!user || (user.id !== 2 && !user.is_maintainer)) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="p-4 rounded-full bg-red-500/10 text-red-400 inline-block mb-6">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The maintainer grading panel is restricted to core administrators and maintainers. Please return to the syllabus index.
        </p>
        <Link 
          href="/modules"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
        >
          Return to Syllabus
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">
          <Shield className="h-4 w-4" /> Maintainer panel
        </div>
        <h1 className="text-3xl font-black text-foreground">Content Grading & Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review community submissions, assign curriculum XP, and verify challenges to go live globally.
        </p>
      </div>

      {/* Tabs (Super Admin only) */}
      {user && user.id === 2 && (
        <div className="flex gap-6 border-b border-border/60 mb-8 pb-px">
          <button
            onClick={() => setActiveTab("verify")}
            className={`pb-4 text-sm font-black uppercase tracking-wider transition-colors relative cursor-pointer outline-none ${
              activeTab === "verify" ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Verification Queue
          </button>
          <button
            onClick={() => setActiveTab("maintainers")}
            className={`pb-4 text-sm font-black uppercase tracking-wider transition-colors relative cursor-pointer outline-none ${
              activeTab === "maintainers" ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manage Maintainers
          </button>
        </div>
      )}

      {activeTab === "maintainers" && user.id === 2 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">Manage Team Maintainers</h2>
            <p className="text-sm text-muted-foreground">
              As Super Admin, you can add or remove users who have permission to grade and verify community syllabus modules.
            </p>
          </div>

          <form onSubmit={handleAddMaintainer} className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Username or email address"
              value={newMaintainerIdentity}
              onChange={(e) => setNewMaintainerIdentity(e.target.value)}
              className="flex-1 px-4 py-2 bg-black border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-[var(--accent-primary)]"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-all cursor-pointer border-0"
            >
              Add Maintainer
            </button>
          </form>

          {loadingMaintainers ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="border border-border/85 rounded-xl overflow-hidden bg-black/25">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-xs font-bold text-muted-foreground uppercase">
                    <th className="p-4">User ID</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {maintainers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                        No team maintainers assigned yet. Use the form above to invite someone!
                      </td>
                    </tr>
                  ) : (
                    maintainers.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/10">
                        <td className="p-4 font-mono font-bold text-zinc-500">{m.id}</td>
                        <td className="p-4 font-bold text-foreground">{m.username}</td>
                        <td className="p-4 text-muted-foreground">{m.email}</td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaintainer(m.id, m.username)}
                            className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Remove Maintainer Credentials"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Submissions list */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
              Pending Submissions ({unverifiedModules.length})
            </h2>
            {unverifiedModules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card/25">
                <CheckCircle className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground">Queue is clear!</p>
                <p className="text-xs text-zinc-500 mt-1">No community challenges are currently awaiting verification.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unverifiedModules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModule(m.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 bg-card hover:bg-muted/30 cursor-pointer ${
                      selectedModule?.id === m.id ? "border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]" : "border-border"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{m.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {m.author?.name || "Anonymous"}
                        </span>
                        <span>•</span>
                        <span>{m.total_sections} Sections</span>
                        {m.topic && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-zinc-400">{m.topic}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Detail review & XP assignment */}
          <div className="lg:col-span-7">
            {loadingDetail ? (
              <div className="rounded-2xl border border-border p-20 flex justify-center bg-card">
                <LoadingSpinner />
              </div>
            ) : selectedModule ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-border/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        ID: {selectedModule.id}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        Unverified
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-foreground">{selectedModule.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Author: <span className="font-bold text-zinc-400">{selectedModule.author?.name || "Anonymous"}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleVerify}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md cursor-pointer border-0"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve & Verify
                  </button>
                </div>

                {selectedModule.description && (
                  <div className="mb-6 p-3 rounded-lg bg-muted/40 border border-border/40 text-xs leading-relaxed text-muted-foreground">
                    <strong>Description:</strong> {selectedModule.description}
                  </div>
                )}

                {/* Curriculum structure */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    Challenge Structure & XP Grading
                  </h3>
                  
                  {selectedModule.sections.map((sec, secIdx) => (
                    <div key={sec.id} className="p-4 rounded-xl border border-border bg-zinc-950/40 space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-border/40">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-zinc-500" />
                            Section {secIdx + 1}: {sec.title}
                          </h4>
                          {sec.content && (
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Reading length: {sec.content.length} chars
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Section XP:</label>
                          <input
                            type="number"
                            value={xpState[sec.id] ?? 0}
                            onChange={(e) => handleXpChange(sec.id, parseInt(e.target.value))}
                            className="w-16 text-center px-2 py-1 bg-black border border-border rounded-lg text-xs font-bold text-emerald-400 focus:outline-none focus:border-[var(--accent-primary)] font-mono"
                          />
                        </div>
                      </div>

                      {/* Labs list inside Section */}
                      {sec.labs.length === 0 ? (
                        <div className="text-[11px] text-zinc-500 italic px-2">
                          No labs in this section.
                        </div>
                      ) : (
                        <div className="space-y-3 pl-2">
                          {sec.labs.map((lab) => (
                            <div key={lab.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border bg-card/60">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-foreground truncate">{lab.title}</h5>
                                <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mt-1">
                                  <span className="px-1.5 py-0.5 rounded bg-muted font-mono">{lab.setup_type || "shell"}</span>
                                  {lab.estimated_minutes && (
                                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {lab.estimated_minutes}m</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] font-medium text-muted-foreground">Lab XP:</label>
                                <input
                                  type="number"
                                  value={xpState[lab.id] ?? 0}
                                  onChange={(e) => handleXpChange(lab.id, parseInt(e.target.value))}
                                  className="w-16 text-center px-2 py-1 bg-black border border-border rounded-lg text-xs font-bold text-emerald-400 focus:outline-none focus:border-[var(--accent-primary)] font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-20 text-center text-muted-foreground bg-card/20">
                <Shield className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
                <p className="text-sm font-medium">Select a challenge to review</p>
                <p className="text-xs text-zinc-500 mt-1">Choose a community submission from the list on the left to grade its XP and approve it.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
}
