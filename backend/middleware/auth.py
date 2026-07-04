import os
import uuid
import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Profile

security = HTTPBearer()

# Retrieve JWT secret from environments
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-supabase-jwt-key-change-me-in-production-12345")

def get_token_payload(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Decodes the Supabase JWT.
    Supports a mock token format for local testing without Supabase:
    Format: 'mock-{uuid}:{role}:{email}'
    """
    token = credentials.credentials
    
    # Check for mock token bypass for easier local development
    if token.startswith("mock-"):
        try:
            parts = token.split(":")
            # parts[0] is mock-{uuid}
            user_uuid = parts[0].replace("mock-", "")
            role = parts[1] if len(parts) > 1 else "customer"
            email = parts[2] if len(parts) > 2 else f"user-{user_uuid[:8]}@example.com"
            
            # Verify valid UUID format
            uuid.UUID(user_uuid)
            
            return {
                "sub": user_uuid,
                "email": email,
                "role": "authenticated",
                "user_metadata": {
                    "full_name": f"Mock {role.capitalize()} User",
                },
                "mock_role": role # custom attribute to pass mock role
            }
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid mock token format. Use 'mock-UUID:role:email'"
            )

    try:
        # Standard offline Supabase JWT Verification
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def get_current_user(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db)
) -> Profile:
    """
    Dependency that extracts user info from JWT and synchronizes with local profiles table.
    """
    user_id_str = payload.get("sub")
    email = payload.get("email")
    
    if not user_id_str or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing required claims (sub, email)"
        )
        
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token"
        )

    # Check if profile already exists in DB
    profile = db.query(Profile).filter(Profile.id == user_uuid).first()
    
    if not profile:
        # User metadata
        metadata = payload.get("user_metadata", {}) or {}
        full_name = metadata.get("full_name") or metadata.get("name")
        
        # Decide role:
        # 1. If mock_role is present, use it.
        # 2. If it's the first profile created, make it admin.
        # 3. If email matches 'admin@example.com' or 'admin@local.com', make it admin.
        # 4. Otherwise, 'customer'.
        role = "customer"
        if "mock_role" in payload:
            role = payload["mock_role"]
        else:
            total_profiles = db.query(Profile).count()
            if total_profiles == 0 or email.startswith("admin@") or "admin" in email.split("@")[0]:
                role = "admin"
                
        profile = Profile(
            id=user_uuid,
            email=email,
            full_name=full_name,
            role=role
        )
        db.add(profile)
        try:
            db.commit()
            db.refresh(profile)
        except Exception as e:
            db.rollback()
            # Double check if someone created it concurrently
            profile = db.query(Profile).filter(Profile.id == user_uuid).first()
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to synchronize profile: {str(e)}"
                )

    return profile


def require_role(allowed_role: str):
    """
    RBAC dependency wrapper. Enforces user role membership.
    Admins bypass all role requirements.
    """
    def role_dependency(current_user: Profile = Depends(get_current_user)):
        if current_user.role != allowed_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires '{allowed_role}' privileges."
            )
        return current_user
    return role_dependency
