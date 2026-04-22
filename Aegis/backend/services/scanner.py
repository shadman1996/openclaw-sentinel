"""Scanner service — simulates a real network scan.
In production: wrap nmap / masscan / OpenClaw agent.
"""
import random
from typing import List, Dict

CVE_DB: List[Dict] = [
    {"cve":"CVE-2024-3400","title":"PAN-OS Remote Code Execution","severity":"critical","port":443,"service":"HTTPS","desc":"Critical RCE vulnerability in Palo Alto Networks PAN-OS GlobalProtect feature."},
    {"cve":"CVE-2023-44487","title":"HTTP/2 Rapid Reset Attack (DoS)","severity":"high","port":443,"service":"HTTPS","desc":"Denial of service via HTTP/2 stream cancellation flood."},
    {"cve":"CVE-2023-4966","title":"Citrix Bleed — NetScaler Info Leak","severity":"critical","port":443,"service":"HTTPS","desc":"Sensitive information disclosure before authentication in Citrix NetScaler."},
    {"cve":"","title":"SSH Root Login Enabled","severity":"high","port":22,"service":"SSH","desc":"Server allows direct root login over SSH. Brute-force risk."},
    {"cve":"","title":"Telnet Service Exposed","severity":"critical","port":23,"service":"Telnet","desc":"Plaintext legacy protocol. Credentials transmitted unencrypted."},
    {"cve":"","title":"SMB Port 445 Public-Facing","severity":"critical","port":445,"service":"SMB","desc":"Windows file-sharing exposed to internet. EternalBlue risk."},
    {"cve":"CVE-2021-44228","title":"Log4Shell RCE","severity":"critical","port":8080,"service":"HTTP","desc":"JNDI injection in Log4j library allows unauthenticated RCE."},
    {"cve":"","title":"MongoDB Exposed on 0.0.0.0","severity":"high","port":27017,"service":"MongoDB","desc":"Database port publicly accessible with no authentication required."},
    {"cve":"","title":"Weak TLS 1.0 in Use","severity":"medium","port":443,"service":"HTTPS","desc":"TLS 1.0 is deprecated and vulnerable to POODLE/BEAST attacks."},
    {"cve":"","title":"Redis No-Auth Exposed","severity":"high","port":6379,"service":"Redis","desc":"Redis server reachable without password. Arbitrary data injection possible."},
    {"cve":"","title":"RDP Port 3389 Exposed","severity":"high","port":3389,"service":"RDP","desc":"Remote Desktop publicly accessible. Credential stuffing and BlueKeep risk."},
    {"cve":"","title":"Outdated OpenSSL Version","severity":"medium","port":443,"service":"HTTPS","desc":"Server runs OpenSSL < 3.0 with known vulnerabilities."},
    {"cve":"","title":"Open DNS Resolver","severity":"medium","port":53,"service":"DNS","desc":"DNS server allows recursive queries from any host. Amplification DDoS risk."},
    {"cve":"","title":"FTP Anonymous Login Enabled","severity":"medium","port":21,"service":"FTP","desc":"FTP server allows anonymous access. Data exfiltration risk."},
    {"cve":"","title":"SNMP v1/v2 with Default Community","severity":"medium","port":161,"service":"SNMP","desc":"SNMP using default 'public' community string. Network topology disclosure."},
]

SEVERITY_WEIGHT = {"critical": 0.15, "high": 0.30, "medium": 0.35, "low": 0.20}

def run_scan(target: str) -> List[Dict]:
    """Simulate a scan. Returns a list of vulnerability dicts."""
    random.seed(target)  # deterministic per target for demo consistency
    count = random.randint(0, 7)
    if count == 0:
        return []
    selected = random.sample(CVE_DB, min(count, len(CVE_DB)))
    return selected

def classify_complexity(vuln: Dict) -> int:
    """Returns credit cost: 1 standard, 3 complex."""
    if vuln["severity"] == "critical":
        return 3
    return 1
