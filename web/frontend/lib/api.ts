// web/frontend/lib/api.ts

import { Module, ModuleDetail, User, BuilderDraftListItem, BuilderModuleInput } from "./types";
import { writeCache, clearDashboardCache } from "./dashboard/use-dashboard-cache";
import { clearModulesMemoryCache } from "@/hooks/use-modules";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.thelastdeploy.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

/** After login/register — fetch everything needed and warm the cache. */
async function warmCache(token: string): Promise<void> {
  try {
    // Temporarily set token so request() can use it
    localStorage.setItem("token", token);
    const [user, modules] = await Promise.all([
      request<User>("/me"),
      request<ModuleDetail[]>("/modules/all/full?exclude_content=true"),
    ]);
    writeCache({ user, modules });
  } catch {
    // Non-fatal — dashboard will fetch on next load
  }
}

export const api = {
  // Auth
  register: async (email: string, username: string, password: string) => {
    return request<{ detail: string }>("/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  },

  login: async (email: string, password: string) => {
    const res = await request<{ access_token: string; device_key: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await warmCache(res.access_token);
    return res;
  },

  loginWithGitHub: async (code: string) => {
    const res = await request<{ access_token: string; device_key: string }>("/github", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    await warmCache(res.access_token);
    return res;
  },

  checkUsername: async (username: string) => {
    return request<{ available: boolean; detail?: string }>(`/check-username?username=${encodeURIComponent(username)}`);
  },

  verifyEmail: async (token: string) => {
    return request<{ detail: string }>("/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  forgotPassword: async (email: string) => {
    return request<{ detail: string }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return request<{ detail: string }>("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  resendVerification: async (email: string) => {
    return request<{ detail: string }>("/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  cliAuthorize: async (userCode: string) => {
    return request<{ detail: string }>("/cli/authorize", {
      method: "POST",
      body: JSON.stringify({ user_code: userCode }),
    });
  },

  updateProfile: async (username?: string, email?: string) => {
    return request<{ detail: string }>("/me", {
      method: "PUT",
      body: JSON.stringify({ username, email }),
    });
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    return request<{ detail: string }>("/me/password", {
      method: "PUT",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  },

  logout: () => {
    clearDashboardCache();
    clearModulesMemoryCache();
    localStorage.removeItem("token");
    localStorage.removeItem("device_key");
  },

  // Modules
  getModules: () =>
    request<{ modules: Module[] }>("/modules"),

  getAllModulesFull: (excludeContent?: boolean) =>
    request<ModuleDetail[]>(`/modules/all/full?exclude_content=${excludeContent ?? false}`),

  getModule: (id: string) =>
    request<ModuleDetail>(`/modules/${id}/full`),

  completeSection: (moduleId: string, sectionId: string) =>
    request<{ xp_awarded: number; total_xp: number }>(
      `/modules/${moduleId}/sections/${sectionId}/complete`,
      { method: "POST" }
    ),

  // Users
  getMe: () => request<User>("/me"),

  // Builder
  getMyModules: () =>
    request<BuilderDraftListItem[]>("/builder/modules"),

  getBuilderModule: (id: string) =>
    request<BuilderModuleInput>(`/builder/modules/${id}`),

  createModule: (data: BuilderModuleInput) =>
    request<{ id: string }>("/builder/modules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  saveModule: (id: string, data: BuilderModuleInput) =>
    request<{ id: string }>(`/builder/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  publishModule: (id: string) =>
    request<{ id: string }>([`/builder/modules/${id}/publish`][0], {
      method: "POST",
    }),

  deleteModule: (id: string) =>
    request<{ detail: string }>(`/builder/modules/${id}`, {
      method: "DELETE",
    }),

  verifyModule: (id: string, data: any) =>
    request<{ detail: string }>(`/modules/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  adminGetMaintainers: () =>
    request<any[]>("/admin/maintainers"),

  adminAddMaintainer: (identity: string) =>
    request<any>("/admin/maintainers", {
      method: "POST",
      body: JSON.stringify({ identity }),
    }),

  adminRemoveMaintainer: (userId: number) =>
    request<any>(`/admin/maintainers/${userId}`, {
      method: "DELETE",
    }),
};