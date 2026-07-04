from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from backend.database.connection import get_db
from backend.models.models import Order, Profile
from backend.schemas.schemas import OrderCreate, OrderResponse
from backend.middleware.auth import get_current_user, require_role
from backend.services.inventory import process_checkout

router = APIRouter(prefix="/orders", tags=["Orders"])

def format_order_response(order: Order) -> dict:
    """Helper to convert Order DB model to OrderResponse Pydantic payload,
    resolving the product name relationship."""
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Deleted Product",
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            }
            for item in order.items
        ]
    }

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits an order. Performs stock checking and updates inventory within a transaction.
    """
    order = process_checkout(db, order_in, current_user)
    return format_order_response(order)


@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List orders. Admins get all orders, customers get their own.
    """
    if current_user.role == "admin":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
        
    return [format_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single order by ID. Requires ownership or admin status.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not own this order."
        )
        
    return format_order_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: UUID,
    status_payload: dict, # expecting {"status": "processing/shipped/delivered/cancelled"}
    current_admin: Profile = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Updates order status. Admin only.
    """
    new_status = status_payload.get("status")
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    
    if not new_status or new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    order.status = new_status
    try:
        db.commit()
        db.refresh(order)
        return format_order_response(order)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update order status: {str(e)}"
        )
