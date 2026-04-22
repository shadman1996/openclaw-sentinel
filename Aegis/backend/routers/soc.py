"""SOC escalation router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from db.models import User, Ticket, Vulnerability, CreditLedger
from routers.auth import get_current_user, require_admin

router = APIRouter()

SOC_COST = 50

ASSIGNEES = ["Rafi A.", "Imran H.", "Sakib M.", "Nayeem R."]
_assignee_idx = 0

def next_assignee():
    global _assignee_idx
    a = ASSIGNEES[_assignee_idx % len(ASSIGNEES)]
    _assignee_idx += 1
    return a

class TicketUpdate(BaseModel):
    status:   Optional[str] = None   # open | in_progress | resolved
    assignee: Optional[str] = None

# ── POST /soc/escalate/{vuln_id} ─────────────────────────────────────────────
@router.post("/escalate/{vuln_id}", status_code=201)
def escalate(vuln_id: str, user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    if user.credits < SOC_COST:
        raise HTTPException(status_code=402,
                            detail=f"Need {SOC_COST} credits for SOC escalation. Have {user.credits}.")

    # Deduct credits
    user.credits -= SOC_COST
    ledger = CreditLedger(user_id=user.id, amount=-SOC_COST, reason="soc_escalation")
    db.add(ledger)

    ticket = Ticket(
        user_id=user.id, vuln_id=vuln_id,
        issue=f"{vuln.title} — {vuln.description[:120]}",
        priority="critical" if vuln.severity == "critical" else "high",
        assignee=next_assignee(),
        sla_hours=2 if vuln.severity == "critical" else 4,
        credits_used=SOC_COST,
    )
    db.add(ticket); db.commit(); db.refresh(ticket)

    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "assignee": ticket.assignee,
        "sla_hours": ticket.sla_hours,
        "credits_used": SOC_COST,
        "new_credit_balance": user.credits,
        "message": f"SOC ticket created. Analyst {ticket.assignee} assigned. Response within {ticket.sla_hours}h.",
    }

# ── GET /soc/tickets — admin only ────────────────────────────────────────────
@router.get("/tickets")
def list_tickets(user: User = Depends(require_admin), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    return [{"id": t.id, "user_id": t.user_id, "issue": t.issue,
              "priority": t.priority, "status": t.status,
              "assignee": t.assignee, "sla_hours": t.sla_hours,
              "created_at": t.created_at, "updated_at": t.updated_at} for t in tickets]

# ── PATCH /soc/tickets/{ticket_id} — admin only ──────────────────────────────
@router.patch("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, update: TicketUpdate,
                  user: User = Depends(require_admin),
                  db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if update.status:   ticket.status   = update.status
    if update.assignee: ticket.assignee = update.assignee
    db.commit(); db.refresh(ticket)
    return {"id": ticket.id, "status": ticket.status, "assignee": ticket.assignee}
