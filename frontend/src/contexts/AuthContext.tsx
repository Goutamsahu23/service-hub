"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth as authApi } from "@/lib/api";
import type { User, AuthContextValue, RegisterData } from "@/types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    setToken(t);
    try {
      const me = await authApi.me();
      setUser(me as User);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("token", res.token);
    setToken(res.token);
    await refresh();
  }, [refresh]);

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await authApi.register(data);
      localStorage.setItem("token", res.token);
      setToken(res.token);
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
