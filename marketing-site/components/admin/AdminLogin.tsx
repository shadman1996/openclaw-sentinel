"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

// ─── MVP fallback credentials (used when backend is unavailable) ───
const ADMIN_EMAIL    = "admin@aegis.io";
const ADMIN_PASSWORD = "Aegis@2026";
const SESSION_KEY    = "aegis_admin_session";
const API_BASE       = "http://localhost:8000";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(SESSION_KEY)) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Try backend API auth first
    try {
      const form = new URLSearchParams();
      form.set("username", email.trim().toLowerCase());
      form.set("password", password);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (res.ok) {
        const data = await res.json();
        // Check admin flag via /auth/me
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { "Authorization": `Bearer ${data.access_token}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.is_admin) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
              email: me.email,
              role: "superadmin",
              loginAt: new Date().toISOString(),
              token: data.access_token,
            }));
            localStorage.setItem("aegis_token", data.access_token);
            router.replace("/admin/dashboard");
            return;
          } else {
            setError("You do not have admin privileges.");
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // API unavailable — fall through to hardcoded check
    }

    // Fallback: hardcoded MVP credentials
    await new Promise((r) => setTimeout(r, 400));
    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        email,
        role: "superadmin",
        loginAt: new Date().toISOString(),
      }));
      router.replace("/admin/dashboard");
    } else {
      setError("Invalid credentials. Check your email and password.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#030710",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,216,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(0,216,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,216,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          width: "100%", maxWidth: 420,
          background: "rgba(11,17,32,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0,216,255,0.15)",
          borderRadius: 24,
          padding: "40px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: 60, height: 60, borderRadius: 16, margin: "0 auto 14px",
              background: "linear-gradient(135deg, #00D8FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(0,216,255,0.3)",
            }}
          >
            <Shield size={28} color="#030710" strokeWidth={2.5} />
          </motion.div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#F1F5F9",
            marginBottom: 6,
          }}>
            Aegis Admin
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748B" }}>
            Restricted access · Authenticate to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: "0.78rem", fontWeight: 600,
              color: "#94A3B8", marginBottom: 8, letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#475569" style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aegis.io"
                style={{
                  width: "100%", padding: "12px 14px 12px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, color: "#F1F5F9",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.9rem",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,216,255,0.4)")}
                onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block", fontSize: "0.78rem", fontWeight: 600,
              color: "#94A3B8", marginBottom: 8, letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#475569" style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{
                  width: "100%", padding: "12px 44px 12px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, color: "#F1F5F9",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.9rem",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,216,255,0.4)")}
                onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", color: "#475569", padding: 0,
                }}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.83rem", color: "#EF4444" }}>{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{
              width: "100%", padding: "13px 0",
              background: loading
                ? "rgba(0,216,255,0.3)"
                : "linear-gradient(135deg, #00D8FF, #8B5CF6)",
              border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: "0.95rem", color: loading ? "#94A3B8" : "#030710",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 4px 20px rgba(0,216,255,0.25)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                Authenticating…
              </>
            ) : (
              "Sign In to Admin Panel"
            )}
          </motion.button>
        </form>

        {/* Footer note */}
        <p style={{
          textAlign: "center", marginTop: 24,
          fontSize: "0.75rem", color: "#334155", lineHeight: 1.6,
        }}>
          This portal is restricted to Aegis staff only.<br />
          Unauthorized access attempts are logged.
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
