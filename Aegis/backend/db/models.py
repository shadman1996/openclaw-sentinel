from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone
import uuid

Base = declarative_base()

def new_id(): return str(uuid.uuid4())
def now():    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id            = Column(String, primary_key=True, default=new_id)
    email         = Column(String, unique=True, nullable=False, index=True)
    hashed_pw     = Column(String, nullable=False)
    full_name     = Column(String, default="")
    company       = Column(String, default="")
    plan          = Column(String, default="free")      # free | starter | pro | enterprise
    is_admin      = Column(Boolean, default=False)
    credits       = Column(Integer, default=0)
    otp           = Column(String, nullable=True)
    otp_expiry    = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=now)
    scans         = relationship("Scan",    back_populates="user", cascade="all, delete")
    tickets       = relationship("Ticket",  back_populates="user", cascade="all, delete")
    ledger        = relationship("CreditLedger", back_populates="user", cascade="all, delete")

class Scan(Base):
    __tablename__ = "scans"
    id            = Column(String, primary_key=True, default=new_id)
    user_id       = Column(String, ForeignKey("users.id"), nullable=True)  # nullable = free/anon scan
    target        = Column(String, nullable=False)
    status        = Column(String, default="running")   # running | complete | failed
    created_at    = Column(DateTime, default=now)
    user          = relationship("User", back_populates="scans")
    vulns         = relationship("Vulnerability", back_populates="scan", cascade="all, delete")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id            = Column(String, primary_key=True, default=new_id)
    scan_id       = Column(String, ForeignKey("scans.id"), nullable=False)
    cve_id        = Column(String, default="")
    title         = Column(String, nullable=False)
    description   = Column(Text,   default="")
    severity      = Column(String, default="info")      # critical | high | medium | low | info
    port          = Column(Integer, nullable=True)
    service       = Column(String, default="")
    remediated    = Column(Boolean, default=False)
    scan          = relationship("Scan", back_populates="vulns")
    jobs          = relationship("RemediationJob", back_populates="vuln", cascade="all, delete")

class RemediationJob(Base):
    __tablename__ = "remediation_jobs"
    id            = Column(String, primary_key=True, default=new_id)
    vuln_id       = Column(String, ForeignKey("vulnerabilities.id"), nullable=False)
    user_id       = Column(String, ForeignKey("users.id"), nullable=False)
    status        = Column(String, default="pending")   # pending | simulating | approved | rejected | applied | failed
    fix_script    = Column(Text,   default="")
    sim_result    = Column(Text,   default="")
    credits_used  = Column(Integer, default=0)
    created_at    = Column(DateTime, default=now)
    updated_at    = Column(DateTime, default=now, onupdate=now)
    vuln          = relationship("Vulnerability", back_populates="jobs")

class Ticket(Base):
    __tablename__ = "soc_tickets"
    id            = Column(String, primary_key=True, default=new_id)
    user_id       = Column(String, ForeignKey("users.id"), nullable=False)
    vuln_id       = Column(String, ForeignKey("vulnerabilities.id"), nullable=True)
    issue         = Column(Text,   nullable=False)
    priority      = Column(String, default="high")
    status        = Column(String, default="open")      # open | in_progress | resolved
    assignee      = Column(String, default="Auto-assigned")
    sla_hours     = Column(Integer, default=4)
    credits_used  = Column(Integer, default=50)
    created_at    = Column(DateTime, default=now)
    updated_at    = Column(DateTime, default=now, onupdate=now)
    user          = relationship("User", back_populates="tickets")

class CreditLedger(Base):
    __tablename__ = "credit_ledger"
    id            = Column(String, primary_key=True, default=new_id)
    user_id       = Column(String, ForeignKey("users.id"), nullable=False)
    amount        = Column(Integer, nullable=False)     # positive = purchase, negative = spend
    reason        = Column(String, nullable=False)      # "purchase_payg" | "ai_fix" | "soc_escalation" | "plan_monthly"
    stripe_ref    = Column(String, default="")
    created_at    = Column(DateTime, default=now)
    user          = relationship("User", back_populates="ledger")
