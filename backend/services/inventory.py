from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from uuid import UUID

from backend.models.models import Product, Order, OrderItem, Profile
from backend.schemas.schemas import OrderCreate

def process_checkout(db: Session, order_data: OrderCreate, current_user: Profile) -> Order:
    """
    Executes checkout inside a database transaction:
    - Lock and retrieve products.
    - Validate stock availability.
    - Deduct stock.
    - Write Order and OrderItems.
    - Commit and return.
    """
    # Verify we have items in the order
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item."
        )

    # Use a transaction block
    try:
        total_amount = Decimal("0.00")
        order_items_to_create = []
        products_to_update = []

        # Iterate through the items requested
        for item in order_data.items:
            # Query product. If PostgreSQL, lock row using with_for_update
            product_query = db.query(Product).filter(Product.id == item.product_id)
            if db.bind.dialect.name == "postgresql":
                product = product_query.with_for_update().first()
            else:
                product = product_query.first()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found."
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Requested: {item.quantity}, Available: {product.stock}"
                )

            # Deduct stock
            product.stock -= item.quantity
            products_to_update.append(product)

            # Calculate price
            item_total = product.price * Decimal(item.quantity)
            total_amount += item_total

            # Prepare order item
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price
            )
            order_items_to_create.append(order_item)

        # Create Order
        new_order = Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="pending"
        )
        db.add(new_order)
        db.flush() # Flush to populate new_order.id

        # Associate Order Items and add to session
        for order_item in order_items_to_create:
            order_item.order_id = new_order.id
            db.add(order_item)

        # Commit all changes (updates stock + inserts order and order items)
        db.commit()
        db.refresh(new_order)
        
        # Load order items with relationship for response
        # Using a fresh query to ensure we return relationships properly loaded
        return db.query(Order).filter(Order.id == new_order.id).first()

    except HTTPException:
        # Re-raise HTTP exceptions to client
        db.rollback()
        raise
    except Exception as e:
        # Rollback all changes if any unexpected database error occurs
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout transaction failed: {str(e)}"
        )
