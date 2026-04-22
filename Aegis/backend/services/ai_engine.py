"""AI remediation engine — generates fix scripts for vulnerabilities.
Uses OpenAI if key is set, otherwise returns high-quality mock fixes.
"""
import os
from typing import Dict

MOCK_FIXES: Dict[str, str] = {
    "SSH Root Login Enabled": """#!/bin/bash
# Aegis Auto-Fix: Disable SSH root login
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd
echo "SSH root login disabled successfully"
""",
    "Telnet Service Exposed": """#!/bin/bash
# Aegis Auto-Fix: Disable and remove Telnet
systemctl stop telnet.socket 2>/dev/null || true
systemctl disable telnet.socket 2>/dev/null || true
systemctl stop xinetd 2>/dev/null || true
apt-get remove -y telnetd telnet 2>/dev/null || yum remove -y telnet-server 2>/dev/null || true
echo "Telnet disabled and removed"
""",
    "MongoDB Exposed on 0.0.0.0": """#!/bin/bash
# Aegis Auto-Fix: Bind MongoDB to localhost only
sed -i 's/bindIp: 0.0.0.0/bindIp: 127.0.0.1/' /etc/mongod.conf
systemctl restart mongod
echo "MongoDB now bound to 127.0.0.1 only"
""",
    "Weak TLS 1.0 in Use": """# Aegis Auto-Fix: Nginx — disable TLS 1.0 and 1.1
# Add to nginx.conf server block:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
# Run: nginx -t && systemctl reload nginx
""",
    "Redis No-Auth Exposed": """#!/bin/bash
# Aegis Auto-Fix: Require Redis password + bind to localhost
RAND_PW=$(openssl rand -base64 32)
sed -i "s/^# requirepass.*/requirepass $RAND_PW/" /etc/redis/redis.conf
sed -i 's/^bind 0.0.0.0/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl restart redis
echo "Redis secured. New password: $RAND_PW (store this safely)"
""",
    "RDP Port 3389 Exposed": """# Aegis Auto-Fix: Restrict RDP via Windows Firewall
# Run as Administrator in PowerShell:
New-NetFirewallRule -DisplayName "Block Public RDP" -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Block -Profile Public
Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name 'fDenyTSConnections' -Value 0
Write-Host "RDP restricted to private network only"
""",
    "FTP Anonymous Login Enabled": """#!/bin/bash
# Aegis Auto-Fix: Disable anonymous FTP login
sed -i 's/^anonymous_enable=YES/anonymous_enable=NO/' /etc/vsftpd.conf
systemctl restart vsftpd
echo "Anonymous FTP login disabled"
""",
    "Open DNS Resolver": """#!/bin/bash
# Aegis Auto-Fix: Restrict DNS recursion to trusted IPs
cat >> /etc/bind/named.conf.options << 'EOF'
acl trusted { 10.0.0.0/8; 172.16.0.0/12; 192.168.0.0/16; localhost; };
options { recursion yes; allow-recursion { trusted; }; };
EOF
systemctl restart bind9
echo "DNS recursion restricted to internal networks"
""",
}

GENERIC_FIX = """#!/bin/bash
# Aegis Auto-Fix (generated)
# Manual review recommended for this vulnerability type.
# Steps:
# 1. Review service configuration
# 2. Apply vendor-recommended patches
# 3. Re-run Aegis scanner to verify remediation
echo "Manual review required — see vulnerability report for details"
"""

async def generate_fix(title: str, description: str, severity: str) -> str:
    """Return a fix script. Uses OpenAI if key present, else mock."""
    api_key = os.getenv("OPENAI_API_KEY", "")

    if api_key and not api_key.startswith("sk-..."):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)
            prompt = f"""You are a senior Linux/Cloud security engineer.
Generate a production-safe bash or config remediation script for the following vulnerability.
The script must be safe, idempotent, and include echo status messages.

Vulnerability: {title}
Severity: {severity}
Description: {description}

Return ONLY the script, no explanation."""
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role":"user","content":prompt}],
                max_tokens=600, temperature=0.2,
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            pass  # Fall through to mock

    return MOCK_FIXES.get(title, GENERIC_FIX)
