"""Auth router: /auth/register, /auth/login, /auth/me"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from db.database import get_db
from db.models import User, CreditLedger
from security import hash_password, verify_password, create_token, decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

from typing import Optional
import random
from datetime import timedelta, datetime, timezone

# ── Schemas ──
class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str  = ""
    company:   str  = ""

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      str
    email:        str
    credits:      int
    plan:         str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# ── Dependency: get current user ──
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ── Routes ──
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email      = req.email,
        hashed_pw  = hash_password(req.password),
        full_name  = req.full_name,
        company    = req.company,
        credits    = 3,
        is_admin   = True, # For testing, every user is admin
    )
    db.add(user)
    db.flush()
    bonus = CreditLedger(user_id=user.id, amount=3, reason="welcome_bonus")
    db.add(bonus)
    db.commit()
    db.refresh(user)
    token = create_token({"sub": user.id})
    return TokenResponse(access_token=token, user_id=user.id,
                         email=user.email, credits=user.credits, plan=user.plan)

@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_token({"sub": user.id})
    return TokenResponse(access_token=token, user_id=user.id,
                         email=user.email, credits=user.credits, plan=user.plan)

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "company": user.company, "plan": user.plan,
        "credits": user.credits, "is_admin": user.is_admin,
        "created_at": user.created_at,
    }

@router.patch("/profile")
def update_profile(req: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.full_name is not None: user.full_name = req.full_name
    if req.company is not None: user.company = req.company
    db.commit()
    return {"ok": True, "full_name": user.full_name, "company": user.company}

@router.post("/change-password")
def change_password(req: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(req.current_password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid current password")
    user.hashed_pw = hash_password(req.new_password)
    db.commit()
    return {"ok": True}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"ok": True, "msg": "If account exists, OTP sent"}
    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()
    print(f"\n[EMAIL MOCK] To: {user.email} | Subject: Your OTP | Body: {otp}\n")
    return {"ok": True, "msg": "OTP sent to email (check server console)"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or user.otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    # Manually handle offset-naive vs aware comparison if needed, 
    # but db.models.now uses timezone.utc so user.otp_expiry is aware.
    now_utc = datetime.now(timezone.utc)
    # If user.otp_expiry is naive, we might need to replace tzinfo, but it should be aware.
    expiry = user.otp_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
        
    if expiry < now_utc:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user.hashed_pw = hash_password(req.new_password)
    user.otp = None
    user.otp_expiry = None
    db.commit()
    return {"ok": True}

