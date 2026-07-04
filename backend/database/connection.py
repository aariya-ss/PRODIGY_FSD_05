import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")

# Setup database engine connection settings based on the database driver
if DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False for multithreading in FastAPI
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL standard pool size and overflow settings
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# Sync Session Local maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model
Base = declarative_base()

# FastAPI dependency to obtain database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
