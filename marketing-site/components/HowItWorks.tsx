"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScanSearch, FileText, Wand2, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    icon: ScanSearch,
    number: "01",
    title: "Run the Free Scanner",
    description:
      "Install our lightweight OpenClaw agent on your server or cloud host. It audits open ports, firewall state, SSL certificates, CVEs, and misconfigurations. No credit card. No signup wall.",
    color: "#00D8FF",
    bullets: [
      "Network & cloud infrastructure scan",
      "CVE database cross-reference",
      "Firewall & open socket audit",
      "SSL/TLS certificate check",
    ],
  },
  {
    icon: FileText,
    number: "02",
    title: "Review Your Plain-English Report",
    description:
      "No jargon. Our AI translates every finding into clear, actionable language. Vulnerabilities are ranked by severity — Critical, High, Medium, Low — so you know exactly where to focus.",
    color: "#8B5CF6",
    bullets: [
      "AI-generated plain-English explanations",
      "Severity rankings: Critical to Low",
      "Business impact context per finding",
      "Free — always, forever",
    ],
  },
  {
    icon: Wand2,
    number: "03",
    title: "Auto-Fix with AI Credits",
    description:
      "Click 'Auto-Fix'. Our AI generates a remediation plan, runs it through the Zero-Breakage simulator, previews the exact diff, and only applies it once confirmed safe. Complex issues? Escalate to our human SOC team.",
    color: "#10B981",
    bullets: [
      "AI generates exact fix (bash / config patch)",
      "Digital Twin simulation before any change",
      "Full diff preview — you approve or reject",
      "One-click human SOC escalation (50 credits)",
    ],
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="section-pad"
      style={{ background: "var(--aegis-bg)" }}
      ref={ref}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#8B5CF6",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              How It Works
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
            From vulnerable to secured{" "}
            <span className="gradient-text-violet">in minutes.</span>
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
            Three steps. No security expertise required. We handle the
            complexity — you get the results.
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 1;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="glass border-animate"
                style={{
                  borderRadius: 20,
                  padding: "40px 40px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 40,
                  alignItems: "start",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background step number watermark */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: 30,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "8rem",
                    fontWeight: 900,
                    color: step.color,
                    opacity: 0.04,
                    pointerEvents: "none",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {step.number}
                </div>

                {/* Icon block */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${step.color}22, ${step.color}11)`,
                    border: `1px solid ${step.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={28} color={step.color} strokeWidth={1.75} />
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: step.color,
                        letterSpacing: "0.1em",
                      }}
                    >
                      STEP {step.number}
                    </span>
                    {i < steps.length - 1 && (
                      <ArrowRight size={14} color={step.color} opacity={0.5} />
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#F1F5F9",
                      marginBottom: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: "#94A3B8",
                      lineHeight: 1.7,
                      marginBottom: 20,
                      fontSize: "0.95rem",
                    }}
                  >
                    {step.description}
                  </p>
                  <ul style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", padding: 0, margin: 0, listStyle: "none" }}>
                    {step.bullets.map((b) => (
                      <li
                        key={b}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.85rem",
                          color: "#64748B",
                        }}
                      >
                        <Check size={14} color={step.color} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
