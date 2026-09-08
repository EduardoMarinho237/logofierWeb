"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TOKEN_KEY = "logofier_token";
const REFRESH_TOKEN_KEY = "logofier_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken() {
  if (typeof window !== "undefined") localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAuth() {
  clearToken();
  clearRefreshToken();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
    };
    setToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok && res.status === 401 && withAuth && !path.startsWith("/api/auth/refresh")) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = getToken();
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } else {
      clearAuth();
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // ignore, keep statusText
    }
    throw new ApiError(res.status, String(detail));
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.blob()) as unknown as T;
}

export interface PageSelection {
  mode: string;
  first_count: number;
  last_count: number;
  specific_pages: number[];
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  page_width: number;
  page_height: number;
}

export interface LogoPositionConfig {
  position: Position;
  position_rest?: Position | null;
}

export interface JobConfig {
  page_selection: PageSelection;
  position: Position;
  position_rest?: Position | null;
  position_mode?: string;
  mode?: string;
  pos_strategy?: string;
  logo_positions?: Record<string, LogoPositionConfig>;
}

export interface Job {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  config: JobConfig;
  error_message: string | null;
  created_at: string | null;
}

export interface JobStatus {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  error_message: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string | null;
}

export interface UserInput {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  is_active?: boolean;
  password?: string;
}

export interface AdminStorageUsage {
  avatars: number;
  logos: number;
  pdfs: number;
  zips: number;
  other: number;
}

export interface AdminMetadataUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  jobs_count: number;
  storage: AdminStorageUsage;
  storage_total: number;
}

export interface AdminMetadata {
  totals: {
    processings: number;
    processings_done: number;
    pdfs_generated: number;
  };
  storage: AdminStorageUsage;
  storage_total: number;
  orphans: number;
  users: AdminMetadataUser[];
}

export interface AdminUserFile {
  key: string;
  category: string;
  size: number;
  label: string;
}

export interface AdminUserFilesResponse {
  user: User;
  files: AdminUserFile[];
  total_bytes: number;
}

export interface AdminDeleteResult {
  count?: number;
  freed_bytes: number;
}

export interface Logo {
  id: string;
  name: string;
  aspect_ratio: number | null;
  created_at: string | null;
}

export interface Preset {
  id: string;
  name: string;
  mode: string;
  pos_strategy: string;
  page_selection: PageSelection;
  position: Position;
  position_rest: Position | null;
  position_mode: string;
  created_at: string | null;
}

export interface ProcessingListItem {
  id: string;
  title: string | null;
  display_label: string;
  status: string;
  mode: string;
  total_files: number;
  processed_files: number;
  created_at: string | null;
  is_expired: boolean;
}

export interface ProcessingListResponse {
  items: ProcessingListItem[];
  total: number;
}

export interface ReviewFile {
  index: number;
  name: string;
}

export interface ReviewManifestResponse {
  mode: string;
  files: ReviewFile[];
}

export interface ReviewPage {
  page: number;
  stamped: boolean;
  image_base64: string;
}

export interface ReviewPreviewResponse {
  width: number;
  height: number;
  page_count: number;
  pages: ReviewPage[];
}

