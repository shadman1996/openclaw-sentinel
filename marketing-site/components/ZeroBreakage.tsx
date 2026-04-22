"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FlaskConical, GitBranch, ShieldCheck, Undo2, CheckCircle2, XCircle } from "lucide-react";

const simSteps = [
  { icon: GitBranch,     label: "AI generates fix plan",          color: "#00D8FF" },
  { icon: FlaskConical,  label: "Digital Twin simulation runs",    color: "#8B5CF6" },
  { icon: ShieldCheck,   label: "Static analysis & diff preview",  color: "#8B5CF6" },
  { icon: CheckCircle2,  label: "Safe? Applied to production",     color: "#10B981" },
  { icon: Undo2,         label: "Unsafe? Rejected. No charge.",    color: "#EF4444" },
];

const guarantees = [
  {
    title: "Syntax Validation",
    desc: "Every fix script is parsed for errors before execution.",
    icon: "✓",
  },
  {
    title: "Port Conflict Detection",
    desc: "We check that no fix will block a critical service port.",
    icon: "✓",
  },
  {
    title: "Firewall Diff Preview",
    desc: "See exactly which rules are added or removed before anything is applied.",
    icon: "✓",
  },
  {
    title: "Instant Rollback Snapshot",
    desc: "Your config is snapshotted before every change. One-click revert.",
    icon: "✓",
  },
];

export default function ZeroBreakage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="zero-breakage"
      className="section-pad"
      ref={ref}
      style={{
        background:
          "linear-gradient(180deg, var(--aegis-bg) 0%, #080F1E 50%, var(--aegis-bg) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#10B981",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Zero-Breakage Guarantee
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
            We simulate before we{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10B981, #00D8FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ever touch your system.
            </span>
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "#64748B",
              fontSize: "1.05rem",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Our Digital Twin engine runs every AI-generated fix through a
            multi-stage simulation. If it fails any check — it's rejected and
            you pay nothing. Period.
          </p>
        </motion.div>

        {/* Simulation Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass"
          style={{
            borderRadius: 24,
            padding: "40px 40px",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              flexWrap: "wrap",
            }}
          >
            {simSteps.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === simSteps.length - 1;
              const isFork = i === 3; // "safe → applied" is the success fork
              return (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.12, type: "spring" }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `${s.color}18`,
                        border: `1px solid ${s.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} color={s.color} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.75rem",
                        color: "#94A3B8",
                        textAlign: "center",
                        maxWidth: 100,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.label}
                    </span>
                  </motion.div>
                  {!isLast && (
                    <div
                      style={{
                        width: 32,
                        height: 1,
                        background:
                          i === 2
                            ? "linear-gradient(90deg, #8B5CF6, #10B981)"
                            : `linear-gradient(90deg, ${s.color}60, ${simSteps[i + 1].color}60)`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Outcome boxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 32,
              maxWidth: 600,
              margin: "32px auto 0",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 12,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle2 size={20} color="#10B981" />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#10B981",
                  }}
                >
                  Simulation Passed
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748B",
                  }}
                >
                  Fix applied. 1 credit deducted.
                </div>
              </div>
            </div>
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <XCircle size={20} color="#EF4444" />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#EF4444",
                  }}
                >
                  Simulation Failed
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748B",
                  }}
                >
                  Rejected. Zero credits charged.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Guarantee Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass border-animate"
              style={{ borderRadius: 16, padding: "24px 24px" }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  fontWeight: 700,
                  color: "#10B981",
                  fontSize: "0.9rem",
                }}
              >
                {g.icon}
              </div>
              <h4
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#E2E8F0",
                  marginBottom: 8,
                }}
              >
                {g.title}
              </h4>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  color: "#64748B",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {g.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
