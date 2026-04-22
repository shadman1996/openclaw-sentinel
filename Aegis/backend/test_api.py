#!/usr/bin/env python3
"""
Aegis Backend -- Quick test script
Runs without pytest. Just: python test_api.py
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import requests, json

BASE = "http://localhost:8000"
E    = "tester@aegis.io"
P    = "TestPass123!"
TOKEN = ""

def ok(label, r, expected=200):
    status = "✅" if r.status_code in ([expected] if isinstance(expected,int) else expected) else "❌"
    print(f"{status} {label} [{r.status_code}]")
    if status == "❌": print("   ", r.text[:200])
    return r

def h():
    return {"Authorization": f"Bearer {TOKEN}"}

print("\n═══════════ Aegis API Test Suite ═══════════\n")

# 1. Health
ok("Health check",    requests.get(f"{BASE}/health"))
ok("Root endpoint",   requests.get(f"{BASE}/"))

# 2. Auth
r = ok("Register new user", requests.post(f"{BASE}/auth/register",
    json={"email":E,"password":P,"full_name":"Test User","company":"Test Corp"}), [200,201,409])
if r.status_code in (200,201):
    TOKEN = r.json()["access_token"]
    print(f"   Token: {TOKEN[:40]}...")
    print(f"   Welcome credits: {r.json()['credits']}")

if not TOKEN:
    r = ok("Login (existing)", requests.post(f"{BASE}/auth/login",
        data={"username":E,"password":P}))
    TOKEN = r.json().get("access_token","")

ok("Get /auth/me",    requests.get(f"{BASE}/auth/me", headers=h()))

# 3. Free scanner (no auth)
print("\n── Scanner ──")
r = ok("Run free scan (scanme.nmap.org)", requests.post(f"{BASE}/scans/run",
    json={"target":"scanme.nmap.org"}), 201)
scan_id = r.json().get("scan_id","")
vuln_count = r.json().get("vuln_count", 0)
print(f"   Scan ID: {scan_id}")
print(f"   Vulns found: {vuln_count}")

if scan_id:
    r2 = ok(f"Fetch scan {scan_id}", requests.get(f"{BASE}/scans/{scan_id}"))
    vulns = r2.json().get("vulnerabilities",[])
    if vulns:
        print(f"   First vuln: [{vulns[0]['severity'].upper()}] {vulns[0]['title']} — {vulns[0]['credit_cost']} credit(s)")
        vuln_id = vulns[0]["id"]
    else:
        print("   (Clean scan — no vulnerabilities)")
        vuln_id = None

# 4. Billing
print("\n── Billing ──")
ok("Get credit balance", requests.get(f"{BASE}/billing/balance", headers=h()))
r = ok("Buy PAYG 10 credits (dev mode)", requests.post(f"{BASE}/billing/checkout",
    json={"plan_id":"payg_10"}, headers=h()))
print(f"   {r.json().get('message','')}")
ok("Balance after purchase", requests.get(f"{BASE}/billing/balance", headers=h()))

# 5. Remediation
print("\n── Remediation ──")
if vuln_id:
    r = ok("Trigger AI fix", requests.post(f"{BASE}/remediate/{vuln_id}", headers=h()), [200,202])
    job_id = r.json().get("job_id","")
    print(f"   Job ID: {job_id}, Cost: {r.json().get('credit_cost')} credit(s)")
    if job_id:
        import time; time.sleep(2)
        r2 = ok("Poll job status", requests.get(f"{BASE}/remediate/{job_id}/status", headers=h()))
        print(f"   Status: {r2.json().get('status')} — {r2.json().get('sim_result','')}")

# 6. SOC escalation
print("\n── SOC ──")
# Run another scan to get a fresh vuln for escalation
r3 = requests.post(f"{BASE}/scans/run", json={"target":"10.99.99.1"})
soc_vuln_id = None
if r3.status_code == 201:
    data = requests.get(f"{BASE}/scans/{r3.json()['scan_id']}").json()
    soc_vulns = data.get("vulnerabilities",[])
    if soc_vulns: soc_vuln_id = soc_vulns[0]["id"]

if soc_vuln_id:
    ok("SOC escalation (50 credits)", requests.post(
        f"{BASE}/soc/escalate/{soc_vuln_id}", headers=h()), [200,201,402])

print("\n═══════════ Test Complete ═══════════\n")
