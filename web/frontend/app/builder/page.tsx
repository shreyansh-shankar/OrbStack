// web/frontend/app/builder/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { BuilderDraftListItem } from "@/lib/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { 
  BookOpen, Trash2, ArrowLeft, ExternalLink, Award, CheckCircle, 
  Terminal, Copy, FileText, HelpCircle, FolderOpen, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/builder/confirm-modal";

export default function BuilderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<BuilderDraftListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
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

    const loadModules = async () => {
      try {
        const data = await api.getMyModules();
        setModules(data);
      } catch (err: any) {
        setError(err.message || "Failed to load modules");
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [user, authLoading, router]);

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Module",
      message: "Are you sure you want to delete this module? This cannot be undone and will delete all sections and labs inside it.",
      confirmText: "Delete",
      type: "danger",
      onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.deleteModule(id);
          setModules((prev) => prev.filter((m) => m.id !== id));
        } catch (err: any) {
          setModalConfig({
            isOpen: true,
            title: "Error Deleting Module",
            message: err.message || "Failed to delete module",
            type: "danger",
            confirmText: "Dismiss",
            onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (authLoading || loading) {
    return <LoadingSpinner className="py-40" />;
  }

  if (error) {
    return <div className="text-center py-40 text-red-400 text-sm">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/modules" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to Modules
            </Link>
          </div>
          <h1 className="text-3xl font-black text-foreground">Syllabus Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author and publish custom learning challenges directly from your terminal.
          </p>
        </div>
        <button
          onClick={() => setShowInstructions(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          <FolderOpen className="h-4 w-4" /> Create Challenge
        </button>
      </div>

      {/* CLI Quickstart Card */}
      <div className="mb-10 rounded-2xl border border-border bg-card shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-foreground">
          <Terminal className="h-32 w-32" />
        </div>
        <div className="flex gap-4 items-start relative z-10">
          <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hidden sm:block">
            <Terminal className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-1">Local-First Authoring</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              Write challenges in your favorite local text editor following the standard schema format, then publish instantly with a single command.
            </p>
            <div className="flex items-center gap-2 bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-border rounded-xl p-3 max-w-xl font-mono text-sm text-emerald-400 shadow-inner">
              <span className="text-zinc-500">$</span>
              <span className="flex-1 select-all">tld publish ./path-to-your-module</span>
              <button 
                onClick={() => copyToClipboard("tld publish ./path-to-your-module")}
                className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
                title="Copy command"
              >
                {copiedText ? <span className="text-xs text-emerald-400 font-bold">Copied</span> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal / Drawer */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-[var(--accent-primary)]" />
                How to Build & Publish Challenges
              </h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-muted-foreground hover:text-foreground font-black text-sm px-3 py-1 rounded-lg border border-border bg-muted/30 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center text-xs font-mono font-black">1</span>
                  Create Directory Structure
                </h4>
                <p className="mb-2">Create a local directory representing your module containing sections and labs:</p>
                <pre className="bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-border rounded-xl p-4 font-mono text-xs text-zinc-300">
{`my-module/
├── module.yaml
└── sections/
    └── 01-intro/
        ├── section.yaml
        ├── content.md
        └── labs/
            └── my-first-lab/
                ├── lab.yaml
                ├── validator.sh
                └── cleanup.sh`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center text-xs font-mono font-black">2</span>
                  Author Configurations
                </h4>
                <p className="mb-2"><strong>module.yaml:</strong></p>
                <pre className="bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-border rounded-xl p-3 font-mono text-xs text-zinc-300">
{`id: my-module-slug
title: "My Module Title"
description: "Sleek description of module."
topic: "Linux"
difficulty: "Beginner"
estimated_minutes: 15
tags: "linux, bash"`}
                </pre>
                <p className="mt-3 mb-2"><strong>lab.yaml:</strong></p>
                <pre className="bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-border rounded-xl p-3 font-mono text-xs text-zinc-300">
{`id: my-first-lab-slug
title: "Create a File"
estimated_minutes: 5
setup:
  type: shell
  seed_commands:
    - "echo 'Init' > ~/my-file.txt"`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center text-xs font-mono font-black">3</span>
                  Publish Live
                </h4>
                <p className="mb-2">Log in using the CLI, then push your folder to the web:</p>
                <pre className="bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-border rounded-xl p-3 font-mono text-xs text-emerald-400">
$ tld login
$ tld publish ./my-module
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Published Modules Section */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-wider text-muted-foreground/60 mb-5 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> My Published Challenges ({modules.length})
        </h2>
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto mb-4 text-zinc-600" />
            <p className="text-sm font-medium">No published challenges yet.</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Follow the instructions in the "Create Challenge" guide to publish your first challenge from the terminal!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-black text-lg text-foreground leading-snug">{m.title}</h3>
                    <div className="flex items-center gap-1.5">
                      {m.is_official_verified || m.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle className="h-2.5 w-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <Award className="h-2.5 w-2.5" /> Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="font-mono text-zinc-400 font-bold flex items-center gap-0.5">
                      {m.total_xp} XP
                    </span>
                    <span className="flex items-center gap-0.5">
                      <FileText className="h-3 w-3" /> {m.total_sections} Sections
                    </span>
                    {m.topic && (
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-bold text-muted-foreground">
                        {m.topic}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40">
                  <Link
                    href={`/modules/${m.id}`}
                    target="_blank"
                    className="flex-1 text-center py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Module Page <ExternalLink className="h-3 w-3" />
                  </Link>
                  {!(m.is_official_verified || m.status === "verified") ? (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-xl border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 hover:text-red-300 transition-all cursor-pointer shrink-0"
                      title="Delete Module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="px-3 py-2 rounded-xl border border-border bg-muted/30 text-[10px] text-zinc-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Locked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
