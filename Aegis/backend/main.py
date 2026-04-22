"""
Aegis Platform — FastAPI Backend
Entry point: main.py
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import create_tables
from routers import auth, scans, remediation, billing, soc, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title="Aegis API",
    description="Zero-Breakage AI Cyber Remediation Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/auth",      tags=["Auth"])
app.include_router(scans.router,       prefix="/scans",     tags=["Scanner"])
app.include_router(remediation.router, prefix="/remediate", tags=["Remediation"])
app.include_router(billing.router,     prefix="/billing",   tags=["Billing"])
app.include_router(soc.router,         prefix="/soc",       tags=["SOC"])
app.include_router(admin.router,       prefix="/admin",     tags=["Admin"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "online", "service": "Aegis API", "version": "1.0.0"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
