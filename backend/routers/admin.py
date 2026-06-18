from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from backend.database.connection import get_db
from backend.models.models import Order, Product, OrderItem
from backend.schemas.schemas import AdminStats, OrderRead, OrderAlert
from backend.middleware.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(require_admin)])

@router.get("/stats", response_model=AdminStats)
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total revenue / sales (sum of total_amount of all orders)
    total_sales_query = db.query(func.sum(Order.total_amount)).scalar()
    total_sales = float(total_sales_query) if total_sales_query is not None else 0.0

    # 2. Total orders count
    total_orders = db.query(Order).count()

    # 3. Active inventory count (number of products with stock > 0)
    active_inventory_count = db.query(Product).filter(Product.stock > 0).count()

    # 4. Stock alerts (products with stock <= 5)
    low_stock_products = db.query(Product).filter(Product.stock <= 5).all()
    stock_alerts = [
        OrderAlert(product_id=p.id, name=p.name, stock=p.stock)
        for p in low_stock_products
    ]

    # 5. Recent orders (latest 10 orders)
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return AdminStats(
        total_sales=total_sales,
        total_orders=total_orders,
        active_inventory_count=active_inventory_count,
        stock_alerts=stock_alerts,
        recent_orders=recent_orders
    )

@router.put("/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    # Verify status is valid
    valid_statuses = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid order status. Must be one of {valid_statuses}"
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = status
    db.commit()
    db.refresh(order)
    return order
