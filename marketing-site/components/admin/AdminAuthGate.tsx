"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "aegis_admin_session";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      router.replace("/admin");
    } else {
      setVerified(true);
    }
  }, [router]);

  if (!verified) {
    // Show nothing while redirecting (avoids flash)
    return (
      <div style={{
        minHeight: "100vh", background: "#030710",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2px solid rgba(0,216,255,0.2)",
          borderTopColor: "#00D8FF",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
