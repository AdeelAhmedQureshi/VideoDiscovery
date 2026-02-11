import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import cv2
import os
import urllib.request
from typing import List
from ..model_loader import model_loader
from ..config import DEVICE

# Categories file URL
CATEGORIES_URL = "https://raw.githubusercontent.com/csailvision/places365/master/categories_places365.txt"
CATEGORIES_FILE = "categories_places365.txt"

class PlaceClassifier:
    def __init__(self):
        """Initialize the Places365 classifier with category labels."""
        self.categories = self._load_categories()
        self.transform = self._get_transform()
    
    def _load_categories(self) -> List[str]:
        """Load or download the Places365 category labels."""
        from ..config import MODELS_DIR
        categories_path = os.path.join(MODELS_DIR, CATEGORIES_FILE)
        
        if not os.path.exists(categories_path):
            print(f"[PlaceClassifier] Downloading category labels...")
            try:
                urllib.request.urlretrieve(CATEGORIES_URL, categories_path)
                print(f"[PlaceClassifier] Categories downloaded.")
            except Exception as e:
                print(f"[PlaceClassifier] Failed to download categories: {e}")
                return []
        
        # Parse the categories file
        categories = []
        with open(categories_path, 'r') as f:
            for line in f:
                # Format: "/a/abbey 0" -> extract "abbey"
                category = line.strip().split(' ')[0].split('/')[2]
                categories.append(category)
        
        return categories
    
    def _get_transform(self):
        """Standard Places365 preprocessing pipeline."""
        return transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def classify_place(self, video_path: str) -> List[str]:
        """
        Classify the environment/place from a video.
        
        Args:
            video_path: Path to the video file
            
        Returns:
            List of top-3 place categories
        """
        print(f"[PlaceClassifier] Analyzing environment: {video_path}")
        
        try:
            # 1. Extract middle frame
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"[PlaceClassifier] Could not open video: {video_path}")
                return []
            
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                print(f"[PlaceClassifier] Failed to extract frame")
                return []
            
            # 2. Convert BGR to RGB and create PIL Image
            image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            # 3. Apply preprocessing
            input_tensor = self.transform(image).unsqueeze(0).to(DEVICE)
            
            # 4. Get model and run inference
            model = model_loader.get_places365()
            if model is None:
                print(f"[PlaceClassifier] Model not loaded")
                return []
            
            with torch.no_grad():
                logits = model(input_tensor)
                probs = torch.nn.functional.softmax(logits, dim=1)
            
            # 5. Get top-3 predictions
            top_probs, top_indices = probs.topk(3)
            
            results = []
            for i in range(3):
                idx = top_indices[0][i].item()
                prob = top_probs[0][i].item()
                
                if idx < len(self.categories):
                    category = self.categories[idx]
                    results.append(category)
                    
            print(f"[SCENE] Environment: {results}")
            return results
            
        except Exception as e:
            print(f"[PlaceClassifier] Error: {e}")
            return []
