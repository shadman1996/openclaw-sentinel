"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  company: string;
  plan: string;
  credits: number;
  is_admin: boolean;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = (t: string) => {
    localStorage.setItem("aegis_token", t);
    setToken(t);
  };

  const refreshUser = async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("aegis_token");
    if (t) {
      setToken(t);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    persist(res.access_token);
    await refreshUser();
  };

  const register = async (email: string, password: string, name: string, company: string) => {
    const res = await api.register(email, password, name, company);
    persist(res.access_token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("aegis_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
