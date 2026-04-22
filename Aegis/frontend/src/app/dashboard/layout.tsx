"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-8 h-8 border-2 border-[var(--aegis-cyan)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top bar */}
      <nav className="border-b border-white/5 px-6 py-3 flex items-center justify-between bg-[#111118]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold gradient-text cursor-pointer" onClick={() => router.push("/dashboard")}>AEGIS</span>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => router.push("/dashboard")}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Dashboard</button>
            <button onClick={() => router.push("/scan")}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Scanner</button>
            <button onClick={() => router.push("/dashboard/billing")}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Billing</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--aegis-cyan)]/10 border border-[var(--aegis-cyan)]/20 rounded-full">
            <span className="text-[var(--aegis-cyan)] text-sm font-semibold">{user.credits}</span>
            <span className="text-gray-400 text-xs">credits</span>
          </div>
          <div className="text-sm text-gray-400">{user.email}</div>
          <button onClick={logout}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors">Logout</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
