function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured) {
    return configured;
  }
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://127.0.0.1:8000/api/v1";
  }
  return "/api/v1";
}

const API_BASE_URL = resolveApiBaseUrl();

const ACCESS_TOKEN_KEY = "explainmycode.accessToken";
const REFRESH_TOKEN_KEY = "explainmycode.refreshToken";
const USER_KEY = "explainmycode.user";
const CURRENT_CODE_KEY = "explainmycode.currentCode";
const CURRENT_LANGUAGE_KEY = "explainmycode.currentLanguage";
const CURRENT_WORKSPACE_KEY = "explainmycode.currentWorkspaceId";
const CURRENT_FILE_KEY = "explainmycode.currentFileId";
const SESSION_EVENT = "explainmycode:session-changed";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  is_active: boolean;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OAuthProvider {
  provider: string;
  enabled: boolean;
  auth_url?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
}

export interface WorkspaceNode {
  id: string;
  workspace_id: string;
  parent_id?: string | null;
  name: string;
  path: string;
  type: "file" | "folder";
  language?: string | null;
  content?: string | null;
  children: WorkspaceNode[];
}

export interface LiveComment {
  line: number;
  comment: string;
  type: "info" | "important" | "warning";
}

export interface OnTrackStatus {
  type: "idle" | "success" | "warning" | "error";
  message: string;
  details: string;
  language: string;
  line_count: number;
  warning_count: number;
  error_count: number;
  provider: string;
}

export interface DashboardPayload {
  metrics: {
    total_lines: number;
    functions: number;
    algorithms: number;
    quality_score: number;
  };
  summary: {
    primary_language: string;
    code_style: string;
    documentation_status: string;
  };
  detected_algorithms: Array<{
    name: string;
    complexity: string;
    type: string;
    confidence: number;
  }>;
  complexity: {
    time: string;
    space: string;
    metrics: Array<{ name: string; value: number }>;
  };
  suggestions: Array<{
    type: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
  }>;
  provider: string;
}

export interface VisualizationSummary {
  id: string;
  title: string;
  description: string;
}

export interface VisualizationDetail {
  algorithm: string;
  title: string;
  description: string;
  steps: Array<{
    index: number;
    label: string;
    state: Record<string, unknown>;
  }>;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  skipRefresh?: boolean;
  body?: unknown;
};

let refreshPromise: Promise<SessionPayload | null> | null = null;

function dispatchSessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function parseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredSession(): SessionPayload | null {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();
  const user = parseJSON<User>(localStorage.getItem(USER_KEY));
  if (!accessToken || !refreshToken || !user) {
    return null;
  }
  return { accessToken, refreshToken, user };
}

export function saveSession(session: SessionPayload) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  dispatchSessionChange();
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CURRENT_CODE_KEY);
  localStorage.removeItem(CURRENT_LANGUAGE_KEY);
  localStorage.removeItem(CURRENT_WORKSPACE_KEY);
  localStorage.removeItem(CURRENT_FILE_KEY);
  dispatchSessionChange();
}

export function subscribeToSessionChanges(listener: () => void) {
  const handler = () => listener();
  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function setCurrentCodeState(code: string, language: string) {
  localStorage.setItem(CURRENT_CODE_KEY, code);
  localStorage.setItem(CURRENT_LANGUAGE_KEY, language);
}

export function getCurrentCodeState() {
  return {
    code: localStorage.getItem(CURRENT_CODE_KEY) ?? "",
    language: localStorage.getItem(CURRENT_LANGUAGE_KEY) ?? "python",
  };
}

export function setCurrentWorkspaceState(workspaceId: string | null, fileId?: string | null) {
  if (workspaceId) {
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);
  } else {
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
  }
  if (fileId) {
    localStorage.setItem(CURRENT_FILE_KEY, fileId);
  } else if (fileId === null) {
    localStorage.removeItem(CURRENT_FILE_KEY);
  }
}

export function getCurrentWorkspaceState() {
  return {
    workspaceId: localStorage.getItem(CURRENT_WORKSPACE_KEY),
    fileId: localStorage.getItem(CURRENT_FILE_KEY),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : response.statusText;
    throw new ApiError(detail, response.status, data?.code);
  }
  return data as T;
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getStoredAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return parseResponse<T>(response);
}

async function refreshSession(): Promise<SessionPayload | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearSession();
    return null;
  }

  try {
    const response = await rawRequest<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true,
      body: { refresh_token: refreshToken },
    });

    const session = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
    };
    saveSession(session);
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth !== false &&
      !options.skipRefresh &&
      getStoredRefreshToken()
    ) {
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });
      const session = await refreshPromise;
      if (!session) {
        throw error;
      }
      return rawRequest<T>(path, { ...options, skipRefresh: true });
    }
    throw error;
  }
}

function toSessionPayload(response: { access_token: string; refresh_token: string; user: User }): SessionPayload {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user: response.user,
  };
}

export async function login(payload: { username: string; password: string; rememberMe: boolean }) {
  const response = await apiRequest<{ access_token: string; refresh_token: string; user: User }>("/auth/login", {
    method: "POST",
    auth: false,
    body: {
      username: payload.username,
      password: payload.password,
      remember_me: payload.rememberMe,
    },
  });
  const session = toSessionPayload(response);
  saveSession(session);
  return session;
}

