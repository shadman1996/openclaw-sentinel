"""Admin stats router — protected, admin JWT only"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import get_db
from db.models import User, Scan, Vulnerability, RemediationJob, Ticket, CreditLedger
from routers.auth import require_admin

router = APIRouter()

@router.get("/stats")
def platform_stats(user=Depends(require_admin), db: Session = Depends(get_db)):
    total_users   = db.query(func.count(User.id)).scalar()
    total_scans   = db.query(func.count(Scan.id)).scalar()
    total_vulns   = db.query(func.count(Vulnerability.id)).scalar()
    open_tickets  = db.query(func.count(Ticket.id)).filter(Ticket.status != "resolved").scalar()
    credits_spent = db.query(func.sum(CreditLedger.amount)).filter(CreditLedger.amount < 0).scalar() or 0
    credits_sold  = db.query(func.sum(CreditLedger.amount)).filter(CreditLedger.amount > 0).scalar() or 0
    ai_fixes      = db.query(func.count(RemediationJob.id)).filter(RemediationJob.status == "applied").scalar()
    sim_rejected  = db.query(func.count(RemediationJob.id)).filter(RemediationJob.status == "rejected").scalar()

    return {
        "total_users":   total_users,
        "total_scans":   total_scans,
        "total_vulns":   total_vulns,
        "open_tickets":  open_tickets,
        "credits_spent": abs(credits_spent),
        "credits_sold":  credits_sold,
        "ai_fixes":      ai_fixes,
        "sim_rejected":  sim_rejected,
    }

@router.get("/users")
def list_users(user=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "company": u.company,
             "plan": u.plan, "credits": u.credits, "is_admin": u.is_admin, "created_at": u.created_at} for u in users]

@router.get("/scans")
def list_all_scans(user=Depends(require_admin), db: Session = Depends(get_db)):
    scans = db.query(Scan).order_by(Scan.created_at.desc()).limit(200).all()
    results = []
    for s in scans:
        owner = db.query(User).filter(User.id == s.user_id).first()
        vuln_count = db.query(func.count(Vulnerability.id)).filter(Vulnerability.scan_id == s.id).scalar()
        results.append({
            "scan_id": s.id, "target": s.target, "status": s.status,
            "vuln_count": vuln_count,
            "user_email": owner.email if owner else "anonymous",
            "created_at": s.created_at,
        })
    return results

@router.get("/tickets")
def list_all_tickets(user=Depends(require_admin), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(100).all()
    results = []
    for t in tickets:
        owner = db.query(User).filter(User.id == t.user_id).first()
        results.append({
            "id": t.id, "status": t.status, "assignee": t.assignee,
            "sla_hours": t.sla_hours, "notes": t.notes,
            "user_email": owner.email if owner else "unknown",
            "created_at": t.created_at,
        })
    return results

@router.get("/remediation-jobs")
def list_all_jobs(user=Depends(require_admin), db: Session = Depends(get_db)):
    jobs = db.query(RemediationJob).order_by(RemediationJob.created_at.desc()).limit(200).all()
    results = []
    for j in jobs:
        vuln = db.query(Vulnerability).filter(Vulnerability.id == j.vuln_id).first()
        results.append({
            "id": j.id, "status": j.status, "credits_used": j.credits_used,
            "sim_result": j.sim_result, "vuln_title": vuln.title if vuln else "unknown",
            "created_at": j.created_at,
        })
    return results


from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None
    plan: Optional[str] = None
    credits: Optional[int] = None
    is_admin: Optional[bool] = None

class RefundRequest(BaseModel):
    amount: int
    reason: str = "Admin refund"

@router.patch("/users/{user_id}")
def update_user(user_id: str, data: UserUpdate, admin=Depends(require_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        from fastapi import HTTPException
        raise HTTPException(404, "User not found")
    if data.full_name is not None: target.full_name = data.full_name
    if data.company is not None: target.company = data.company
    if data.plan is not None: target.plan = data.plan
    if data.credits is not None: target.credits = data.credits
    if data.is_admin is not None: target.is_admin = data.is_admin
    db.commit()
    return {"ok": True, "email": target.email, "credits": target.credits}

@router.post("/users/{user_id}/refund")
def refund_user(user_id: str, req: RefundRequest, admin=Depends(require_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        from fastapi import HTTPException
        raise HTTPException(404, "User not found")
    if req.amount <= 0:
        from fastapi import HTTPException
        raise HTTPException(400, "Refund amount must be positive")
    target.credits += req.amount
    ledger = CreditLedger(user_id=target.id, amount=req.amount, reason=req.reason)
    db.add(ledger)
    db.commit()
    return {"ok": True, "email": target.email, "new_balance": target.credits, "refunded": req.amount}

@router.get("/users/{user_id}/ledger")
def get_user_ledger(user_id: str, admin=Depends(require_admin), db: Session = Depends(get_db)):
    ledger = db.query(CreditLedger).filter(CreditLedger.user_id == user_id).order_by(CreditLedger.created_at.desc()).all()
    return [{"id": l.id, "amount": l.amount, "reason": l.reason, "created_at": l.created_at, "stripe_ref": l.stripe_ref} for l in ledger]

