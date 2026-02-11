
from ..model_loader import model_loader
from ..config import DEVICE
import torch
import clip
from PIL import Image
import cv2

def classify_scene(video_path):
    """
    Uses CLIP to classify the scene context of the video.
    Extracts a middle frame and matches against a set of scene concepts.
    """
    try:
        model, preprocess = model_loader.get_clip()
        
        # 1. Extract a representative frame (middle of video)
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return "Unknown"

        # Convert BGR (OpenCV) to RGB (PIL)
        image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        image_input = preprocess(image).unsqueeze(0).to(DEVICE)
        
        # 2. Define Scene Concepts to match against
        scenes = [
            "office", "meeting room", "conference", 
            "park", "forest", "nature", "mountain",
            "beach", "ocean",
            "city street", "traffic", "building",
            "home", "living room", "kitchen", "bedroom",
            "party", "concert", "crowd",
            "classroom", "library",
            "gym", "sports",
            "video game", "screen recording"
        ]
        
        text_inputs = torch.cat([clip.tokenize(f"a photo of a {c}") for c in scenes]).to(DEVICE)
        
        # 3. Predict
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_inputs)
            
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
        scene_index = indices[0].item()
        scene = scenes[scene_index]
        print(f"[SCENE] Environment: {scene}")
        return scene

    except Exception as e:
        print(f"Error in Scene Classification: {e}")
        return "Unknown"
