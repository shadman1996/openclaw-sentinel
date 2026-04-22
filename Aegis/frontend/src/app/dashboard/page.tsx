"use client";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [scans, setScans]   = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([api.listScans(), api.getBalance()]);
      setScans(s);
      setBalance(b);
    } catch {}
    setLoading(false);
  };

  const quickScan = async () => {
    if (!target.trim() || !user) return;
    setScanning(true);
    try {
      const result = await api.runScan(target.trim(), user.id);
      router.push(`/dashboard/scans/${result.scan_id}`);
    } catch {}
    setScanning(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || user?.email.split("@")[0]}</h1>
          <p className="text-gray-400 mt-1">Here&apos;s your security overview</p>
        </div>
        <Link href="/dashboard/billing"
          className="px-4 py-2 bg-[var(--aegis-cyan)]/10 text-[var(--aegis-cyan)] text-sm font-medium rounded-lg border border-[var(--aegis-cyan)]/20 hover:bg-[var(--aegis-cyan)]/20 transition-colors">
          Buy Credits
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Credits", value: balance?.credits ?? user?.credits ?? 0, color: "text-[var(--aegis-cyan)]" },
          { label: "Plan", value: (user?.plan || "free").toUpperCase(), color: "text-[var(--aegis-purple)]" },
          { label: "Total Scans", value: scans.length, color: "text-white" },
          { label: "Vulns Found", value: scans.reduce((a: number, s: any) => a + (s.vuln_count || 0), 0), color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] border border-white/5 rounded-xl p-5">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick scan */}
      <div className="bg-[#111118] border border-white/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Scan</h2>
        <div className="flex gap-3">
          <input value={target} onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && quickScan()}
            placeholder="Enter target domain or IP..."
            className="flex-1 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--aegis-cyan)]/50 transition-colors" />
          <button onClick={quickScan} disabled={scanning || !target.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[var(--aegis-cyan)] to-[var(--aegis-purple)] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40">
            {scanning ? "Scanning..." : "Scan"}
          </button>
        </div>
      </div>

      {/* Scan history */}
      <div className="bg-[#111118] border border-white/5 rounded-xl">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[var(--aegis-cyan)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : scans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No scans yet. Run your first scan above!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {scans.map(s => (
              <Link key={s.scan_id} href={`/dashboard/scans/${s.scan_id}`}
                className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="font-medium text-white">{s.target}</p>
                  <p className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${s.vuln_count > 0 ? "text-amber-400" : "text-green-400"}`}>
                    {s.vuln_count} vuln{s.vuln_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
