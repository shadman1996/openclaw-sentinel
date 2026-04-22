# Aegis Security Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

Aegis is a production-ready, unified cybersecurity SaaS platform designed for automated threat scanning, intelligent remediation, and enterprise-grade security management.

## 💡 What is Aegis?
Aegis is an end-to-end Vulnerability Management and Remediation platform. Unlike traditional scanners that only report issues, Aegis provides a closed-loop system to **find, verify, and fix** security threats in real-time.

### The Aegis Workflow:
1.  **Automated Discovery**: Our scanning engine performs deep-interrogation of targets to identify vulnerabilities (SQLi, XSS, RCE, SSRF, etc.).
2.  **Agentic AI Remediation**: For every found threat, an intelligent security agent analyzes the context and generates production-ready remediation code or configuration patches.
3.  **One-Click Fix**: Authorized users can apply these AI-generated fixes directly from the dashboard, significantly reducing the Mean Time to Repair (MTTR).
4.  **Human SOC Escalation**: For high-risk or complex scenarios, Aegis provides an instant bridge to a Human Security Operations Center (SOC) for manual intervention and expert guidance.

## 🌟 Key Features

### 🔐 Security & Orchestration
- **Vulnerability Scanner**: High-performance domain and IP scanning engine.
- **AI Remediation**: Automated "AI Fix" generation using agentic security workflows.
- **SOC Escalation**: Human-in-the-loop escalation for critical vulnerabilities.

### 🏢 SaaS Infrastructure
- **Dual-Panel Architecture**:
  - **Client Admin**: Glassmorphic dashboard for managing scans and billing.
  - **Super Admin**: Developer console for user auditing, credit refunds, and platform config.
- **Credit Economy**: Built-in ledger system for tracking consumption and manual refunds.
- **Auth & Identity**: JWT-based security with OTP-powered password recovery.

## ⚙️ Technical Implementation Details

### 🏗 Backend Architecture (FastAPI)
The backend is organized into modular routers and specialized services:

#### **Core Routers**
- **`auth.py`**: Handles JWT session management, registration (auto-admin for first user), profile updates, and a multi-stage OTP password reset flow.
- **`billing.py`**: Manages the credit-based economy. Supports Stripe Checkout sessions and a "Dev-Mode" bypass that grants credits immediately.
- **`admin.py`**: Exclusive endpoints for Super Admins to audit users, modify account tiers, and issue manual credit refunds with ledger entries.
- **`scans.py`**: Orchestrates the vulnerability discovery lifecycle, from target validation to result persistence.
- **`remediation.py`**: Bridges findings to the AI engine to generate and track fix implementation "jobs."
- **`soc.py`**: Manages escalation tickets, bridging automated results to human-readable requests.

#### **Engine Services**
- **`scanner.py`**: A high-concurrency simulation engine that mimics real-world network probes (SQLi, XSS, etc.) and calculates risk scores.
- **`ai_engine.py`**: Generates intelligent remediation plans based on vulnerability context using agentic logic.
- **`simulator.py`**: Provides mocked telemetry and scan behavior for development without requiring live target infrastructure.

### 💻 Frontend Architecture (Next.js)
The frontend uses a unified design system with shared logic for the dual-dashboard experience:

- **Auth Providers**: Centralized context for JWT session persistence and permission gating.
- **API Client**: A unified `api.ts` wrapper with error handling and request/response interceptors for the entire SaaS suite.
- **Super Admin Console**: A highly reactive management panel with:
  - User search/filtering logic.
  - Transaction Ledger modals with real-time data fetching.
  - Platform-wide statistics visualization via Recharts.
- **Client Settings**: Secure self-service profile and password management components.

## 🛠 Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic.
- **Frontend**: Next.js 14, Lucide Icons, Recharts, Tailwind CSS.
- **Payments**: Stripe (Stripe-CLI supported for local testing).

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### 1. Backend Setup
```bash
cd Aegis/backend
pip install -r requirements.txt
# Copy environment variables
cp .env.example .env
# Start the server
python main.py
```
Default API: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd marketing-site
npm install
npm run dev
```
Default URL: `http://localhost:3000`

## 📊 API Documentation
Once the backend is running, you can access the interactive API docs:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🛡 Security & Admin Access
The **Super Admin** panel is protected via the `require_admin` dependency. 
- To grant admin access to a user, update the `is_admin` column to `True` in the `aegis.db` (SQLite).
- The first user registered in dev-mode is granted admin rights by default for easier setup.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
