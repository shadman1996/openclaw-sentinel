/**
 * Aegis API client — wraps fetch calls to the FastAPI backend.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || res.statusText, res.status);
  }
  return res.json();
}

// ── Types ──
export interface AuthResponse {
  access_token: string;
  user_id: string;
  email: string;
  credits: number;
  plan: string;
}

export const api = {
  // Auth
  register: (email: string, password: string, full_name: string, company: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name, company }),
    }),
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  },
  me: () => request<any>("/auth/me"),

  // Scanner
  runScan: (target: string, user_id?: string) =>
    request<any>("/scans/run", {
      method: "POST",
      body: JSON.stringify({ target, user_id }),
    }),
  getScan: (scanId: string) => request<any>(`/scans/${scanId}`),
  listScans: () => request<any[]>("/scans/"),

  // Remediation
  triggerFix: (vulnId: string) =>
    request<any>(`/remediate/${vulnId}`, { method: "POST" }),
  getJobStatus: (jobId: string) => request<any>(`/remediate/${jobId}/status`),

  // Auth expansion
  updateProfile: (full_name?: string, company?: string) =>
    request<any>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ full_name, company }),
    }),
  changePassword: (current_password: string, new_password: string) =>
    request<any>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
  forgotPassword: (email: string) =>
    request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, otp: string, new_password: string) =>
    request<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password }),
    }),

  // Billing
  getBalance: () => request<any>("/billing/balance"),
  getLedger: () => request<any[]>("/billing/ledger"),
  checkout: (planId: string) =>
    request<any>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    }),

  // SOC
  escalate: (vulnId: string) =>
    request<any>(`/soc/escalate/${vulnId}`, { method: "POST" }),
};
