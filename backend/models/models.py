import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as pgUUID

from backend.database.connection import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as string.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(pgUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
        else:
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(GUID, primary_key=True) # Set explicitly from Supabase Auth ID
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    role = Column(String(50), default="customer") # 'customer' or 'admin'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    stock = Column(Integer, default=0, nullable=False)
    image_url = Column(Text, nullable=True)
    featured = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="pending") # 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("Profile", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
