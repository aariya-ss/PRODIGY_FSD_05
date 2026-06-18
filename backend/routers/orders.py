import re
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models.models import Order, OrderItem, Product, Profile
from backend.schemas.schemas import OrderCreate, OrderRead
from backend.middleware.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderRead])
def get_user_orders(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderRead)
def get_order_details(
    order_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if the user is authorized to view this order
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this order"
        )
    
    return order

@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(
    order_in: OrderCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order with an empty cart"
        )

    # We must lock target product rows inside a transaction using with_for_update()
    # Sort items by product_id to avoid potential database deadlocks
    sorted_items = sorted(order_in.items, key=lambda x: x.product_id)
    
    subtotal = 0.0
    items_to_create = []

    try:
        for item in sorted_items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} not found"
                )
            
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, requested: {item.quantity}"
                )
            
            # Deduct stock
            product.stock -= item.quantity
            item_price = product.price
            subtotal += item_price * item.quantity
            
            items_to_create.append((product, item.quantity, item_price))
            
        # Free delivery threshold is ₹500, flat delivery is ₹40
        delivery_fee = 40.0 if subtotal < 500.0 else 0.0
        total_amount = subtotal + delivery_fee

        # Create the Order
        new_order = Order(
            user_id=current_user.id,
            status="placed",
            total_amount=total_amount,
            delivery_address=order_in.delivery_address,
            contact_phone=order_in.contact_phone
        )
        db.add(new_order)
        db.flush()  # Populates new_order.id

        # Create OrderItems
        for product, quantity, price in items_to_create:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=quantity,
                price_at_purchase=price
            )
            db.add(order_item)

        # Auto-update user address/pincode in their profile if empty
        if not current_user.address:
            current_user.address = order_in.delivery_address
        if not current_user.pincode:
            pincode_match = re.search(r"\b\d{6}\b", order_in.delivery_address)
            if pincode_match:
                current_user.pincode = pincode_match.group(0)

        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed: {str(e)}"
        )
