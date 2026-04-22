"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(email, password, name, company);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold gradient-text">AEGIS</Link>
          <h1 className="text-2xl font-bold mt-4">Create your account</h1>
          <p className="text-gray-400 mt-2">Get 3 free AI credits to start fixing vulnerabilities</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111118] border border-white/5 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--aegis-cyan)]/50 transition-colors"
              placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--aegis-cyan)]/50 transition-colors"
              placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--aegis-cyan)]/50 transition-colors"
              placeholder="you@company.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--aegis-cyan)]/50 transition-colors pr-12"
                placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[var(--aegis-cyan)] to-[var(--aegis-purple)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--aegis-cyan)] hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
