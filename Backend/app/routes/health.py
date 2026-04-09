from fastapi import APIRouter, Request, BackgroundTasks
from ..config import settings

# Attempt to import model_loader safely. If it fails, we handle it.
try:
    from ...ai_engine.model_loader import model_loader
except Exception:
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.parent))
    from ai_engine.model_loader import model_loader

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
        "models_loaded": getattr(model_loader, "is_loaded", False)
    }

@router.post("/init-models")
async def init_models(background_tasks: BackgroundTasks):
    """Trigger AI models to load in the background if not already loaded"""
    if getattr(model_loader, "is_loaded", False):
        return {"status": "ready", "message": "Models already loaded"}
    
    # Run in background to not block the request
    background_tasks.add_task(model_loader.load_models)
    return {"status": "starting", "message": "Models loading in background"}

@router.get("/models-status")
async def get_models_status():
    """Check if AI models are loaded"""
    is_loaded = getattr(model_loader, "is_loaded", False)
    return {
        "status": "ready" if is_loaded else "starting",
        "is_loaded": is_loaded
    }
