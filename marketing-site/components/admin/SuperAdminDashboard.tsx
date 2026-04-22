"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Users, Scan, Bug, CreditCard, Zap, AlertTriangle,
  CheckCircle, XCircle, Clock, RefreshCw, LogOut, ArrowRight,
  Activity, BarChart3, Ticket, Pencil, DollarSign, Settings, X
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";

const SESSION_KEY = "aegis_admin_session";
const API_BASE = "http://localhost:8000";

interface AdminSession {
  email: string;
  role: string;
  loginAt: string;
  token?: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [tab, setTab] = useState<"overview" | "users" | "scans" | "tickets" | "jobs" | "settings">("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Modal state
  const [editUser, setEditUser] = useState<any>(null);
  const [refundUser, setRefundUser] = useState<any>(null);
  const [refundAmt, setRefundAmt] = useState(10);
  const [refundReason, setRefundReason] = useState("Admin refund");
  const [actionMsg, setActionMsg] = useState("");
  // Ledger state
  const [userLedger, setUserLedger] = useState<any[]>([]);
  const [viewingLedger, setViewingLedger] = useState<any>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/admin"); return; }
    const parsed = JSON.parse(raw);
    setSession(parsed);
    loadData(parsed.token || localStorage.getItem("aegis_token"));
  }, []);

  const getHeaders = (token: string | null) => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  const safeArray = async (res: Response) => {
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const loadData = async (token: string | null) => {
    setLoading(true); setError("");
    try {
      const headers = getHeaders(token);
      const [statsRes, usersRes, scansRes, ticketsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/admin/scans`, { headers }),
        fetch(`${API_BASE}/admin/tickets`, { headers }),
        fetch(`${API_BASE}/admin/remediation-jobs`, { headers }),
      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch admin data. Is the backend running?");

      setStats(await statsRes.json());
      setUsers(await safeArray(usersRes));
      setScans(await safeArray(scansRes));
      setTickets(await safeArray(ticketsRes));
      setJobs(await safeArray(jobsRes));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    router.replace("/admin");
  };

  const handleRefresh = () => {
    const token = session?.token || localStorage.getItem("aegis_token");
    loadData(token);
  };

  const getToken = () => session?.token || localStorage.getItem("aegis_token") || "";

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${editUser.id}`, {
        method: "PATCH", headers: getHeaders(getToken()),
        body: JSON.stringify({ full_name: editUser.full_name, company: editUser.company, plan: editUser.plan, credits: editUser.credits, is_admin: editUser.is_admin }),
      });
      if (res.ok) { setActionMsg(`✅ Updated ${editUser.email}`); setEditUser(null); handleRefresh(); }
      else setActionMsg("❌ Update failed");
    } catch { setActionMsg("❌ Network error"); }
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleRefundSubmit = async () => {
    if (!refundUser) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${refundUser.id}/refund`, {
        method: "POST", headers: getHeaders(getToken()),
        body: JSON.stringify({ amount: refundAmt, reason: refundReason }),
      });
      if (res.ok) { const d = await res.json(); setActionMsg(`✅ Refunded ${d.refunded} credits to ${d.email} (new balance: ${d.new_balance})`); setRefundUser(null); handleRefresh(); }
      else setActionMsg("❌ Refund failed");
    } catch { setActionMsg("❌ Network error"); }
    setTimeout(() => setActionMsg(""), 4000);
  };

  const handleFetchLedger = async (u: any) => {
    setLedgerLoading(true);
    setViewingLedger(u);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${u.id}/ledger`, { headers: getHeaders(getToken()) });
      if (res.ok) setUserLedger(await res.json());
    } catch (e) { console.error(e); }
    setLedgerLoading(false);
  };

  if (!session) return null;

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "#00D8FF" },
    { label: "Total Scans", value: stats.total_scans, icon: Scan, color: "#8B5CF6" },
    { label: "Vulnerabilities", value: stats.total_vulns, icon: Bug, color: "#F59E0B" },
    { label: "AI Fixes Applied", value: stats.ai_fixes, icon: CheckCircle, color: "#10B981" },
    { label: "Sim Rejected", value: stats.sim_rejected, icon: XCircle, color: "#EF4444" },
    { label: "Open SOC Tickets", value: stats.open_tickets, icon: AlertTriangle, color: "#F97316" },
    { label: "Credits Sold", value: stats.credits_sold, icon: CreditCard, color: "#06B6D4" },
    { label: "Credits Consumed", value: stats.credits_spent, icon: Zap, color: "#EC4899" },
  ] : [];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "scans", label: "Scans", icon: Scan },
    { id: "tickets", label: "SOC Tickets", icon: Ticket },
    { id: "jobs", label: "Remediation", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#030710", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        background: "rgba(3,7,16,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,216,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #00D8FF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={18} color="#030710" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#F1F5F9" }}>
            Aegis <span style={{ color: "#EF4444" }}>Super Admin</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.8rem", color: "#64748B" }}>{session.email}</span>
          <span style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 600 }}>
            DEVELOPER
          </span>
          <button onClick={handleRefresh} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4 }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4 }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.05)", padding: "24px 12px", position: "sticky", top: 60, height: "calc(100vh - 60px)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                marginBottom: 4, fontSize: "0.85rem", fontWeight: 500, textAlign: "left",
                background: tab === t.id ? "rgba(0,216,255,0.1)" : "transparent",
                color: tab === t.id ? "#00D8FF" : "#64748B",
                transition: "all 0.15s ease",
              }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "24px 32px", minHeight: "calc(100vh - 60px)" }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: "0.85rem", marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ width: 32, height: 32, border: "2px solid #00D8FF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <p style={{ color: "#64748B", marginTop: 12, fontSize: "0.85rem" }}>Loading platform data...</p>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {tab === "overview" && (
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>Platform Overview</h2>
                  {/* Stat Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                    {statCards.map(card => (
                      <div key={card.label} style={{
                        padding: "20px", borderRadius: 14,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <card.icon size={16} color={card.color} />
                          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{card.label}</span>
                        </div>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: card.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {card.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                    {/* Platform Activity Donut */}
                    <div style={{ padding: 24, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: 16 }}>Security Posture</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "AI Fixed", value: stats?.ai_fixes || 0 },
                              { name: "Sim Rejected", value: stats?.sim_rejected || 0 },
                              { name: "Open Vulns", value: Math.max(0, (stats?.total_vulns || 0) - (stats?.ai_fixes || 0) - (stats?.sim_rejected || 0)) },
                            ]}
                            cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                            paddingAngle={4} dataKey="value"
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#EF4444" />
                            <Cell fill="#F59E0B" />
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: "0.8rem" }}
                            itemStyle={{ color: "#F1F5F9" }}
                          />
                          <Legend
                            iconType="circle" iconSize={8}
                            wrapperStyle={{ fontSize: "0.78rem", color: "#94A3B8" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Credits Bar Chart */}
                    <div style={{ padding: 24, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: 16 }}>Credit Economy</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={[
                          { name: "Sold", amount: stats?.credits_sold || 0 },
                          { name: "Consumed", amount: stats?.credits_spent || 0 },
                          { name: "Net Balance", amount: (stats?.credits_sold || 0) - (stats?.credits_spent || 0) },
                        ]} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} />
                          <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} />
                          <Tooltip
                            contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: "0.8rem" }}
                            itemStyle={{ color: "#F1F5F9" }}
                          />
                          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                            <Cell fill="#06B6D4" />
                            <Cell fill="#EC4899" />
                            <Cell fill="#10B981" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Scan Vulnerability Distribution */}
                  <div style={{ padding: 24, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 32 }}>
                    <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "#F1F5F9", marginBottom: 16 }}>Vulnerabilities per Scan</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={(scans || []).slice(0, 10).reverse().map(s => ({
                        target: s.target?.substring(0, 15) || "scan",
                        vulns: s.vuln_count || 0,
                      }))}>
                        <defs>
                          <linearGradient id="vulnGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="target" tick={{ fill: "#475569", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} />
                        <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} />
                        <Tooltip
                          contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: "0.8rem" }}
                          itemStyle={{ color: "#F1F5F9" }}
                        />
                        <Area type="monotone" dataKey="vulns" stroke="#8B5CF6" fill="url(#vulnGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recent Scans List */}
                  <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "#F1F5F9", marginBottom: 12 }}>Recent Scans</h3>
                  <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
                    {scans.slice(0, 5).map((s, i) => (
                      <div key={s.scan_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                        <div>
                          <span style={{ fontWeight: 500, color: "#F1F5F9", fontSize: "0.85rem" }}>{s.target}</span>
                          <span style={{ color: "#475569", fontSize: "0.75rem", marginLeft: 10 }}>{s.user_email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: s.vuln_count > 0 ? "#F59E0B" : "#10B981" }}>{s.vuln_count} vulns</span>
                          <span style={{ fontSize: "0.7rem", color: "#475569" }}>{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {scans.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>No scans yet</div>}
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {tab === "users" && (
                <div>
                  {actionMsg && <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10B981", fontSize: "0.85rem", marginBottom: 16 }}>{actionMsg}</div>}
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>
                    All Users <span style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 400 }}>({users.length})</span>
                  </h2>
                  <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.7fr 0.6fr 0.8fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontWeight: 600 }}>
                      <span>Email</span><span>Name</span><span>Company</span><span>Plan</span><span>Credits</span><span>Joined</span><span>Actions</span>
                    </div>
                    {users.map(u => (
                      <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.7fr 0.6fr 0.8fr 1fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ color: "#F1F5F9", fontWeight: 500 }}>{u.email}</span>
                        <span style={{ color: "#94A3B8" }}>{u.full_name || "—"}</span>
                        <span style={{ color: "#64748B" }}>{u.company || "—"}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: u.plan === "pro" ? "rgba(139,92,246,0.15)" : u.plan === "starter" ? "rgba(0,216,255,0.15)" : u.plan === "enterprise" ? "rgba(245,158,11,0.15)" : "rgba(100,116,139,0.15)", color: u.plan === "pro" ? "#8B5CF6" : u.plan === "starter" ? "#00D8FF" : u.plan === "enterprise" ? "#F59E0B" : "#64748B" }}>
                          {u.plan.toUpperCase()}
                        </span>
                        <span style={{ color: "#00D8FF", fontWeight: 600 }}>{u.credits}</span>
                        <span style={{ color: "#475569", fontSize: "0.78rem" }}>{new Date(u.created_at).toLocaleDateString()}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditUser({...u})} style={{ background: "rgba(0,216,255,0.1)", border: "1px solid rgba(0,216,255,0.25)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#00D8FF", fontSize: "0.7rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Pencil size={12}/>Edit</button>
                          <button onClick={() => { setRefundUser(u); setRefundAmt(10); setRefundReason("Admin refund"); }} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#10B981", fontSize: "0.7rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={12}/>Refund</button>
                          <button onClick={() => handleFetchLedger(u)} style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#8B5CF6", fontSize: "0.7rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12}/>Ledger</button>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#475569" }}>No users yet</div>}
                  </div>

                  {/* EDIT USER MODAL */}
                  {editUser && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }} onClick={() => setEditUser(null)}>
                      <div onClick={e => e.stopPropagation()} style={{ width: 440, background: "#0B1120", border: "1px solid rgba(0,216,255,0.2)", borderRadius: 16, padding: 28 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                          <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, color: "#F1F5F9", fontSize: "1.1rem" }}>Edit User</h3>
                          <button onClick={() => setEditUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><X size={18}/></button>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 16 }}>{editUser.email}</p>
                        {[{l:"Full Name",k:"full_name"},{l:"Company",k:"company"}].map(f => (
                          <div key={f.k} style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", marginBottom: 4 }}>{f.l}</label>
                            <input value={editUser[f.k] || ""} onChange={e => setEditUser({...editUser, [f.k]: e.target.value})} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F5F9", fontSize: "0.85rem", boxSizing: "border-box" }} />
                          </div>
                        ))}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", marginBottom: 4 }}>Plan</label>
                            <select value={editUser.plan} onChange={e => setEditUser({...editUser, plan: e.target.value})} style={{ width: "100%", padding: "8px 12px", background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F5F9", fontSize: "0.85rem" }}>
                              <option value="free">Free</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", marginBottom: 4 }}>Credits</label>
                            <input type="number" value={editUser.credits} onChange={e => setEditUser({...editUser, credits: parseInt(e.target.value)||0})} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F5F9", fontSize: "0.85rem", boxSizing: "border-box" }} />
                          </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer" }}>
                          <input type="checkbox" checked={editUser.is_admin} onChange={e => setEditUser({...editUser, is_admin: e.target.checked})} />
                          <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Admin privileges</span>
                        </label>
                        <button onClick={handleEditSave} style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #00D8FF, #8B5CF6)", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", color: "#030710" }}>Save Changes</button>
                      </div>
                    </div>
                  )}

                  {/* REFUND MODAL */}
                  {refundUser && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }} onClick={() => setRefundUser(null)}>
                      <div onClick={e => e.stopPropagation()} style={{ width: 400, background: "#0B1120", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: 28 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                          <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, color: "#F1F5F9", fontSize: "1.1rem" }}>Refund Credits</h3>
                          <button onClick={() => setRefundUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><X size={18}/></button>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: 4 }}>{refundUser.email}</p>
                        <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: 16 }}>Current balance: <strong style={{ color: "#00D8FF" }}>{refundUser.credits}</strong> credits</p>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", marginBottom: 4 }}>Amount</label>
                          <input type="number" min={1} value={refundAmt} onChange={e => setRefundAmt(parseInt(e.target.value)||0)} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F5F9", fontSize: "0.85rem", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                          <label style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, display: "block", marginBottom: 4 }}>Reason</label>
                          <input value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F5F9", fontSize: "0.85rem", boxSizing: "border-box" }} />
                        </div>
                        <button onClick={handleRefundSubmit} style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #10B981, #06B6D4)", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", color: "#030710" }}>Issue Refund</button>
                      </div>
                    </div>
                  )}

                  {/* LEDGER MODAL */}
                  {viewingLedger && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }} onClick={() => setViewingLedger(null)}>
                      <div onClick={e => e.stopPropagation()} style={{ width: 600, background: "#0B1120", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: 28, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                          <div>
                            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, color: "#F1F5F9", fontSize: "1.1rem" }}>Transaction Ledger</h3>
                            <p style={{ fontSize: "0.8rem", color: "#64748B" }}>{viewingLedger.email}</p>
                          </div>
                          <button onClick={() => setViewingLedger(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><X size={18}/></button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: "auto", paddingRight: 10 }}>
                          {ledgerLoading ? (
                            <p style={{ textAlign: "center", color: "#64748B", padding: 20 }}>Loading history...</p>
                          ) : userLedger.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#475569", padding: 20 }}>No transactions yet</p>
                          ) : (
                            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "10px 14px", background: "rgba(255,255,255,0.02)", fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase" }}>
                                <span>Amount</span><span>Date</span><span>Reason</span>
                              </div>
                              {userLedger.map(l => (
                                <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.8rem", alignItems: "center" }}>
                                  <span style={{ color: l.amount > 0 ? "#10B981" : "#EF4444", fontWeight: 600 }}>{l.amount > 0 ? "+" : ""}{l.amount}</span>
                                  <span style={{ color: "#64748B", fontSize: "0.75rem" }}>{new Date(l.created_at).toLocaleDateString()}</span>
                                  <span style={{ color: "#94A3B8" }}>{l.reason} {l.stripe_ref && <span style={{fontSize: "0.6rem", color: "#475569"}}>({l.stripe_ref})</span>}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SCANS TAB */}
              {tab === "scans" && (
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>
                    All Scans <span style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 400 }}>({scans.length})</span>
                  </h2>
                  <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 0.8fr 0.8fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontWeight: 600 }}>
                      <span>Target</span><span>User</span><span>Vulns</span><span>Status</span><span>Date</span>
                    </div>
                    {scans.map(s => (
                      <div key={s.scan_id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 0.8fr 0.8fr 1fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ color: "#F1F5F9", fontWeight: 500 }}>{s.target}</span>
                        <span style={{ color: "#94A3B8" }}>{s.user_email}</span>
                        <span style={{ fontWeight: 600, color: s.vuln_count > 0 ? "#F59E0B" : "#10B981" }}>{s.vuln_count}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: s.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: s.status === "completed" ? "#10B981" : "#F59E0B" }}>
                          {s.status.toUpperCase()}
                        </span>
                        <span style={{ color: "#475569", fontSize: "0.78rem" }}>{new Date(s.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                    {scans.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#475569" }}>No scans yet</div>}
                  </div>
                </div>
              )}

              {/* TICKETS TAB */}
              {tab === "tickets" && (
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>
                    SOC Tickets <span style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 400 }}>({tickets.length})</span>
                  </h2>
                  {tickets.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#475569" }}>
                      No SOC tickets yet. Tickets appear when users escalate vulnerabilities.
                    </div>
                  ) : (
                    <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontWeight: 600 }}>
                        <span>User</span><span>Assignee</span><span>Status</span><span>SLA</span><span>Created</span>
                      </div>
                      {tickets.map(t => (
                        <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.85rem", alignItems: "center" }}>
                          <span style={{ color: "#F1F5F9" }}>{t.user_email}</span>
                          <span style={{ color: "#8B5CF6", fontWeight: 500 }}>{t.assignee}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: t.status === "resolved" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: t.status === "resolved" ? "#10B981" : "#F59E0B" }}>
                            {t.status.toUpperCase()}
                          </span>
                          <span style={{ color: "#64748B" }}>{t.sla_hours}h</span>
                          <span style={{ color: "#475569", fontSize: "0.78rem" }}>{new Date(t.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REMEDIATION JOBS TAB */}
              {tab === "jobs" && (
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>
                    Remediation Jobs <span style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 400 }}>({jobs.length})</span>
                  </h2>
                  {jobs.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#475569" }}>
                      No remediation jobs yet. Jobs appear when users trigger AI fixes.
                    </div>
                  ) : (
                    <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 1fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontWeight: 600 }}>
                        <span>Vulnerability</span><span>Status</span><span>Credits</span><span>Result</span><span>Date</span>
                      </div>
                      {jobs.map(j => (
                        <div key={j.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.85rem", alignItems: "center" }}>
                          <span style={{ color: "#F1F5F9", fontWeight: 500 }}>{j.vuln_title}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: j.status === "applied" ? "rgba(16,185,129,0.15)" : j.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: j.status === "applied" ? "#10B981" : j.status === "rejected" ? "#EF4444" : "#F59E0B" }}>
                            {j.status.toUpperCase()}
                          </span>
                          <span style={{ color: "#EC4899", fontWeight: 600 }}>{j.credits_used}</span>
                          <span style={{ color: "#64748B", fontSize: "0.78rem" }}>{j.sim_result || "—"}</span>
                          <span style={{ color: "#475569", fontSize: "0.78rem" }}>{new Date(j.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F1F5F9", marginBottom: 24 }}>Platform Settings</h2>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <DollarSign size={18} color="#00D8FF" /> Pricing Configuration
                      </h3>
                      {[
                        { l: "Credit Price (USD)", v: "$0.50", d: "Base cost per credit for PAYG" },
                        { l: "Starter Plan Monthly", v: "$49", d: "Monthly cost for Starter tier" },
                        { l: "Pro Plan Monthly", v: "$199", d: "Monthly cost for Pro tier" },
                        { l: "AI Fix Cost", v: "10 Credits", d: "Cost to apply one automated fix" },
                        { l: "SOC Ticket Cost", v: "50 Credits", d: "Cost to escalate to human analyst" },
                      ].map(s => (
                        <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <div>
                            <div style={{ color: "#F1F5F9", fontSize: "0.9rem", fontWeight: 500 }}>{s.l}</div>
                            <div style={{ color: "#64748B", fontSize: "0.75rem" }}>{s.d}</div>
                          </div>
                          <div style={{ color: "#00D8FF", fontWeight: 700 }}>{s.v}</div>
                        </div>
                      ))}
                      <button style={{ width: "100%", padding: 10, background: "rgba(0,216,255,0.1)", color: "#00D8FF", border: "1px solid rgba(0,216,255,0.2)", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "not-allowed" }}>
                        Edit Pricing (Database Required)
                      </button>
                    </div>

                    <div style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={18} color="#8B5CF6" /> Service Level Agreements
                      </h3>
                      {[
                        { l: "Critical Response", v: "2 Hours", d: "Target for critical vulnerabilities" },
                        { l: "Standard Response", v: "12 Hours", d: "Target for low/info vulnerabilities" },
                        { l: "Max Scan Duration", v: "30 Mins", d: "Safety timeout for network scans" },
                        { l: "Audit Retention", v: "1 Year", d: "How long logs are stored" },
                      ].map(s => (
                        <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <div>
                            <div style={{ color: "#F1F5F9", fontSize: "0.9rem", fontWeight: 500 }}>{s.l}</div>
                            <div style={{ color: "#64748B", fontSize: "0.75rem" }}>{s.d}</div>
                          </div>
                          <div style={{ color: "#8B5CF6", fontWeight: 700 }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
