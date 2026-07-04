from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

# --- PROFILE SCHEMAS ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: UUID
    email: EmailStr
    role: Optional[str] = "customer"

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    stock: int = Field(..., ge=0)
    image_url: Optional[str] = None
    featured: Optional[bool] = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    size: int
    pages: int


# --- ORDER ITEM SCHEMAS ---
class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID] = None
    product_name: Optional[str] = None
    quantity: int
    price_at_purchase: Decimal

    model_config = ConfigDict(from_attributes=True)


# --- ORDER SCHEMAS ---
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
