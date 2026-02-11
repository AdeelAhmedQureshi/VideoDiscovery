import torch
import whisper
from ultralytics import YOLO
import clip
import os
import shutil
from deepface import DeepFace
# Standard torchvision for Places365
from torchvision.models import resnet50
import torch.nn as nn

from .config import (
    DEVICE, 
    WHISPER_MODEL_SIZE, 
    YOLO_MODEL_NAME, 
    CLIP_MODEL_NAME,
    PLACES365_MODEL_ARCH,
    SLOWFAST_MODEL_NAME,
    MODELS_DIR
)

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            # Initialize all slots to None
            cls._instance.yolo = None
            cls._instance.whisper = None
            cls._instance.clip_model = None
            cls._instance.clip_preprocess = None
            cls._instance.places365 = None
            cls._instance.slowfast = None
            cls._instance.deepface_built = False # DeepFace is functional, not a single object
            cls._instance.is_loaded = False
        return cls._instance

    def load_models(self):
        """
        Loads all models into VRAM with robust error handling for each.
        """
        if self.is_loaded:
            print("Models already loaded.")
            return

        print(f"Loading AI Models into VRAM (Device: {DEVICE})...")

        try:
            # 1. Load YOLOv8 (Object Detection)
            print(f"Loading YOLOv8 ({YOLO_MODEL_NAME})...")
            yolo_path = os.path.join(MODELS_DIR, YOLO_MODEL_NAME)
            
            # Check if model exists in models dir, if not, it might be in current dir or needs download
            if not os.path.exists(yolo_path):
                if os.path.exists(YOLO_MODEL_NAME):
                    print(f"Moving {YOLO_MODEL_NAME} to {MODELS_DIR}...")
                    shutil.move(YOLO_MODEL_NAME, yolo_path)
                else:
                    # Let Ultralytics download it to CWD, then move it
                    print(f"Downloading {YOLO_MODEL_NAME}...")
                    # Initialize to trigger download
                    temp = YOLO(YOLO_MODEL_NAME)
                    if os.path.exists(YOLO_MODEL_NAME):
                        shutil.move(YOLO_MODEL_NAME, yolo_path)
            
            self.yolo = YOLO(yolo_path)
            self.yolo.to(DEVICE) 

            # 2. Load Whisper (Audio Transcription)
            print(f"Loading Whisper ({WHISPER_MODEL_SIZE})...")
            self.whisper = whisper.load_model(WHISPER_MODEL_SIZE, device=DEVICE, download_root=MODELS_DIR)

            # 3. Load CLIP (Concept Extraction)
            print(f"Loading CLIP ({CLIP_MODEL_NAME})...")
            model, preprocess = clip.load(CLIP_MODEL_NAME, device=DEVICE, download_root=MODELS_DIR)
            self.clip_model = model
            self.clip_preprocess = preprocess

            # 4. Load Places365 (Scene Classification)
            print(f"Loading Places365 ({PLACES365_MODEL_ARCH})...")
            try:
                # Download weights if not exists
                import urllib.request
                places365_weight_url = "http://places2.csail.mit.edu/models_places365/resnet50_places365.pth.tar"
                places365_weight_path = os.path.join(MODELS_DIR, "resnet50_places365.pth.tar")
                
                if not os.path.exists(places365_weight_path):
                    print(f"Downloading Places365 weights...")
                    urllib.request.urlretrieve(places365_weight_url, places365_weight_path)
                
                # Load architecture
                self.places365 = resnet50(num_classes=365)
                
                # Load pretrained weights
                checkpoint = torch.load(places365_weight_path, map_location=DEVICE)
                state_dict = {str.replace(k,'module.',''): v for k,v in checkpoint['state_dict'].items()}
                self.places365.load_state_dict(state_dict)
                
                self.places365.eval().to(DEVICE)
            except Exception as e:
                print(f"Warning: Places365 failed to load: {e}")

            # 5. Load SlowFast (Action Recognition)
            # Using PyTorch Hub for ease of access
            print(f"Loading SlowFast ({SLOWFAST_MODEL_NAME})...")
            try:
                self.slowfast = torch.hub.load('facebookresearch/pytorchvideo', SLOWFAST_MODEL_NAME, pretrained=True)
                self.slowfast.eval().to(DEVICE)
            except Exception as e:
                print(f"Warning: SlowFast failed to load (Check Internet/PyTorch Hub): {e}")

            # 6. DeepFace (Demographics)
            # DeepFace doesn't return a "model object" easily, it builds backends.
            # We run a dummy build to warm it up.
            print("Building DeepFace Backend...")
            try:
                # This downloads weights if missing and loads the backend into memory
                DeepFace.build_model("VGG-Face") 
                self.deepface_built = True
            except Exception as e:
                print(f"Warning: DeepFace build failed: {e}")

            self.is_loaded = True
            print("All Models Loaded Successfully!")

        except Exception as e:
            print(f"CRITICAL: Error loading core models: {e}")
            raise e

    # --- Getters ---

    def get_yolo(self):
        if not self.yolo: self.load_models()
        return self.yolo

    def get_whisper(self):
        if not self.whisper: self.load_models()
        return self.whisper

    def get_clip(self):
        if not self.clip_model: self.load_models()
        return self.clip_model, self.clip_preprocess

    def get_places365(self):
        if not self.places365: self.load_models()
        return self.places365

    def get_slowfast(self):
        if not self.slowfast: self.load_models()
        return self.slowfast
    
    def is_deepface_ready(self):
        if not self.deepface_built: self.load_models()
        return self.deepface_built

# Global instance
model_loader = ModelLoader()

if __name__ == "__main__":
    print("Running ModelLoader standalone...")
    model_loader.load_models()