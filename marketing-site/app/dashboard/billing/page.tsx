"use client";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const PLANS = [
  { id: "payg_10",    name: "Pay-As-You-Go", credits: 10,  price: "$14",   period: "one-time",  desc: "10 AI remediation credits", features: ["Full free scanner access", "Plain-English reports", "30-day credit validity"], highlight: false },
  { id: "starter",    name: "Starter",       credits: 25,  price: "$29",   period: "per month", desc: "25 AI credits/mo",          features: ["Everything in PAYG", "Priority scan queue", "Email notifications", "14-day free trial"], highlight: false },
  { id: "pro",        name: "Pro",           credits: 100, price: "$79",   period: "per month", desc: "100 AI credits/mo",         features: ["Everything in Starter", "Scheduled scans", "API access", "SOC escalation", "Team dashboard"], highlight: true },
  { id: "enterprise", name: "Enterprise",    credits: 500, price: "$299",  period: "per month", desc: "500 AI credits/mo",         features: ["Everything in Pro", "Unlimited scans", "Dedicated SOC analyst", "Custom integrations", "SLA guarantee"], highlight: false },
];

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying]   = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { loadBalance(); }, []);

  const loadBalance = async () => {
    setLoading(true);
    try {
      const data = await api.getBalance();
      setBalance(data);
      setHistory(data.history || []);
    } catch {}
    setLoading(false);
  };

  const handleBuy = async (planId: string) => {
    setBuying(planId); setMessage("");
    try {
      const result = await api.checkout(planId);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setMessage(result.message || "Credits added!");
        await refreshUser();
        await loadBalance();
      }
    } catch (err: any) {
      setMessage(err.message || "Purchase failed");
    }
    setBuying(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Credits</h1>
        <p className="text-gray-400 mt-1">Buy credits to fix vulnerabilities with AI</p>
      </div>

      {/* Current balance */}
      <div className="rounded-xl p-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,58,237,0.08))", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-gray-400 text-sm">Current Balance</p>
          <p className="text-4xl font-bold text-cyan-400 mt-1">{balance?.credits ?? user?.credits ?? 0}</p>
          <p className="text-gray-400 text-sm mt-1">AI credits available</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Plan</p>
          <p className="text-xl font-semibold text-purple-400 mt-1">{(user?.plan || "free").toUpperCase()}</p>
        </div>
      </div>

      {message && (
        <div className="rounded-lg p-4 text-sm text-green-400" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          ✅ {message}
        </div>
      )}

      {/* Credit cost reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Standard AI Fix", cost: "1 Credit", icon: "🤖", desc: "Common misconfigs, port closures" },
          { label: "Complex AI Fix", cost: "3 Credits", icon: "⚡", desc: "Critical CVEs, multi-step patches" },
          { label: "Human SOC Escalation", cost: "50 Credits", icon: "📞", desc: "Dedicated analyst, 2-4hr SLA" },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-white font-semibold">{item.label}</p>
            <p className="text-cyan-400 font-bold text-lg mt-1">{item.cost}</p>
            <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className="rounded-xl p-6 flex flex-col relative"
              style={{
                background: plan.highlight ? "linear-gradient(135deg, rgba(0,229,255,0.05), rgba(124,58,237,0.05))" : "rgba(255,255,255,0.03)",
                border: plan.highlight ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
              }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold rounded-full text-white" style={{ background: "linear-gradient(135deg, #00e5ff, #7c3aed)" }}>
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-cyan-400 text-sm font-medium mt-2">{plan.desc}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuy(plan.id)} disabled={buying === plan.id}
                className="mt-6 w-full py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: plan.highlight ? "linear-gradient(135deg, #00e5ff, #7c3aed)" : "rgba(255,255,255,0.05)",
                  color: plan.highlight ? "white" : "#00e5ff",
                  border: plan.highlight ? "none" : "1px solid rgba(0,229,255,0.2)",
                }}>
                {buying === plan.id ? "Processing..." : plan.id === "payg_10" ? `Buy ${plan.credits} Credits` : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {history.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="text-lg font-semibold text-white">Transaction History</h2>
          </div>
          <div>
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4" style={{ borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                <div>
                  <p className="text-sm text-white font-medium">{h.reason.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                  <p className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${h.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {h.amount > 0 ? "+" : ""}{h.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
