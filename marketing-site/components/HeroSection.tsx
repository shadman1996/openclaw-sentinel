"use client";

import { motion } from "framer-motion";
import { Zap, ChevronRight, Play, Shield } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "99.97%", label: "Zero-Breakage Rate" },
  { value: "<3min", label: "Avg. Remediation Time" },
  { value: "24/7", label: "Human SOC Backing" },
  { value: "Free", label: "Network Scanner" },
];

export default function HeroSection() {
  return (
    <section
      className="hero-bg mesh-grid"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 120,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating orbs */}
      <div
        className="animate-float"
        style={{
          position: "absolute",
          top: "15%",
          left: "8%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,216,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="animate-float"
        style={{
          position: "absolute",
          bottom: "20%",
          right: "6%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animationDelay: "2s",
        }}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(0,216,255,0.08)",
            border: "1px solid rgba(0,216,255,0.25)",
            marginBottom: 28,
          }}
        >
          <div
            className="animate-pulse-glow"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00D8FF",
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#00D8FF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI-Powered · Zero Breakage · Always Free to Scan
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.6rem, 6vw, 5rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#F1F5F9",
            marginBottom: 24,
          }}
        >
          Enterprise Security.{" "}
          <span className="gradient-text-cyan text-glow-cyan">
            Zero Breakage.
          </span>{" "}
          One Click.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 400,
            color: "#94A3B8",
            lineHeight: 1.7,
            maxWidth: 640,
            margin: "0 auto 40px",
          }}
        >
          Run a{" "}
          <strong style={{ color: "#E2E8F0", fontWeight: 600 }}>
            100% free network and cloud vulnerability scan
          </strong>
          . Get a plain-English report. Then let our AI automatically fix every
          issue — simulated first, applied only when safe. Backed by our 24/7
          human SOC team in case things get complex.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 64,
          }}
        >
          <Link
            href="/scan"
            className="btn-primary glow-cyan"
            id="hero-cta-free-scan"
          >
            <Zap size={20} />
            Run Free Security Scan
            <ChevronRight size={18} />
          </Link>

          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary"
            id="hero-cta-how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Play size={16} />
            See How It Works
          </motion.a>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 1,
            maxWidth: 700,
            margin: "0 auto",
            background: "rgba(0,216,255,0.08)",
            borderRadius: 16,
            border: "1px solid rgba(0,216,255,0.15)",
            overflow: "hidden",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              style={{
                padding: "20px 16px",
                textAlign: "center",
                borderRight:
                  i < stats.length - 1
                    ? "1px solid rgba(0,216,255,0.1)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "#00D8FF",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.78rem",
                  color: "#64748B",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating shield visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, type: "spring" }}
          className="animate-float"
          style={{
            marginTop: 64,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 32,
            background:
              "linear-gradient(135deg, rgba(0,216,255,0.15), rgba(139,92,246,0.15))",
            border: "1px solid rgba(0,216,255,0.2)",
            boxShadow:
              "0 0 40px rgba(0,216,255,0.2), 0 0 80px rgba(139,92,246,0.1)",
          }}
        >
          <Shield size={56} color="#00D8FF" strokeWidth={1.5} />
        </motion.div>
      </div>
    </section>
  );
}
