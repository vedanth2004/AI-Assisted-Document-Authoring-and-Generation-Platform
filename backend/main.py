from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

from database import get_db, init_db
from auth import get_current_user, router as auth_router
from projects import router as projects_router
from documents import router as documents_router
from generation import router as generation_router
from refinement import router as refinement_router
from export import router as export_router
import os

# Load .env from the backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: cleanup code can go here if needed

app = FastAPI(
    title="AI Document Authoring Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - support both development and production
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    FRONTEND_URL,
]

# Add common production domains if needed
if os.getenv("ENVIRONMENT") == "production":
    # Add any additional production domains
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(generation_router, prefix="/api/generation", tags=["Generation"])
app.include_router(refinement_router, prefix="/api/refinement", tags=["Refinement"])
app.include_router(export_router, prefix="/api/export", tags=["Export"])

@app.get("/")
async def root():
    return {"message": "AI Document Authoring Platform API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

