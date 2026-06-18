import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base, SessionLocal
from backend.models.models import Product, Profile
from backend.routers import auth, products, profile, orders, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartBuy E-Commerce API",
    description="Backend services for SmartBuy local e-commerce platform",
    version="1.0.0"
)

# CORS setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Database startup seeder
@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed Products if count is 0
        product_count = db.query(Product).count()
        if product_count == 0:
            print("Seeding initial local products...")
            initial_products = [
                Product(
                    name="Organic Alphonso Mangoes (1kg)",
                    description="Sweet, aromatic and naturally ripened organic Alphonso mangoes direct from Devgad farms.",
                    price=350.0,
                    original_price=450.0,
                    image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60",
                    category="Fruits & Vegetables",
                    stock=30,
                    featured=True
                ),
                Product(
                    name="Fresh Organic Spinach (250g Bunch)",
                    description="Crisp, vitamin-rich organic green spinach bunch, freshly cut and pre-washed.",
                    price=30.0,
                    original_price=45.0,
                    image_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60",
                    category="Fruits & Vegetables",
                    stock=50,
                    featured=True
                ),
                Product(
                    name="Fresh Farm Whole Milk (1L)",
                    description="Pasteurized, unhomogenized farm-fresh whole milk with rich cream content.",
                    price=75.0,
                    original_price=85.0,
                    image_url="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
                    category="Dairy",
                    stock=100,
                    featured=True
                ),
                Product(
                    name="Artisanal Sourdough Bread (400g)",
                    description="Freshly baked sourdough bread with a crispy crust and soft, airy crumb.",
                    price=120.0,
                    original_price=150.0,
                    image_url="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=60",
                    category="Bakery",
                    stock=15,
                    featured=True
                ),
                Product(
                    name="Organic Brown Eggs (12 pcs)",
                    description="Free-range, organic brown eggs packed with high-quality protein and essential nutrients.",
                    price=140.0,
                    original_price=170.0,
                    image_url="https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60",
                    category="Dairy",
                    stock=40,
                    featured=True
                ),
                Product(
                    name="Butter Croissants (Pack of 4)",
                    description="Golden, flaky, and buttery French-style croissants baked fresh every morning.",
                    price=180.0,
                    original_price=220.0,
                    image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
                    category="Bakery",
                    stock=20,
                    featured=True
                ),
                Product(
                    name="Sweet Red Gala Apples (1kg)",
                    description="Crispy, juicy, and sweet red apples imported from Himachal orchards.",
                    price=190.0,
                    original_price=240.0,
                    image_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60",
                    category="Fruits & Vegetables",
                    stock=35,
                    featured=False
                ),
                Product(
                    name="Greek Yogurt - Blueberry (200g)",
                    description="Creamy, thick strained Greek yogurt infused with delicious blueberry compote.",
                    price=95.0,
                    original_price=120.0,
                    image_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60",
                    category="Dairy",
                    stock=60,
                    featured=False
                )
            ]
            db.add_all(initial_products)
            db.commit()
            print("Successfully seeded 8 items.")

        # 2. Seed an initial Admin Profile so they can login and use the dashboard immediately
        # We can seed a profile for +919999999999
        admin_phone = "+919999999999"
        admin_user = db.query(Profile).filter(Profile.phone == admin_phone).first()
        if not admin_user:
            print("Seeding initial admin user profile (+919999999999)...")
            admin_user = Profile(
                phone=admin_phone,
                full_name="SmartBuy Admin",
                role="admin",
                avatar_url="https://api.dicebear.com/7.x/adventurer/svg?seed=admin",
                address="SmartBuy Headquarters, Sector 62",
                city="Noida",
                pincode="201301"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user seeded.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "running", "platform": "SmartBuy E-Commerce"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
