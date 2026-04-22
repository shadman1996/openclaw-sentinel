"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    
    try {
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: password })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const d = await res.json();
        setError(d.detail || "Invalid OTP or request failed");
      }
    } catch { setError("Network error"); }
    setLoading(false);
  };

  if (success) return (
    <div className="rounded-2xl p-8 text-center space-y-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck size={32} className="text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Password reset successful</h3>
        <p className="text-gray-400 text-sm">Your password has been updated. Redirecting to login...</p>
      </div>
      <Link href="/login" className="block w-full py-3 text-cyan-400 font-medium hover:underline transition-colors text-sm">Back to login now</Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">6-Digit OTP</label>
        <input value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
          className="w-full px-4 py-3 rounded-xl text-white focus:outline-none tracking-widest text-center text-xl font-bold"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          placeholder="000000" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          placeholder="••••••••" />
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050510" }}>
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reset Password</h1>
          <p className="text-gray-400">Enter your OTP and new password below.</p>
        </div>

        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
