import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Aegis — Enterprise Security. Zero Breakage. One Click.",
  description:
    "Aegis is the AI-powered cyber remediation platform that automatically fixes your vulnerabilities without breaking your systems. Free scanner, AI credits, 24/7 human SOC backing.",
  keywords:
    "cybersecurity, AI remediation, vulnerability scanner, zero breakage, SOC, enterprise security",
  openGraph: {
    title: "Aegis — Enterprise Security. Zero Breakage. One Click.",
    description:
      "AI-powered cyber remediation. Free scanner. One-click fixes. Zero breakage guaranteed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

