"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Clock, Globe2, MessageSquare, Ticket, HeartHandshake } from "lucide-react";

const socStats = [
  { icon: Clock,   value: "< 15 min", label: "Average Response Time" },
  { icon: Globe2,  value: "24/7/365", label: "Always Online" },
  { icon: Users,   value: "50+ Analysts", label: "Dedicated SOC Team" },
  { icon: Ticket,  value: "50 Credits", label: "Per Escalation" },
];

const escalationSteps = [
  {
    step: "01",
    title: "Click 'Escalate to SOC'",
    desc: "On any vulnerability in your report, one click opens a priority ticket. Costs 50 credits.",
  },
  {
    step: "02",
    title: "Instant Ticket Creation",
    desc: "Your case is immediately routed to our Bangladesh SOC team with full context from the scan.",
  },
  {
    step: "03",
    title: "Human Expert Assigned",
    desc: "A senior analyst reviews your environment manually and crafts a custom remediation plan.",
  },
  {
    step: "04",
    title: "Resolution & Report",
    desc: "You receive a full resolution report with root cause analysis and hardening recommendations.",
  },
];

export default function SOCBacking() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="soc-team"
      className="section-pad"
      ref={ref}
      style={{ background: "var(--aegis-bg)" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
              background: "rgba(0,216,255,0.1)",
              border: "1px solid rgba(0,216,255,0.25)",
              marginBottom: 16,
            }}
          >
            <HeartHandshake size={14} color="#00D8FF" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#00D8FF",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              24/7 Human SOC Backing
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
            AI handles the routine.{" "}
            <span className="gradient-text-cyan">Humans handle the hard stuff.</span>
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
            Our dedicated Security Operations Center in Dhaka, Bangladesh is staffed
            around the clock. When AI reaches its limits, a real analyst is on your
            case within minutes — not hours.
          </p>
        </motion.div>

        {/* SOC Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {socStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass border-animate"
                style={{
                  borderRadius: 16,
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(0,216,255,0.1)",
                    border: "1px solid rgba(0,216,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Icon size={20} color="#00D8FF" />
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "#00D8FF",
                    marginBottom: 6,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Escalation Flow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="glass"
          style={{ borderRadius: 24, padding: "40px 40px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <MessageSquare size={20} color="#8B5CF6" />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#E2E8F0",
              }}
            >
              How Escalation Works
            </span>
            <span
              style={{
                marginLeft: "auto",
                padding: "4px 12px",
                borderRadius: 999,
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#8B5CF6",
              }}
            >
              50 Credits
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {escalationSteps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#8B5CF6",
                    letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}
                >
                  STEP {s.step}
                </div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#F1F5F9",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
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
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
