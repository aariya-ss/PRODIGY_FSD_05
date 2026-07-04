from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.models import Profile
from backend.schemas.schemas import ProfileResponse, ProfileUpdate
from backend.middleware.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: Profile = Depends(get_current_user)):
    """
    Get profile information of the currently authenticated user.
    """
    return current_user


@router.put("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details for the currently authenticated user.
    """
    update_data = profile_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update profile: {str(e)}"
        )
