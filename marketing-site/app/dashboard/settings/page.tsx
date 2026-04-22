"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Building, Shield, CheckCircle } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("aegis_token");
    if (!token) { router.replace("/login"); return; }
    fetchUser(token);
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setUser(d);
        setFullName(d.full_name || "");
        setCompany(d.company || "");
      } else {
        localStorage.removeItem("aegis_token");
        router.replace("/login");
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aegis_token")}`
        },
        body: JSON.stringify({ full_name: fullName, company: company })
      });
      if (res.ok) setMsg("✅ Profile updated successfully");
      else setError("Failed to update profile");
    } catch { setError("Network error"); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    if (newPw !== confirmPw) { setError("New passwords do not match"); return; }
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aegis_token")}`
        },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw })
      });
      if (res.ok) {
        setMsg("✅ Password changed successfully");
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        const d = await res.json();
        setError(d.detail || "Failed to change password");
      }
    } catch { setError("Network error"); }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #00D8FF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2rem", fontWeight: 800, color: "#F1F5F9", marginBottom: 8 }}>Account Settings</h1>
      <p style={{ color: "#64748B", marginBottom: 32 }}>Manage your profile and security preferences.</p>

      {msg && <div style={{ padding: 16, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: "0.9rem", marginBottom: 24 }}>{msg}</div>}
      {error && <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "0.9rem", marginBottom: 24 }}>{error}</div>}

      <div style={{ display: "grid", gap: 32 }}>
        {/* Profile Section */}
        <section style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F1F5F9", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <User size={20} color="#00D8FF" /> Profile Information
          </h3>
          <form onSubmit={handleUpdateProfile} style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>Email Address</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", color: "#64748B", fontSize: "0.95rem" }}>
                <Mail size={16} /> {user?.email}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#F1F5F9", fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Corp" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#F1F5F9", fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }} />
              </div>
            </div>
            <button type="submit" style={{ justifySelf: "start", padding: "12px 24px", background: "#00D8FF", color: "#030710", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Update Profile</button>
          </form>
        </section>

        {/* Password Section */}
        <section style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F1F5F9", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <Lock size={20} color="#8B5CF6" /> Security & Password
          </h3>
          <form onSubmit={handleChangePassword} style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#F1F5F9", fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#F1F5F9", fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94A3B8", display: "block", marginBottom: 8 }}>Confirm New Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#F1F5F9", fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }} />
              </div>
            </div>
            <button type="submit" style={{ justifySelf: "start", padding: "12px 24px", background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Change Password</button>
          </form>
        </section>
      </div>
    </div>
  );
}
