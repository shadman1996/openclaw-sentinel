"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) setDone(true);
      else setError("Something went wrong. Please try again.");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050510" }}>
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Forgot Password?</h1>
          <p className="text-gray-400">No worries, we'll send you reset instructions.</p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white focus:outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Enter your email" />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl p-8 text-center space-y-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto">
              <Mail size={32} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
              <p className="text-gray-400 text-sm">We've sent an OTP to <span className="text-white font-medium">{email}</span>. Please use it to reset your password.</p>
            </div>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`} 
              className="block w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
              Go to Reset Page
            </Link>
            <button onClick={() => setDone(false)} className="text-sm text-gray-500 hover:text-white transition-colors">Didn't receive email? Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
