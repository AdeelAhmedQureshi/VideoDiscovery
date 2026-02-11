
import os
import torch

# Force CUDA device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Base Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
TEMP_VIDEO_DIR = os.path.join(os.path.dirname(BASE_DIR), "temp_videos")

# Model Settings
WHISPER_MODEL_SIZE = "medium"  # Options: tiny, base, small, medium, large
YOLO_MODEL_NAME = "yolov8s.pt"  # Options: n, s, m, l, x
CLIP_MODEL_NAME = "ViT-B/32"
PLACES365_MODEL_ARCH = "resnet50"
SLOWFAST_MODEL_NAME = "slowfast_r50"

# DeepFace Settings
DEEPFACE_BACKEND = "retinaface" # more accurate than opencv
DEEPFACE_METRIC = "cosine"

# Create temp dir if not exists
os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

print(f"AI Engine Configured. Device: {DEVICE}")
