"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

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

      // Fetch full results
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text">AEGIS</Link>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-[var(--aegis-cyan)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity">Sign Up</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Free <span className="gradient-text">Security Scanner</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Enter any domain or IP address. We&apos;ll scan for vulnerabilities, open ports, and misconfigurations — completely free, no account required.
          </p>
        </div>

        {/* Scanner Input */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="scanme.nmap.org or 192.168.1.1"
                disabled={scanning}
                className="w-full px-5 py-4 bg-[#111118] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--aegis-cyan)]/50 focus:ring-1 focus:ring-[var(--aegis-cyan)]/20 transition-all text-lg disabled:opacity-50"
              />
              {scanning && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[var(--aegis-cyan)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !target.trim()}
              className="px-8 py-4 bg-gradient-to-r from-[var(--aegis-cyan)] to-[var(--aegis-purple)] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {scanning ? "Scanning..." : "Scan Now"}
            </button>
          </div>
          {error && <p className="text-red-400 mt-3 text-sm text-center">{error}</p>}
        </div>

        {/* Scanning animation */}
        {scanning && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#111118] border border-[var(--aegis-cyan)]/20 rounded-full animate-scan-pulse">
              <div className="w-3 h-3 bg-[var(--aegis-cyan)] rounded-full animate-pulse" />
              <span className="text-[var(--aegis-cyan)]">Scanning {target}...</span>
            </div>
            <p className="text-gray-500 mt-4 text-sm">Checking ports, services, and known CVEs</p>
          </div>
        )}

        {/* Results */}
        {scanDone && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between bg-[#111118] border border-white/5 rounded-xl p-6">
              <div>
                <h2 className="text-xl font-semibold">Scan Results</h2>
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

            {/* Breakdown bars */}
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

            {/* Vuln cards */}
            {vulns.length === 0 ? (
              <div className="text-center py-12 bg-[#111118] border border-green-500/20 rounded-xl">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-green-400">All Clear!</h3>
                <p className="text-gray-400 mt-2">No vulnerabilities found for this target.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vulns.map((v) => (
                  <div key={v.id} className="bg-[#111118] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
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
                      <Link
                        href={`/signup?redirect=/dashboard/scans/${scanId}`}
                        className="px-4 py-1.5 bg-[var(--aegis-cyan)]/10 text-[var(--aegis-cyan)] text-sm font-medium rounded-lg border border-[var(--aegis-cyan)]/20 hover:bg-[var(--aegis-cyan)]/20 transition-colors"
                      >
                        Fix with AI →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {vulns.length > 0 && (
              <div className="bg-gradient-to-r from-[var(--aegis-cyan)]/10 to-[var(--aegis-purple)]/10 border border-white/5 rounded-xl p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to fix these issues?</h3>
                <p className="text-gray-400 mb-6">Sign up for free and get 3 AI remediation credits to try.</p>
                <Link
                  href={`/signup?redirect=/dashboard/scans/${scanId}`}
                  className="inline-flex px-8 py-3 bg-gradient-to-r from-[var(--aegis-cyan)] to-[var(--aegis-purple)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Sign Up Free — Fix Now
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
