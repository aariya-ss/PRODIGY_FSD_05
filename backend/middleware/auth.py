import os
import datetime
from typing import Optional
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.models import Profile

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey_smartbuy_platform_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/verify", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Profile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        role: str = payload.get("role", "customer")
        if phone is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError:
        raise credentials_exception

    # Check if user exists in the local database
    user = db.query(Profile).filter(Profile.phone == phone).first()
    if not user:
        # Auto-sync/insert dynamically if they don't exist in local DB
        # This occurs if it is their first time logging in or they logged in offline
        # Determine role: if phone is an admin-specific phone (e.g. starting with +9199999 or ending with 0000), let's set role to admin, or default to payload role.
        # Let's say +919999999999 or any phone ending with '0000' is an admin.
        user_role = role
        if phone in ["+919999999999", "9999999999", "8888888888"] or phone.endswith("0000"):
            user_role = "admin"
            
        user = Profile(
            phone=phone,
            full_name=phone.split("@")[0] if "@" in phone else f"User {phone[-4:]}",
            role=user_role,
            avatar_url=f"https://api.dicebear.com/7.x/adventurer/svg?seed={phone}",
            address="",
            city="",
            pincode=""
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

def require_admin(current_user: Profile = Depends(get_current_user)) -> Profile:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    return current_user