export const api = {
  async login(email: string, password: string) {
    const data = await request<{ access_token: string; refresh_token?: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    );
    setToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
  },

  async logout() {
    const rt = getRefreshToken();
    try {
      if (rt) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: rt }),
        });
      }
    } finally {
      clearAuth();
    }
  },

  async me(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  async updateMe(payload: { name?: string; email?: string }): Promise<User> {
    return request<User>("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    return request("/api/auth/me/password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async uploadAvatar(file: File): Promise<User> {
    const form = new FormData();
    form.append("file", file);
    return request<User>("/api/auth/me/avatar", {
      method: "POST",
      body: form,
    });
  },

  async getAvatar(): Promise<Blob> {
    return request<Blob>("/api/auth/me/avatar", { method: "GET" });
  },

  async listUsers(): Promise<User[]> {
    return request<User[]>("/api/users");
  },

  async createUser(input: UserInput): Promise<User> {
    return request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    return request(`/api/users/${userId}`, { method: "DELETE" });
  },

  async updateUser(userId: string, payload: UserUpdatePayload): Promise<User> {
    return request<User>(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getAdminMetadata(): Promise<AdminMetadata> {
    return request<AdminMetadata>("/api/admin/metadata");
  },

  async deleteOrphanFiles(): Promise<AdminDeleteResult> {
    return request<AdminDeleteResult>("/api/admin/orphans/delete", { method: "POST" });
  },

  async getUserAvatar(userId: string): Promise<Blob> {
    return request<Blob>(`/api/users/${userId}/avatar`);
  },

  async getUserFiles(userId: string): Promise<AdminUserFilesResponse> {
    return request<AdminUserFilesResponse>(`/api/admin/users/${userId}/files`);
  },

  async deleteUserFile(userId: string, key: string): Promise<AdminDeleteResult> {
    return request<AdminDeleteResult>(`/api/admin/users/${userId}/files`, {
      method: "DELETE",
      body: JSON.stringify({ key }),
    });
  },

  async createJob(options: {
    logoFiles?: File[];
    logoIds?: string[];
    config: JobConfig;
  }): Promise<Job> {
    const form = new FormData();
    for (const l of options.logoFiles ?? []) form.append("logo", l);
    for (const id of options.logoIds ?? []) form.append("logo_ids", id);
    form.append("config", JSON.stringify(options.config));
    return request<Job>("/api/jobs", { method: "POST", body: form });
  },

  async uploadFiles(jobId: string, files: File[]): Promise<void> {
    const form = new FormData();
    for (const f of files) form.append("files", f);
    return request(`/api/jobs/${jobId}/files`, { method: "POST", body: form });
  },

  async process(jobId: string): Promise<void> {
    return request(`/api/jobs/${jobId}/process`, { method: "POST" });
  },

  async getJob(jobId: string): Promise<Job> {
    return request(`/api/jobs/${jobId}`);
  },

  async listJobs(): Promise<ProcessingListResponse> {
    return request<ProcessingListResponse>("/api/jobs");
  },

  async updateJobTitle(jobId: string, title: string): Promise<Job> {
    return request<Job>(`/api/jobs/${jobId}/title`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  },

  async deleteJob(jobId: string): Promise<void> {
    return request(`/api/jobs/${jobId}`, { method: "DELETE" });
  },

  async status(jobId: string): Promise<JobStatus> {
    return request(`/api/jobs/${jobId}/status`);
  },

  async download(jobId: string): Promise<Blob> {
    return request<Blob>(`/api/jobs/${jobId}/download`, { method: "GET" });
  },

  async getLogo(jobId: string): Promise<Blob> {
    return request<Blob>(`/api/jobs/${jobId}/logo`, { method: "GET" });
  },

  async getLogoN(jobId: string, index: number): Promise<Blob> {
    return request<Blob>(`/api/jobs/${jobId}/logo?index=${index}`, { method: "GET" });
  },

  async getLogos(jobId: string): Promise<{ keys: string[]; count: number }> {
    return request(`/api/jobs/${jobId}/logos`, { method: "GET" });
  },

  async updateLogoPosition(
    jobId: string,
    index: number,
    logoPosition: LogoPositionConfig
  ): Promise<void> {
    return request(`/api/jobs/${jobId}/logos/${index}/position`, {
      method: "PUT",
      body: JSON.stringify(logoPosition),
    });
  },

  async getPreviewPage(
    jobId: string,
    page: number
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/preview-page?page=${page}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      throw new ApiError(res.status, res.statusText);
    }
    const width = parseFloat(res.headers.get("X-Page-Width-Points") ?? "0");
    const height = parseFloat(res.headers.get("X-Page-Height-Points") ?? "0");
    return { blob: await res.blob(), width, height };
  },

  async updateConfig(jobId: string, config: JobConfig): Promise<void> {
    return request(`/api/jobs/${jobId}/config`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },

  async preview(pdf: File, page: number): Promise<{ blob: Blob; width: number; height: number }> {
    const form = new FormData();
    form.append("pdf", pdf);
    const res = await fetch(`${API_URL}/api/preview?page=${page}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    if (!res.ok) {
      throw new ApiError(res.status, res.statusText);
    }
    const width = parseFloat(res.headers.get("X-Page-Width-Points") ?? "0");
    const height = parseFloat(res.headers.get("X-Page-Height-Points") ?? "0");
    return { blob: await res.blob(), width, height };
  },

  async listLogos(): Promise<Logo[]> {
    return request<Logo[]>("/api/logos");
  },

  async createLogo(file: File): Promise<Logo> {
    const form = new FormData();
    form.append("file", file);
    return request<Logo>("/api/logos", { method: "POST", body: form });
  },

  async renameLogo(logoId: string, name: string): Promise<Logo> {
    return request<Logo>(`/api/logos/${logoId}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  async deleteLogo(logoId: string): Promise<void> {
    return request(`/api/logos/${logoId}`, { method: "DELETE" });
  },

  async getLogoThumbnail(logoId: string): Promise<Blob> {
    return request<Blob>(`/api/logos/${logoId}/thumbnail`);
  },

  async listPresets(): Promise<Preset[]> {
    return request<Preset[]>("/api/presets");
  },

  async getPreset(presetId: string): Promise<Preset> {
    return request<Preset>(`/api/presets/${presetId}`);
  },

  async createPreset(preset: Omit<Preset, "id" | "created_at">): Promise<Preset> {
    return request<Preset>("/api/presets", {
      method: "POST",
      body: JSON.stringify(preset),
    });
  },

  async deletePreset(presetId: string): Promise<void> {
    return request(`/api/presets/${presetId}`, { method: "DELETE" });
  },

  async getReviewManifest(jobId: string): Promise<ReviewManifestResponse> {
    return request<ReviewManifestResponse>(`/api/jobs/${jobId}/review`, {
      method: "GET",
    });
  },

  async getReviewPreview(
    jobId: string,
    file: number,
    pages: number[]
  ): Promise<ReviewPreviewResponse> {
    return request<ReviewPreviewResponse>(
      `/api/jobs/${jobId}/review-preview?file=${file}&pages=${pages.join(",")}`,
      { method: "GET" }
    );
  },
};

export { API_URL };
