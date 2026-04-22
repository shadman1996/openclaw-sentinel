# Aegis Security Platform — Advanced SaaS

Aegis is a production-ready, unified cybersecurity platform designed for automated threat scanning, remediation, and enterprise-grade security management. It bridges the gap between automated tools and human expertise with a seamless credit-based economy.

## 🚀 Key Modules & Architecture

### 1. Dual-Panel Management
- **Client Admin Dashboard**: A high-end, glassmorphic interface for clients to manage their own scans, view security telemetry, purchase credits via Stripe, and escalate critical issues to a Human SOC.
- **Super Admin Console**: A developer-centric powerhouse for platform management. Includes:
  - Real-time user auditing and profile editing.
  - Credit administration with manual refund capabilities.
  - Platform-wide SLA and pricing configuration.
  - Advanced transaction ledgers for financial transparency.

### 2. Autonomous Security Engine
- **Vulnerability Scanner**: High-performance domain and IP scanning with real-time feedback.
- **AI Remediation**: Automated "AI Fix" generation and application using intelligent agentic workflows.
- **SOC Escalation**: One-click bridging to human analysts for high-risk vulnerabilities that AI cannot safely resolve.

### 3. Modern SaaS Features
- **Credit-Based Economy**: Integrated ledger system tracking every credit consumed (scans/fixes) or refunded by admins.
- **Secure Authentication**: JWT-based authentication with OTP-powered password recovery and user profile self-management.
- **Premium Aesthetics**: Built with Next.js and Vanilla CSS for a blistering fast, "Cyber-Dark" premium experience.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Lucide Icons, Recharts (Visualizations).
- **Backend**: FastAPI (Python), SQLAlchemy (ORM).
- **Database**: SQLite (Production-ready local storage with UUID identifiers).
- **Payments**: Stripe Integration (with Dev-Mode bypass for local testing).

## 🚦 Getting Started

### 1. Backend Setup
- Navigate to `Aegis/backend`.
- Install dependencies: `pip install -r requirements.txt`.
- Run the API: `python main.py`.
- The API will be available at `http://localhost:8000`.
- **Note**: The first user registered will be granted Admin privileges by default (controlled in `routers/auth.py`).

### 2. Frontend Setup
- Navigate to `marketing-site`.
- Install dependencies: `npm install`.
- Start the development server: `npm run dev`.
- The dashboard will be available at `http://localhost:3000`.

## 🛡 Security Policy
Super Admin access is strictly enforced via the `require_admin` dependency. Sensitive operations like credit refunds and plan overrides require an active Admin session token.

## 📈 Roadmap
- [x] Super Admin User Management & Refunds
- [x] Client Profile & Password Reset (OTP)
- [x] Integrated Transaction Ledgers
- [ ] Automated HTML-to-PDF Scan Reports
- [ ] Multi-region Network Scanning Nodes
