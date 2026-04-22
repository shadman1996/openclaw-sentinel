"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Check, Star, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    id: "payg",
    name: "Pay-As-You-Go",
    credits: 10,
    price: "$14",
    period: "one-time",
    description: "No commitment. Try it before you subscribe.",
    color: "#64748B",
    highlight: false,
    features: [
      "10 AI remediation credits",
      "Full free scanner access",
      "Plain-English reports",
      "30-day credit validity",
    ],
    cta: "Buy 10 Credits",
    note: null,
  },
  {
    id: "starter",
    name: "Starter",
    credits: 25,
    price: "$29",
    period: "per month",
    description: "For small teams getting serious about security.",
    color: "#00D8FF",
    highlight: false,
    features: [
      "25 AI remediation credits/mo",
      "Full free scanner access",
      "Plain-English vulnerability reports",
      "Zero-Breakage simulation on every fix",
      "Email support",
    ],
    cta: "Start Free Trial",
    note: "14-day free trial included",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    price: "$79",
    period: "per month",
    description: "For growing companies with real attack surface.",
    color: "#8B5CF6",
    highlight: true,
    features: [
      "100 AI remediation credits/mo",
      "Everything in Starter",
      "2 free SOC escalations/mo",
      "Priority ticket queue",
      "Slack integration",
      "Custom vulnerability SLAs",
    ],
    cta: "Start Free Trial",
    note: "Most popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 500,
    price: "$299",
    period: "per month",
    description: "For large organizations with compliance requirements.",
    color: "#F59E0B",
    highlight: false,
    features: [
      "500 AI remediation credits/mo",
      "Everything in Pro",
      "10 free SOC escalations/mo",
      "SLA-backed response guarantees",
      "Dedicated analyst contact",
      "Compliance report generation (SOC 2, ISO 27001)",
      "SSO / SAML support",
    ],
    cta: "Contact Sales",
    note: "Custom contracts available",
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="pricing"
      className="section-pad"
      ref={ref}
      style={{
        background:
          "linear-gradient(180deg, var(--aegis-bg) 0%, #080F1E 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              marginBottom: 16,
            }}
          >
            <Zap size={14} color="#F59E0B" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#F59E0B",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              AI Credits Pricing
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            Scanning is always free.{" "}
            <span className="gradient-text-cyan">Pay only to fix.</span>
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "#64748B",
              fontSize: "1.05rem",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            No hidden fees. No per-seat pricing. One AI credit = one automated
            fix. Escalate to a human SOC analyst for 50 credits.
          </p>
        </motion.div>

        {/* Credit conversion callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
            marginBottom: 48,
          }}
        >
          {[
            { label: "Standard AI Fix", cost: "1 Credit", color: "#00D8FF" },
            { label: "Complex AI Fix", cost: "3 Credits", color: "#8B5CF6" },
            { label: "Human SOC Escalation", cost: "50 Credits", color: "#F59E0B" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                borderRadius: 12,
                background: `${item.color}10`,
                border: `1px solid ${item.color}30`,
              }}
            >
              <Zap size={14} color={item.color} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  color: "#94A3B8",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: item.color,
                }}
              >
                = {item.cost}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              id={`pricing-tier-${tier.id}`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={tier.highlight ? "glass-strong" : "glass border-animate"}
              style={{
                borderRadius: 20,
                padding: "32px 28px",
                position: "relative",
                overflow: "hidden",
                border: tier.highlight
                  ? `1px solid ${tier.color}50`
                  : undefined,
                boxShadow: tier.highlight
                  ? `0 0 40px ${tier.color}20`
                  : undefined,
              }}
            >
              {/* Popular badge */}
              {tier.note && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: `${tier.color}20`,
                    border: `1px solid ${tier.color}40`,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: tier.color,
                    letterSpacing: "0.06em",
                  }}
                >
                  {tier.note}
                </div>
              )}

              {/* Tier icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${tier.color}18`,
                  border: `1px solid ${tier.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {tier.id === "enterprise" ? (
                  <Building2 size={20} color={tier.color} />
                ) : (
                  <Star size={20} color={tier.color} />
                )}
              </div>

              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#F1F5F9",
                  marginBottom: 6,
                }}
              >
                {tier.name}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  color: "#64748B",
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                {tier.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800,
                    fontSize: "2.5rem",
                    color: tier.color,
                    lineHeight: 1,
                  }}
                >
                  {tier.price}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    color: "#64748B",
                    marginLeft: 6,
                  }}
                >
                  {tier.period}
                </span>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.82rem",
                    color: tier.color,
                    fontWeight: 600,
                  }}
                >
                  {tier.credits} AI Credits
                  {tier.period === "per month" ? "/mo" : ""}
                </div>
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.85rem",
                      color: "#94A3B8",
                      lineHeight: 1.4,
                    }}
                  >
                    <Check
                      size={15}
                      color={tier.color}
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.id === "enterprise" ? "/signup?plan=enterprise" : `/signup?plan=${tier.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  background: tier.highlight
                    ? `linear-gradient(135deg, ${tier.color}, #00D8FF)`
                    : "transparent",
                  color: tier.highlight ? "#050A14" : tier.color,
                  border: tier.highlight
                    ? "none"
                    : `1px solid ${tier.color}50`,
                  transition: "all 0.2s ease",
                }}
              >
                {tier.cta}
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Free scanner reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{
            textAlign: "center",
            marginTop: 40,
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            color: "#475569",
          }}
        >
          <span style={{ color: "#10B981", fontWeight: 600 }}>✓</span> The
          vulnerability scanner is always{" "}
          <strong style={{ color: "#10B981" }}>100% free</strong>. No credit
          card required to scan. · Credits never expire on annual plans. ·
          Cancel anytime.
        </motion.div>
      </div>
    </section>
  );
}
