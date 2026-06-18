import uuid
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class OTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number to request OTP for")

class OTPVerify(BaseModel):
    phone: str = Field(..., description="Phone number")
    code: str = Field(..., description="6-digit verification code")

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    phone: Optional[str] = None
    role: Optional[str] = None

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileRead(ProfileBase):
    id: uuid.UUID
    phone: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: float
    image_url: Optional[str] = None
    category: str
    stock: int
    featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

class ProductRead(ProductBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int

class OrderItemRead(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    price_at_purchase: float
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    delivery_address: str
    contact_phone: str
    items: List[OrderItemCreate]

class OrderRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    status: str
    total_amount: float
    delivery_address: str
    contact_phone: str
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class OrderAlert(BaseModel):
    product_id: uuid.UUID
    name: str
    stock: int

class AdminStats(BaseModel):
    total_sales: float
    total_orders: int
    active_inventory_count: int
    stock_alerts: List[OrderAlert]
    recent_orders: List[OrderRead]
