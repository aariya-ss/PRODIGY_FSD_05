from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import Profile
from backend.schemas.schemas import ProfileRead, ProfileUpdate
from backend.middleware.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileRead)
def get_profile(current_user: Profile = Depends(get_current_user)):
    return current_user

@router.put("", response_model=ProfileRead)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user
