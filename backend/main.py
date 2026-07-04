import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database.connection import engine, Base
from backend.routers import products, orders, profile

# Auto-create tables (particularly useful for SQLite development)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Local E-Commerce API",
    description="Backend services for the Local E-Commerce Platform, powered by Supabase Auth and PostgreSQL",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*" # Fallback wildcard for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for general errors to keep responses clean
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Include Routers
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(profile.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Local E-Commerce Platform API",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    # Load settings from environment inside code if needed
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
