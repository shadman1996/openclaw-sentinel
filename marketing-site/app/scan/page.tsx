"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Vuln {
  id: string; title: string; description: string; cve_id: string;
  severity: string; port: number; service: string; remediated: boolean; credit_cost: number;
}

export default function ScanPage() {
  const [target, setTarget]       = useState("");
  const [scanning, setScanning]   = useState(false);
  const [scanId, setScanId]       = useState<string | null>(null);
  const [vulns, setVulns]         = useState<Vuln[]>([]);
  const [error, setError]         = useState("");
  const [scanDone, setScanDone]   = useState(false);

  const handleScan = async () => {
    if (!target.trim()) return;
    setError(""); setScanning(true); setScanDone(false); setVulns([]);
    try {
      const result = await api.runScan(target.trim());
      setScanId(result.scan_id);
      const full = await api.getScan(result.scan_id);
      setVulns(full.vulnerabilities || []);
      setScanDone(true);
    } catch (err: any) {
      setError(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const sevColor: Record<string, string> = {
    critical: "text-red-500 bg-red-500/10 border-red-500/30",
    high:     "text-orange-400 bg-orange-400/10 border-orange-400/30",
    medium:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
    low:      "text-green-400 bg-green-400/10 border-green-400/30",
    info:     "text-gray-400 bg-gray-400/10 border-gray-400/30",
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: "var(--color-bg-dark, #050510)" }}>
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-32">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}>
              Free <span style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Security Scanner</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Enter any domain or IP address. We&apos;ll scan for vulnerabilities, open ports, and misconfigurations — completely free, no account required.
            </p>
          </div>

          {/* Scanner Input */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  placeholder="scanme.nmap.org or 192.168.1.1"
                  disabled={scanning}
                  className="w-full px-5 py-4 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none transition-all disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                {scanning && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button onClick={handleScan} disabled={scanning || !target.trim()}
                className="px-8 py-4 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
                {scanning ? "Scanning..." : "Scan Now"}
              </button>
            </div>
            {error && <p className="text-red-400 mt-3 text-sm text-center">{error}</p>}
          </div>

          {/* Scanning animation */}
          {scanning && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)" }}>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400">Scanning {target}...</span>
              </div>
              <p className="text-gray-500 mt-4 text-sm">Checking ports, services, and known CVEs</p>
            </div>
          )}

          {/* Results */}
          {scanDone && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center justify-between rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <h2 className="text-xl font-semibold text-white">Scan Results</h2>
                  <p className="text-gray-400 text-sm mt-1">Target: {target}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-3xl font-bold ${vulns.length > 0 ? "text-red-400" : "text-green-400"}`}>
                    {vulns.length}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {vulns.length === 1 ? "vulnerability" : "vulnerabilities"}<br/>found
                  </span>
                </div>
              </div>

              {/* Severity badges */}
              {vulns.length > 0 && (
                <div className="flex gap-2 px-2">
                  {["critical","high","medium","low"].map(sev => {
                    const count = vulns.filter(v => v.severity === sev).length;
                    if (!count) return null;
                    return (
                      <div key={sev} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${sevColor[sev]}`}>
                        {sev.toUpperCase()} · {count}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clean result */}
              {vulns.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div className="text-5xl mb-4">🛡️</div>
                  <h3 className="text-xl font-semibold text-green-400">All Clear!</h3>
                  <p className="text-gray-400 mt-2">No vulnerabilities found for this target.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vulns.map((v) => (
                    <div key={v.id} className="rounded-xl p-5 hover:border-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sevColor[v.severity]}`}>
                              {v.severity.toUpperCase()}
                            </span>
                            {v.cve_id && <span className="text-xs text-gray-500 font-mono">{v.cve_id}</span>}
                          </div>
                          <h3 className="font-semibold text-white">{v.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{v.description}</p>
                        </div>
                        <div className="text-right ml-6 shrink-0">
                          <div className="text-xs text-gray-500">Port {v.port}</div>
                          <div className="text-xs text-gray-500">{v.service}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                        <div className="text-sm text-gray-500">
                          AI Fix: <span className="text-white font-medium">{v.credit_cost} credit{v.credit_cost > 1 ? "s" : ""}</span>
                        </div>
                        <Link href={`/signup?redirect=/dashboard/scans/${scanId}`}
                          className="px-4 py-1.5 text-cyan-400 text-sm font-medium rounded-lg hover:bg-cyan-400/10 transition-colors"
                          style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)" }}>
                          Fix with AI →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {vulns.length > 0 && (
                <div className="rounded-xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.07), rgba(124,58,237,0.07))", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to fix these issues?</h3>
                  <p className="text-gray-400 mb-6">Sign up for free and get 3 AI remediation credits to try.</p>
                  <Link href={`/signup?redirect=/dashboard/scans/${scanId}`}
                    className="inline-flex px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
                    Sign Up Free — Fix Now
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
