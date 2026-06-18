from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.schemas import OTPRequest, OTPVerify, Token
from backend.middleware.auth import create_access_token
from backend.models.models import Profile

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for pending OTP verification (in production, use Redis)
# Since we are local/offline, we can also use a simple global dict or a fixed code
MOCK_OTP_CODE = "123456"

@router.post("/otp/request")
def request_otp(request: OTPRequest):
    phone = request.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    
    # In a real app, this would integrate with an SMS provider like Twilio
    # For SmartBuy mock login, we return the mock code in the message for easy copy-paste
    return {
        "message": f"OTP sent successfully to {phone}.",
        "mock_code": MOCK_OTP_CODE
    }

@router.post("/otp/verify", response_model=Token)
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    phone = request.phone.strip()
    code = request.code.strip()
    
    if code != MOCK_OTP_CODE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Use 123456 for testing."
        )

    # Determine user role (ends with '0000' or specific admin numbers get admin role)
    role = "customer"
    if phone in ["+919999999999", "9999999999", "8888888888"] or phone.endswith("0000"):
        role = "admin"

    # Make sure profile exists (auto-sync/create on login)
    user = db.query(Profile).filter(Profile.phone == phone).first()
    if not user:
        user = Profile(
            phone=phone,
            full_name=f"User {phone[-4:]}" if len(phone) >= 4 else "SmartBuy Shopper",
            role=role,
            avatar_url=f"https://api.dicebear.com/7.x/adventurer/svg?seed={phone}",
            address="",
            city="",
            pincode=""
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update role if needed
        if user.role != role:
            user.role = role
            db.commit()
            db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": user.phone, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }
