"""Scanner router — free scans, no auth required"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from db.models import Scan, Vulnerability
from services.scanner import run_scan, classify_complexity
from routers.auth import get_current_user
from db.models import User

router = APIRouter()

class ScanRequest(BaseModel):
    target: str
    user_id: Optional[str] = None  # optional — anonymous scans allowed

# ── POST /scans/run — FREE, no auth ─────────────────────────────────────────
@router.post("/run", status_code=201)
def run_free_scan(req: ScanRequest, db: Session = Depends(get_db)):
    """Run a free network scan. No account required."""
    target = req.target.strip()
    if not target:
        raise HTTPException(status_code=422, detail="Target is required")

    scan = Scan(target=target, user_id=req.user_id, status="running")
    db.add(scan); db.flush()

    raw_vulns = run_scan(target)
    for v in raw_vulns:
        vuln = Vulnerability(
            scan_id=scan.id, cve_id=v.get("cve",""),
            title=v["title"], description=v["desc"],
            severity=v["severity"], port=v.get("port"),
            service=v.get("service",""),
        )
        db.add(vuln)

    scan.status = "complete"
    db.commit(); db.refresh(scan)

    return {
        "scan_id": scan.id,
        "target": scan.target,
        "status": scan.status,
        "vuln_count": len(raw_vulns),
        "created_at": scan.created_at,
    }

# ── GET /scans/{scan_id} — public ───────────────────────────────────────────
@router.get("/{scan_id}")
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    vulns = []
    for v in scan.vulns:
        vulns.append({
            "id": v.id, "title": v.title, "description": v.description,
            "cve_id": v.cve_id, "severity": v.severity, "port": v.port,
            "service": v.service, "remediated": v.remediated,
            "credit_cost": classify_complexity({"severity": v.severity}),
        })
    return {
        "scan_id": scan.id, "target": scan.target, "status": scan.status,
        "created_at": scan.created_at,
        "vulnerabilities": sorted(vulns, key=lambda x: ["critical","high","medium","low","info"].index(x["severity"])),
    }

# ── GET /scans/ — user's scans (auth required) ──────────────────────────────
@router.get("/")
def list_scans(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.user_id == user.id).order_by(Scan.created_at.desc()).limit(50).all()
    return [{"scan_id": s.id, "target": s.target, "status": s.status,
             "vuln_count": len(s.vulns), "created_at": s.created_at} for s in scans]
