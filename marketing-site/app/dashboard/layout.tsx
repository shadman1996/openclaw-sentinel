"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050510" }}>
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: "#050510" }}>
      {/* Top bar */}
      <nav className="px-6 py-3 flex items-center justify-between sticky top-0 z-50" style={{ background: "rgba(5,5,16,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(135deg, #00e5ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AEGIS</Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Scanner", href: "/scan" },
              { label: "Billing", href: "/dashboard/billing" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}>
            <span className="text-cyan-400 text-sm font-semibold">{user.credits}</span>
            <span className="text-gray-400 text-xs">credits</span>
          </div>
          <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
          {user.is_admin && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">Admin</span>}
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
