from fastapi import APIRouter, Request
from ..config import settings

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    ready = bool(getattr(request.app.state, "startup_complete", False))
    startup_status = getattr(request.app.state, "startup_status", "unknown")
    return {
        "status": "ok" if ready else "starting",
        "ready": ready,
        "startup_status": startup_status,
        "database": "connected",
        "project": settings.PROJECT_NAME,
    }
