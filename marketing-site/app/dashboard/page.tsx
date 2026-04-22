"use client";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [scans, setScans]     = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [target, setTarget]   = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([api.listScans(), api.getBalance()]);
      setScans(s); setBalance(b);
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

  const stats = [
    { label: "Credits", value: balance?.credits ?? user?.credits ?? 0, color: "#00e5ff" },
    { label: "Plan", value: (user?.plan || "free").toUpperCase(), color: "#7c3aed" },
    { label: "Total Scans", value: scans.length, color: "#ffffff" },
    { label: "Vulns Found", value: scans.reduce((a: number, s: any) => a + (s.vuln_count || 0), 0), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.full_name || user?.email?.split("@")[0]}</h1>
          <p className="text-gray-400 mt-1">Here&apos;s your security overview</p>
        </div>
        <Link href="/dashboard/billing"
          className="px-4 py-2 text-cyan-400 text-sm font-medium rounded-lg transition-colors hover:bg-cyan-400/10"
          style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)" }}>
          Buy Credits
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick scan */}
      <div className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Scan</h2>
        <div className="flex gap-3">
          <input value={target} onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && quickScan()}
            placeholder="Enter target domain or IP..."
            className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <button onClick={quickScan} disabled={scanning || !target.trim()}
            className="px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
            {scanning ? "Scanning..." : "Scan"}
          </button>
        </div>
      </div>

      {/* Scan history */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : scans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No scans yet. Run your first scan above!</div>
        ) : (
          <div>
            {scans.map((s, i) => (
              <Link key={s.scan_id} href={`/dashboard/scans/${s.scan_id}`}
                className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: i < scans.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                <div>
                  <p className="font-medium text-white">{s.target}</p>
                  <p className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${s.vuln_count > 0 ? "text-amber-400" : "text-green-400"}`}>
                    {s.vuln_count} vuln{s.vuln_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-500">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
