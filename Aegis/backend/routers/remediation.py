"""Remediation router — AI fix generation + Zero-Breakage simulation"""
import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Vulnerability, RemediationJob, User, CreditLedger
from routers.auth import get_current_user
from services.ai_engine import generate_fix
from services.simulator import simulate
from services.scanner import classify_complexity

router = APIRouter()

# ── POST /remediate/{vuln_id} — trigger AI fix ──────────────────────────────
@router.post("/{vuln_id}", status_code=202)
async def start_remediation(
    vuln_id: str,
    bg: BackgroundTasks,
    user: User = Depends(get_current_user),
    db:   Session = Depends(get_db),
):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    if vuln.remediated:
        raise HTTPException(status_code=409, detail="Already remediated")

    credit_cost = classify_complexity({"severity": vuln.severity})
    if user.credits < credit_cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Need {credit_cost}, have {user.credits}."
        )

    job = RemediationJob(vuln_id=vuln_id, user_id=user.id,
                         status="pending", credits_used=credit_cost)
    db.add(job); db.commit(); db.refresh(job)

    # Run async in background
    bg.add_task(_run_job, job.id)
    return {"job_id": job.id, "status": "pending",
            "credit_cost": credit_cost, "message": "Remediation job queued"}

async def _run_job(job_id: str):
    """Background task: generate fix → simulate → update status."""
    from db.database import SessionLocal
    db = SessionLocal()
    try:
        job  = db.query(RemediationJob).filter(RemediationJob.id == job_id).first()
        vuln = job.vuln
        user = db.query(User).filter(User.id == job.user_id).first()

        job.status = "simulating"; db.commit()

        # 1. Generate fix script
        script = await generate_fix(vuln.title, vuln.description, vuln.severity)
        job.fix_script = script; db.commit()

        # 2. Simulate
        passed, summary, stages = simulate(script, vuln.title)
        job.sim_result = summary

        if passed:
            # Deduct credits
            user.credits -= job.credits_used
            ledger = CreditLedger(user_id=user.id, amount=-job.credits_used,
                                   reason="ai_fix")
            db.add(ledger)
            vuln.remediated = True
            job.status = "applied"
        else:
            job.status = "rejected"
            job.credits_used = 0   # no charge on rejection

        db.commit()
    except Exception as e:
        db.rollback()
        job = db.query(RemediationJob).filter(RemediationJob.id == job_id).first()
        if job: job.status = "failed"; job.sim_result = str(e); db.commit()
    finally:
        db.close()

# ── GET /remediate/{job_id}/status ──────────────────────────────────────────
@router.get("/{job_id}/status")
def job_status(job_id: str, user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    job = db.query(RemediationJob).filter(
        RemediationJob.id == job_id,
        RemediationJob.user_id == user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id, "status": job.status,
        "sim_result": job.sim_result, "credits_used": job.credits_used,
        "fix_script": job.fix_script if job.status == "applied" else None,
        "updated_at": job.updated_at,
    }