export async function signup(payload: { username: string; email: string; password: string; confirmPassword: string; phone?: string }) {
  const response = await apiRequest<{ access_token: string; refresh_token: string; user: User }>("/auth/signup", {
    method: "POST",
    auth: false,
    body: {
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      confirm_password: payload.confirmPassword,
    },
  });
  const session = toSessionPayload(response);
  saveSession(session);
  return session;
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function resetPassword(payload: { token: string; newPassword: string; confirmPassword: string }) {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    auth: false,
    body: {
      token: payload.token,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    },
  });
}

export async function listOAuthProviders() {
  return apiRequest<OAuthProvider[]>("/auth/oauth/providers", {
    auth: false,
  });
}

export async function logout() {
  const refreshToken = getStoredRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
        body: { refresh_token: refreshToken },
      });
    }
  } finally {
    clearSession();
  }
}

export async function getMe() {
  return apiRequest<User>("/auth/me");
}

export async function listWorkspaces() {
  return apiRequest<Workspace[]>("/workspaces");
}

export async function createWorkspace(payload: { name: string; description?: string }) {
  return apiRequest<Workspace>("/workspaces", {
    method: "POST",
    body: payload,
  });
}

export async function getWorkspaceTree(workspaceId: string) {
  return apiRequest<{ workspace_id: string; nodes: WorkspaceNode[] }>(`/workspaces/${workspaceId}/tree`);
}

export async function createWorkspaceNode(
  workspaceId: string,
  payload: { parentId?: string | null; name: string; type: "file" | "folder"; language?: string | null; content?: string | null },
) {
  return apiRequest<WorkspaceNode>(`/workspaces/${workspaceId}/files`, {
    method: "POST",
    body: {
      parent_id: payload.parentId ?? null,
      name: payload.name,
      type: payload.type,
      language: payload.language,
      content: payload.content,
    },
  });
}

export async function updateWorkspaceNode(
  workspaceId: string,
  fileId: string,
  payload: { name?: string; language?: string | null; content?: string | null; parentId?: string | null },
) {
  return apiRequest<WorkspaceNode>(`/workspaces/${workspaceId}/files/${fileId}`, {
    method: "PATCH",
    body: {
      name: payload.name,
      language: payload.language,
      content: payload.content,
      parent_id: payload.parentId,
    },
  });
}

export async function searchWorkspaceFiles(workspaceId: string, query: string) {
  return apiRequest<{ query: string; results: WorkspaceNode[] }>(
    `/workspaces/${workspaceId}/search?q=${encodeURIComponent(query)}`,
  );
}

export async function runCode(payload: { sourceCode: string; language: string; workspaceId?: string | null; filename?: string | null }) {
  return apiRequest<{
    execution_id: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    execution_time_ms?: number | null;
    memory_kb?: number | null;
    exit_status: string;
    provider_job_id?: string | null;
    provider: string;
  }>("/execution/run", {
    method: "POST",
    body: {
      source_code: payload.sourceCode,
      language: payload.language,
      workspace_id: payload.workspaceId,
      filename: payload.filename,
    },
  });
}

export async function getLiveComments(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<{ comments: LiveComment[]; provider: string }>("/mentor/live-comments", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getSummary(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<{ summary: string; provider: string }>("/mentor/summary", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getExplanation(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<{
    sections: Array<{ title: string; start_line: number; end_line: number; summary: string }>;
    full_explanation: string;
    provider: string;
  }>("/mentor/explanation", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getLineExplanation(payload: {
  code: string;
  language: string;
  lineNumber: number;
  filename?: string | null;
  workspaceId?: string | null;
}) {
  return apiRequest<{
    line_number: number;
    explanation: string;
    related_lines: number[];
    provider: string;
  }>("/mentor/line-explanation", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      line_number: payload.lineNumber,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getBugs(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<{
    bugs: Array<{
      title: string;
      line: number;
      severity: string;
      category: string;
      description: string;
      fix_suggestion: string;
    }>;
    provider: string;
  }>("/mentor/bugs", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getAssumptions(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<{
    assumptions: Array<{
      title: string;
      category: string;
      description: string;
    }>;
    provider: string;
  }>("/mentor/assumptions", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function getOnTrack(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<OnTrackStatus>("/mentor/on-track", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function sendMentorChat(payload: {
  code: string;
  language: string;
  message: string;
  filename?: string | null;
  workspaceId?: string | null;
  history?: Array<Record<string, unknown>>;
}) {
  return apiRequest<{
    answer: string;
    citations: Array<Record<string, unknown>>;
    follow_ups: string[];
    provider: string;
  }>("/mentor/chat", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      message: payload.message,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
      history: payload.history ?? [],
    },
  });
}

export async function getDashboard(payload: { code: string; language: string; filename?: string | null; workspaceId?: string | null }) {
  return apiRequest<DashboardPayload>("/analysis/dashboard", {
    method: "POST",
    body: {
      code: payload.code,
      language: payload.language,
      filename: payload.filename,
      workspace_id: payload.workspaceId,
    },
  });
}

export async function listVisualizations() {
  return apiRequest<VisualizationSummary[]>("/visualizations");
}

export async function getVisualization(algorithmId: string) {
  return apiRequest<VisualizationDetail>(`/visualizations/${algorithmId}`);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
