# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .routes.health import router as health_router
from .routes.video_routes import router as video_router
from .routes.feedback_routes import router as feedback_router
from .routes.user_routes import router as user_router
from .routes.recommendation_routes import router as recommendation_router
from .utils.db_indexes import create_database_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    import sys
    from pathlib import Path
    # Add parent directory for sibling imports
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    # Startup
    print(f"Starting {settings.PROJECT_NAME}...")
    
    # Initialize AI Models
    from ai_engine.model_loader import model_loader
    model_loader.load_models()
    
    await create_database_indexes()
    print(f"{settings.PROJECT_NAME} is ready!")
    yield
    # Shutdown
    print(f"Shutting down {settings.PROJECT_NAME}...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS configuration for session management with cookies
# Important: allow_credentials=True requires specific origins (not "*")
allowed_origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # React default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    settings.FRONTEND_URL,
]

# In production, use only your production domain
if not settings.DEBUG:
    allowed_origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Set-Cookie"],  # Allow frontend to see Set-Cookie header
    max_age=3600,  # Cache preflight requests for 1 hour
)

# include routers
app.include_router(health_router, prefix="/api")
app.include_router(user_router, prefix="/api/users")
app.include_router(video_router, prefix="/api/videos")
app.include_router(feedback_router, prefix="/api/feedback")
app.include_router(recommendation_router, prefix="/api/recommendations")


@app.get("/")
async def root():
    return {
        "message": "Welcome to VideoDiscovery API",
        "docs_url": "/docs",
        "status": "online"
    }


# TEMPORARY DEBUG ENDPOINT — remove after debugging
@app.get("/api/debug/recs")
async def debug_recs():
    from .database import videos_collection, recommendations_collection
    videos = await videos_collection().find({}).to_list(length=50)
    recs = await recommendations_collection().find({}).to_list(length=50)
    
    video_list = []
    for v in videos:
        video_list.append({
            "_id": str(v.get("_id", "")),
            "status": v.get("status", ""),
            "file_name": v.get("file_name", ""),
            "user_id": v.get("user_id", ""),
            "has_search_queries": bool(v.get("ai_metadata", {}).get("search_queries", [])),
            "search_queries": v.get("ai_metadata", {}).get("search_queries", [])[:3],
        })
    
    rec_list = []
    for r in recs:
        rec_list.append({
            "uploaded_video_id": r.get("uploaded_video_id", ""),
            "title": r.get("title", "")[:60],
            "video_link": r.get("video_link", "")[:80],
        })
    
    return {
        "total_videos": len(video_list),
        "videos": video_list,
        "total_recommendations": len(rec_list),
        "recommendations": rec_list,
    }

