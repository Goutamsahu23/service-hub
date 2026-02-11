import { API_BASE } from "@/constants";
import type { User } from "@/types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: Pick<User, "id" | "email" | "role" | "fullName">;
  workspace: { id: string; name: string; status: string };
}

export const auth = {
  register: (body: import("@/types").RegisterData) =>
    api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api<User>("/auth/me"),
};

export function publicApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { ...options, token: null });
}
