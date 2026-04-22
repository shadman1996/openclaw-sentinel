"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Zap, User } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Zero-Breakage", href: "#zero-breakage" },
  { label: "SOC Team", href: "#soc-team" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "0 24px",
          transition: "all 0.3s ease",
          background: scrolled
            ? "rgba(5, 10, 20, 0.9)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(0,216,255,0.1)"
            : "1px solid transparent",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #00D8FF, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} color="#050A14" strokeWidth={2.5} />
            </motion.div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "1.35rem",
                background: "linear-gradient(135deg, #00D8FF, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              AEGIS
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div
            style={{
              display: "flex",
              gap: 36,
              alignItems: "center",
            }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  color: "#94A3B8",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#00D8FF")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "#94A3B8")
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Mobile Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/scan"
              className="btn-primary hidden-mobile"
              style={{ fontSize: "0.875rem", padding: "10px 24px" }}
            >
              <Zap size={16} />
              Free Scan
            </Link>
            <Link
              href="/login"
              className="hidden-mobile"
              style={{ fontSize: "0.875rem", padding: "10px 16px", color: "#94A3B8", textDecoration: "none", fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: "color 0.2s" }}
            >
              Log In
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#00D8FF",
                padding: 4,
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 72,
              left: 0,
              right: 0,
              zIndex: 999,
              background: "rgba(5, 10, 20, 0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,216,255,0.15)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  textDecoration: "none",
                  color: "#E2E8F0",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                {link.label}
              </a>
            ))}
            <Link href="/scan" className="btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
              <Zap size={16} />
              Run Free Security Scan
            </Link>
            <Link href="/login" style={{ textAlign: "center", textDecoration: "none", color: "#94A3B8", fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "1rem" }}>
              Log In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
