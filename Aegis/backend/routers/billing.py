"""Billing router — credit balance + Stripe checkout (Stripe keys optional)"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os

from db.database import get_db
from db.models import User, CreditLedger
from routers.auth import get_current_user

router = APIRouter()

PLANS = {
    "payg_10":     {"credits": 10,  "price_cents": 1400, "label": "Pay-As-You-Go 10 Credits"},
    "starter":     {"credits": 25,  "price_cents": 2900, "label": "Starter Plan",   "monthly": True},
    "pro":         {"credits": 100, "price_cents": 7900, "label": "Pro Plan",        "monthly": True},
    "enterprise":  {"credits": 500, "price_cents": 29900,"label": "Enterprise Plan", "monthly": True},
}

class CheckoutRequest(BaseModel):
    plan_id: str   # "payg_10" | "starter" | "pro" | "enterprise"

# ── GET /billing/balance ─────────────────────────────────────────────────────
@router.get("/balance")
def get_balance(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(CreditLedger).filter(CreditLedger.user_id == user.id)\
                .order_by(CreditLedger.created_at.desc()).limit(20).all()
    return {
        "credits": user.credits,
        "plan": user.plan,
        "history": [{"amount": l.amount, "reason": l.reason,
                     "created_at": l.created_at} for l in history],
    }

@router.get("/ledger")
def get_ledger(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CreditLedger).filter(CreditLedger.user_id == user.id)\
             .order_by(CreditLedger.created_at.desc()).all()

# ── POST /billing/checkout ───────────────────────────────────────────────────
@router.post("/checkout")
def create_checkout(req: CheckoutRequest, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    plan = PLANS.get(req.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Unknown plan")

    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    frontend   = os.getenv("FRONTEND_URL", "http://localhost:3002")

    if stripe_key and not stripe_key.startswith("sk_test_..."):
        try:
            import stripe
            stripe.api_key = stripe_key
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="subscription" if plan.get("monthly") else "payment",
                line_items=[{"price_data": {
                    "currency": "usd",
                    "unit_amount": plan["price_cents"],
                    "product_data": {"name": plan["label"]},
                    **({"recurring": {"interval": "month"}} if plan.get("monthly") else {}),
                }, "quantity": 1}],
                success_url=f"{frontend}/dashboard/billing?success=1&plan={req.plan_id}",
                cancel_url=f"{frontend}/dashboard/billing?cancelled=1",
                metadata={"user_id": user.id, "plan_id": req.plan_id},
            )
            return {"checkout_url": session.url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Dev mode: grant credits immediately
    credits_to_add = plan["credits"]
    user.credits += credits_to_add
    if plan.get("monthly"):
        user.plan = req.plan_id
    ledger = CreditLedger(user_id=user.id, amount=credits_to_add,
                          reason=f"purchase_{req.plan_id}", stripe_ref="dev_mode")
    db.add(ledger); db.commit()
    return {
        "dev_mode": True,
        "message": f"{credits_to_add} credits added (dev mode — no Stripe key)",
        "new_balance": user.credits,
    }

# ── POST /billing/webhook — Stripe webhook ───────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig     = request.headers.get("Stripe-Signature", "")
    secret  = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        import stripe
        event = stripe.Webhook.construct_event(payload, sig, secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    if event["type"] == "checkout.session.completed":
        meta    = event["data"]["object"]["metadata"]
        user_id = meta.get("user_id")
        plan_id = meta.get("plan_id")
        plan    = PLANS.get(plan_id, {})
        if user_id and plan:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.credits += plan["credits"]
                if plan.get("monthly"): user.plan = plan_id
                ledger = CreditLedger(user_id=user_id, amount=plan["credits"],
                                     reason=f"purchase_{plan_id}",
                                     stripe_ref=event["data"]["object"]["id"])
                db.add(ledger); db.commit()
    return {"received": True}
