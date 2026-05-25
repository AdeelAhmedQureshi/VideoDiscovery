
import cv2
import math

class ObjectDetector:
    def __init__(self, model):
        """
        Initialize with a YOLO model instance (Dependency Injection).
        """
        self.model = model

    def detect(self, video_path: str) -> list[str]:
        """
        Scans video at 1 FPS to detect unique objects.
        Returns a list of unique string tags (e.g., ['laptop', 'person']).
        """
        detected_objects = set()
        cap = None

        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"[ObjectDetector] Could not open video: {video_path}")
                return []

            fps = cap.get(cv2.CAP_PROP_FPS)
            if fps <= 0:
                fps = 24  # Fallback
            
            # interval to sample 1 frame per second
            frame_interval = int(math.ceil(fps))

            frame_count = 0
            
            while True:
                success, frame = cap.read()
                if not success:
                    break
                
                # Check 1 FPS rule
                if frame_count % frame_interval == 0:
                    # Run inference with confidence threshold 0.5
                    # verbose=False prevents spamming console
                    results = self.model(frame, conf=0.5, verbose=False)

                    for result in results:
                        for box in result.boxes:
                            class_id = int(box.cls[0])
                            # Use the model's names dict to get string label
                            if self.model.names:
                                label = self.model.names[class_id]
                                detected_objects.add(label)
                
                frame_count += 1
        
        except Exception as e:
            print(f"[ObjectDetector] Error during processing: {e}")
            return [] # Return empty list on failure, don't crash

        finally:
            if cap:
                cap.release()
        
        objects_list = list(detected_objects)
        print(f"[YOLO] Detected Objects: {objects_list}")
        return objects_list
    
    def detect_per_frame(self, video_path: str) -> list[list[str]]:
        """
        Scans video at 1 FPS and returns objects detected in each frame separately.
        This is used by the VisualIntelligenceValidator for per-frame CLIP validation.
        
        Returns:
            List of object lists, one per sampled frame
            Example: [['person', 'laptop'], ['person', 'laptop', 'mouse'], ...]
        """
        detected_per_frame = []
        cap = None

        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"[ObjectDetector] Could not open video: {video_path}")
                return []

            fps = cap.get(cv2.CAP_PROP_FPS)
            if fps <= 0:
                fps = 24  # Fallback
            
            # interval to sample 1 frame per second
            frame_interval = int(math.ceil(fps))

            frame_count = 0
            
            while True:
                success, frame = cap.read()
                if not success:
                    break
                
                # Check 1 FPS rule
                if frame_count % frame_interval == 0:
                    frame_objects = []
                    
                    # Run inference with confidence threshold 0.5
                    results = self.model(frame, conf=0.5, verbose=False)

                    for result in results:
                        for box in result.boxes:
                            class_id = int(box.cls[0])
                            if self.model.names:
                                label = self.model.names[class_id]
                                frame_objects.append(label)
                    
                    detected_per_frame.append(frame_objects)
                
                frame_count += 1
        
        except Exception as e:
            print(f"[ObjectDetector] Error during processing: {e}")
            return []

        finally:
            if cap:
                cap.release()
        
        print(f"[YOLO] Detected objects in {len(detected_per_frame)} frames")
        return detected_per_frame

