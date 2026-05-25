
import torch
import json
import urllib.request
import os
from typing import List, Dict
from pytorchvideo.data.encoded_video import EncodedVideo
# Remove broken imports
# from pytorchvideo.transforms import (
#     ApplyTransformToKey,
#     ShortSideScale,
#     UniformTemporalSubsample,
# )
from torchvision.transforms import Compose, Lambda, Resize, CenterCrop
from torchvision.transforms._transforms_video import NormalizeVideo
from ..model_loader import model_loader
from ..config import DEVICE

# Constants
SIDE_SIZE = 256
MEAN = [0.45, 0.45, 0.45]
STD = [0.225, 0.225, 0.225]
CROP_SIZE = 256
NUM_FRAMES = 32
ALPHA = 4
KINETICS_URL = "https://dl.fbaipublicfiles.com/pyslowfast/dataset/class_names/kinetics_classnames.json"
LABELS_FILE = "kinetics_classnames.json"

class UniformTemporalSubsample(torch.nn.Module):
    """
    Custom implementation of UniformTemporalSubsample from pytorchvideo.
    Selects num_samples frames equally spaced from the input.
    """
    def __init__(self, num_samples):
        super().__init__()
        self.num_samples = num_samples

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (C, T, H, W)
        t = x.shape[1]
        indices = torch.linspace(0, t - 1, self.num_samples).long()
        return torch.index_select(x, 1, indices)

class PackPathway(torch.nn.Module):
    """
    Transform for converting video frames as a list of tensors. 
    SlowFast requires [slow_pathway, fast_pathway].
    """
    def __init__(self):
        super().__init__()

    def forward(self, frames: torch.Tensor):
        fast_pathway = frames
        # Perform temporal sampling from the fast pathway.
        # slow_pathway subsamples by alpha (e.g., 32/4 = 8 frames)
        slow_pathway = torch.index_select(
            frames,
            1,
            torch.linspace(
                0, frames.shape[1] - 1, frames.shape[1] // ALPHA
            ).long(),
        )
        frame_list = [slow_pathway, fast_pathway]
        return frame_list

class ActionRecognizer:
    def __init__(self):
        self.labels = self._load_labels()
        # Define transform pipeline using standard torchvision components
        self.transform = Compose(
            [
                UniformTemporalSubsample(NUM_FRAMES),
                Lambda(lambda x: x / 255.0),
                NormalizeVideo(MEAN, STD),
                Resize(SIDE_SIZE),          # ShortSideScale equivalent
                CenterCrop(CROP_SIZE),
                PackPathway()
            ]
        )

    def _load_labels(self) -> Dict:
        """Loads Kinetics-400 labels, downloading if necessary."""
        if not os.path.exists(LABELS_FILE):
            print(f"[ActionRecognizer] Downloading Kinetics-400 labels...")
            try:
                with urllib.request.urlopen(KINETICS_URL) as url:
                    data = json.loads(url.read().decode())
                    with open(LABELS_FILE, 'w') as f:
                        json.dump(data, f)
            except Exception as e:
                print(f"⚠️ [ActionRecognizer] Failed to download labels: {e}")
                return {}
        
        with open(LABELS_FILE, 'r') as f:
            data = json.load(f)

        # Invert: {"Label": ID} -> {"ID": "Label"} and clean quotes
        inverted = {}
        for k, v in data.items():
            clean_label = k.replace('"', '').strip()
            inverted[str(v)] = clean_label
            
        return inverted

    def analyze_video(self, video_path: str) -> List[str]:
        """
        Runs SlowFast action recognition on the video.
        Returns Top-5 actions.
        """
        print(f"[ActionRecognizer] Processing: {video_path}")
        try:
            # 1. Load Video
            try:
                video = EncodedVideo.from_path(video_path)
            except Exception as e:
                print(f"[ActionRecognizer] Failed to load video (av/pytorchvideo error): {e}")
                return []

            # 2. Select a Clip (Middle 2 seconds)
            duration = video.duration
            start_sec = max(0, duration / 2.0 - 1.0) # 1 sec before middle
            end_sec = min(duration, start_sec + 2.0) # 2 sec clip
            
            # Load clip
            video_data = video.get_clip(start_sec=start_sec, end_sec=end_sec)

            # 3. Transform
            # video_data is dict: {'video': tensor, 'audio': tensor}
            # We apply transform directly to the video tensor
            inputs = self.transform(video_data["video"])
            
            # Move to device (inputs is a list of [slow, fast])
            inputs = [i.to(DEVICE)[None, ...] for i in inputs]

            # 4. Inference
            model = model_loader.get_slowfast()
            if not model:
                print("⚠️ [ActionRecognizer] Model not valid.")
                return []

            with torch.no_grad():
                preds = model(inputs)

            # 5. Decode Output
            post_act = torch.nn.Softmax(dim=1)
            preds = post_act(preds)
            pred_classes = preds.topk(k=5).indices[0]

            # Map to labels
            top_actions = []
            for class_index in pred_classes:
                idx_str = str(int(class_index))
                if idx_str in self.labels:
                    top_actions.append(self.labels[idx_str])
                else:
                    top_actions.append(f"Action_{idx_str}")

            print(f"[SLOWFAST] Top-5 Actions: {top_actions}")
            return top_actions

        except Exception as e:
            print(f"⚠️ [ActionRecognizer] Analysis failed: {e}")
            # print(traceback.format_exc())
            return []
