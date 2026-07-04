import unittest
import uuid
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set environment variable to use sqlite for testing
import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SUPABASE_JWT_SECRET"] = "test-secret-12345"

from backend.main import app
from backend.database.connection import Base, get_db
from backend.models.models import Product, Profile, Order, OrderItem
from backend.services.inventory import process_checkout
from backend.schemas.schemas import OrderCreate, OrderItemCreate

# Create test engine
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override database session dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestECommerceBackend(unittest.TestCase):
    def setUp(self):
        # Create tables
        Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)
        self.db = TestingSessionLocal()

    def tearDown(self):
        # Drop tables
        Base.metadata.drop_all(bind=engine)
        self.db.close()
        # Dispose of the engine connection pool to release file locks on Windows
        engine.dispose()
        # Remove file
        if os.path.exists("./test.db"):
            try:
                os.remove("./test.db")
            except PermissionError:
                pass

    def test_profile_sync_and_auth(self):
        """Test profile synchronization when user hits backend with JWT"""
        user_uuid = str(uuid.uuid4())
        mock_token = f"mock-{user_uuid}:customer:test-customer@example.com"
        
        # Call profile retrieval endpoint
        headers = {"Authorization": f"Bearer {mock_token}"}
        response = self.client.get("/api/profile", headers=headers)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "test-customer@example.com")
        self.assertEqual(data["role"], "customer")

        # Verify db insertion
        profile_in_db = self.db.query(Profile).filter(Profile.id == uuid.UUID(user_uuid)).first()
        self.assertIsNotNone(profile_in_db)
        self.assertEqual(profile_in_db.email, "test-customer@example.com")

    def test_admin_product_crud(self):
        """Test products CRUD endpoints and admin restrictions"""
        admin_uuid = str(uuid.uuid4())
        admin_token = f"mock-{admin_uuid}:admin:admin@example.com"
        
        customer_uuid = str(uuid.uuid4())
        customer_token = f"mock-{customer_uuid}:customer:customer@example.com"

        product_payload = {
            "name": "Mechanical Keyboard",
            "description": "Premium red switch gaming keyboard",
            "price": "99.99",
            "category": "Electronics",
            "stock": 10,
            "image_url": "http://example.com/kbd.jpg",
            "featured": True
        }

        # 1. Customer attempts to create product -> should fail with 403
        headers_cust = {"Authorization": f"Bearer {customer_token}"}
        response = self.client.post("/api/products", json=product_payload, headers=headers_cust)
        self.assertEqual(response.status_code, 403)

        # 2. Admin creates product -> should succeed
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        response = self.client.post("/api/products", json=product_payload, headers=headers_admin)
        self.assertEqual(response.status_code, 201)
        prod_data = response.json()
        self.assertIn("id", prod_data)
        product_id = prod_data["id"]

        # 3. Read products list (public) -> should succeed
        response = self.client.get("/api/products")
        self.assertEqual(response.status_code, 200)
        list_data = response.json()
        self.assertEqual(list_data["total"], 1)
        self.assertEqual(list_data["items"][0]["name"], "Mechanical Keyboard")

        # 4. Admin updates product -> should succeed
        update_payload = {"stock": 8, "price": "89.99"}
        response = self.client.put(f"/api/products/{product_id}", json=update_payload, headers=headers_admin)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["stock"], 8)
        self.assertEqual(float(response.json()["price"]), 89.99)

        # 5. Admin deletes product -> should succeed
        response = self.client.delete(f"/api/products/{product_id}", headers=headers_admin)
        self.assertEqual(response.status_code, 204)

        # 6. Read products list again -> total should be 0
        response = self.client.get("/api/products")
        self.assertEqual(response.json()["total"], 0)

    def test_checkout_transaction_and_rollback(self):
        """Test transactional checkout, stock decrement, and failure rollbacks"""
        admin_uuid = str(uuid.uuid4())
        admin_token = f"mock-{admin_uuid}:admin:admin@example.com"
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        
        customer_uuid = str(uuid.uuid4())
        customer_token = f"mock-{customer_uuid}:customer:customer@example.com"
        headers_cust = {"Authorization": f"Bearer {customer_token}"}

        # Create two products
        p1 = Product(name="Item A", price=Decimal("10.00"), category="Apparel", stock=5)
        p2 = Product(name="Item B", price=Decimal("20.00"), category="Apparel", stock=2)
        self.db.add_all([p1, p2])
        self.db.commit()
        
        p1_id = str(p1.id)
        p2_id = str(p2.id)

        # Sync profile for customer first
        self.client.get("/api/profile", headers=headers_cust)

        # 1. Place order within stock limits
        order_payload = {
            "items": [
                {"product_id": p1_id, "quantity": 3},
                {"product_id": p2_id, "quantity": 2}
            ]
        }
        response = self.client.post("/api/orders", json=order_payload, headers=headers_cust)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(float(response.json()["total_amount"]), 70.00) # (10*3) + (20*2)

        # Check that stock was correctly decremented in database
        self.db.refresh(p1)
        self.db.refresh(p2)
        self.assertEqual(p1.stock, 2) # 5 - 3
        self.assertEqual(p2.stock, 0) # 2 - 2

        # 2. Place order exceeding stock limits -> should trigger failure rollback
        insufficient_payload = {
            "items": [
                {"product_id": p1_id, "quantity": 4} # Only 2 left!
            ]
        }
        response = self.client.post("/api/orders", json=insufficient_payload, headers=headers_cust)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Insufficient stock", response.json()["detail"])

        # Check that stock remains unchanged (p1.stock should still be 2, not decremented or left in intermediate state)
        self.db.refresh(p1)
        self.assertEqual(p1.stock, 2)

if __name__ == "__main__":
    unittest.main()
