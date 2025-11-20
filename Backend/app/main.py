# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes.health import router as health_router
from .routes.video_routes import router as video_router
from .routes.feedback_routes import router as feedback_router
from .routes.user_routes import router as user_router

app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG)

# CORS (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(health_router, prefix="/api")
app.include_router(user_router, prefix="/api/auth")
app.include_router(video_router, prefix="/api/videos")
app.include_router(feedback_router, prefix="/api/feedback")
