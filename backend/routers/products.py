from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from uuid import UUID
from typing import Optional, List
from decimal import Decimal
import math

from backend.database.connection import get_db
from backend.models.models import Product, Profile
from backend.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
)
from backend.middleware.auth import require_role

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=ProductListResponse)
def get_products(
    q: Optional[str] = Query(None, description="Search term for product name or description"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    min_price: Optional[Decimal] = Query(None, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, description="Maximum price filter"),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    sort: Optional[str] = Query("newest", description="Sorting options: newest, price_asc, price_desc, name_asc"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(12, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    # Start query
    query = db.query(Product)

    # Search filter
    if q:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%")
            )
        )

    # Category filter
    if category:
        query = query.filter(Product.category == category)

    # Price range filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Featured filter
    if featured is not None:
        query = query.filter(Product.featured == featured)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "name_asc":
        query = query.order_by(asc(Product.name))
    else: # newest
        query = query.order_by(desc(Product.created_at))

    # Pagination count
    total_count = query.count()
    pages = math.ceil(total_count / size) if total_count > 0 else 1
    offset = (page - 1) * size

    # Fetch items
    items = query.offset(offset).limit(size).all()

    return ProductListResponse(
        items=items,
        total=total_count,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_admin: Profile = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    product = Product(**product_in.model_dump())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create product: {str(e)}"
        )


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    product_in: ProductUpdate,
    current_admin: Profile = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Update only fields provided
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update product: {str(e)}"
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: UUID,
    current_admin: Profile = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    try:
        db.delete(product)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not delete product: {str(e)}"
        )
