"use client";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Vuln {
  id: string; title: string; description: string; cve_id: string;
  severity: string; port: number; service: string; remediated: boolean; credit_cost: number;
}

export default function ScanDetailPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [scan, setScan]     = useState<any>(null);
  const [vulns, setVulns]   = useState<Vuln[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixResults, setFixResults] = useState<Record<string, any>>({});
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  useEffect(() => { loadScan(); }, [id]);

  const loadScan = async () => {
    setLoading(true);
    try {
      const data = await api.getScan(id as string);
      setScan(data); setVulns(data.vulnerabilities || []);
    } catch {}
    setLoading(false);
  };

  const handleFix = async (vulnId: string) => {
    setFixingId(vulnId);
    try {
      const job = await api.triggerFix(vulnId);
      // Poll for result
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const status = await api.getJobStatus(job.job_id);
          if (status.status !== "pending" && status.status !== "simulating") {
            clearInterval(poll);
            setFixResults(prev => ({ ...prev, [vulnId]: status }));
            setFixingId(null);
            await refreshUser();
            await loadScan();
          }
        } catch {}
        if (attempts > 15) { clearInterval(poll); setFixingId(null); }
      }, 1500);
    } catch (err: any) {
      setFixResults(prev => ({ ...prev, [vulnId]: { status: "error", sim_result: err.message } }));
      setFixingId(null);
    }
  };

  const handleEscalate = async (vulnId: string) => {
    setEscalatingId(vulnId);
    try {
      const result = await api.escalate(vulnId);
      setFixResults(prev => ({ ...prev, [`soc_${vulnId}`]: result }));
      await refreshUser();
    } catch (err: any) {
      setFixResults(prev => ({ ...prev, [`soc_${vulnId}`]: { status: "error", message: err.message } }));
    }
    setEscalatingId(null);
  };

  const sevColor: Record<string, string> = {
    critical: "text-red-500 bg-red-500/10 border-red-500/30",
    high:     "text-orange-400 bg-orange-400/10 border-orange-400/30",
    medium:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
    low:      "text-green-400 bg-green-400/10 border-green-400/30",
    info:     "text-gray-400 bg-gray-400/10 border-gray-400/30",
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold text-white mt-2">Scan: {scan?.target}</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date(scan?.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${vulns.length > 0 ? "text-red-400" : "text-green-400"}`}>{vulns.length}</span>
          <span className="text-gray-400 text-sm">vulnerabilities</span>
        </div>
      </div>

      {/* Vuln list */}
      {vulns.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold text-green-400">All Clear!</h3>
          <p className="text-gray-400 mt-2">No vulnerabilities found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vulns.map(v => {
            const result = fixResults[v.id];
            const socResult = fixResults[`soc_${v.id}`];
            return (
              <div key={v.id} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${v.remediated ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.05)"}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sevColor[v.severity]}`}>
                        {v.severity.toUpperCase()}
                      </span>
                      {v.cve_id && <span className="text-xs text-gray-500 font-mono">{v.cve_id}</span>}
                      {v.remediated && <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full">✓ Fixed</span>}
                    </div>
                    <h3 className="font-semibold text-white text-lg">{v.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{v.description}</p>
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <div className="text-xs text-gray-500">Port {v.port}</div>
                    <div className="text-xs text-gray-500">{v.service}</div>
                  </div>
                </div>

                {/* Fix result */}
                {result && (
                  <div className={`rounded-lg p-3 mb-3 text-sm ${result.status === "applied" ? "bg-green-500/10 text-green-400 border border-green-500/20" : result.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    <span className="font-semibold">{result.status === "applied" ? "✅ Fix Applied" : result.status === "rejected" ? "❌ Fix Rejected (Zero-Breakage)" : "⚠️ " + (result.sim_result || result.status)}</span>
                    {result.sim_result && <span className="ml-2">— {result.sim_result}</span>}
                    {result.credits_used > 0 && <span className="ml-2 text-gray-400">({result.credits_used} credit{result.credits_used > 1 ? "s" : ""} used)</span>}
                  </div>
                )}

                {/* SOC result */}
                {socResult && (
                  <div className="rounded-lg p-3 mb-3 text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {socResult.status === "error"
                      ? `⚠️ ${socResult.message}`
                      : `📞 SOC Ticket Created — Analyst ${socResult.assignee} assigned. Response within ${socResult.sla_hours}h.`}
                  </div>
                )}

                {/* Action buttons */}
                {!v.remediated && (
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-4">
                    <button onClick={() => handleFix(v.id)}
                      disabled={fixingId === v.id || !!result}
                      className="px-5 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
                      style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
                      {fixingId === v.id ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Fixing...</>
                      ) : (
                        <>🤖 AI Fix ({v.credit_cost} credit{v.credit_cost > 1 ? "s" : ""})</>
                      )}
                    </button>
                    <button onClick={() => handleEscalate(v.id)}
                      disabled={escalatingId === v.id || !!socResult}
                      className="px-5 py-2 text-sm font-medium text-purple-400 rounded-lg hover:bg-purple-400/10 disabled:opacity-40 transition-all"
                      style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)" }}>
                      {escalatingId === v.id ? "Escalating..." : "📞 SOC Escalation (50 credits)"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
