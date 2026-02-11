
import cv2
import numpy as np
from deepface import DeepFace
from collections import Counter
from typing import List, Dict, Any

class FaceAnalyzer:
    def analyze_video(self, video_path: str) -> List[Dict[str, Any]]:
        """
        Analyzes the video by sampling frames at 1 FPS and aggregating demographic data.
        Returns a summary of the dominant face's attributes.
        """
        # No log here, relying on orchestrator's Phase header
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[FaceAnalyzer] Could not open video: {video_path}")
            return []

        try:
            fps = cap.get(cv2.CAP_PROP_FPS)
            if fps <= 0: fps = 30
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps
            
            # Strategy: Analyze 1 frame per second
            frame_interval = int(fps)
            if frame_interval < 1: frame_interval = 1
            
            print(f"[FaceAnalyzer] Video Duration: {duration:.1f}s, Sampling every {frame_interval} frames.")

            valid_detections = []
            frame_count = 0
            processed_count = 0

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Process every Nth frame
                if frame_count % frame_interval == 0:
                    try:
                        # DeepFace Analysis
                        # enforce_detection=False prevents raising exception if no face found
                        # detector_backend='opencv' is fastest
                        results = DeepFace.analyze(
                            img_path=frame,
                            actions=['age', 'gender', 'emotion'],
                            detector_backend='opencv',
                            enforce_detection=False,
                            silent=True
                        )
                        
                        if results:
                            # DeepFace returns a list of faces. We focus on the largest/most confident one.
                            # The list is usually sorted by size or confidence depending on backend, 
                            # but we'll just take the first one for the summary.
                            face_data = results[0]
                            
                            # Filter out low-confidence detections if possible 
                            # (DeepFace analyze object doesn't always have confidence score exposed simply in all versions,
                            # but we check if it has valid attributes)
                            if face_data.get('age') and face_data.get('dominant_gender'):
                                valid_detections.append(face_data)
                                processed_count += 1
                                
                    except Exception as e:
                        # Frame analysis failed (no face, or blurred)
                        pass
                
                frame_count += 1

            # --- Aggregation Logic ---
            if not valid_detections:
                print("[FaceAnalyzer] No faces detected in the entire video.")
                return []

            print(f"[FaceAnalyzer] Aggregating results from {len(valid_detections)} samples...")

            # 1. Age (Mean)
            ages = [d['age'] for d in valid_detections]
            avg_age = int(sum(ages) / len(ages))

            # 2. Gender (Mode)
            genders = [d['dominant_gender'] for d in valid_detections]
            dominant_gender = Counter(genders).most_common(1)[0][0]

            # 3. Emotion (Mode and Weighted Score)
            emotions = [d['dominant_emotion'] for d in valid_detections]
            dominant_emotion = Counter(emotions).most_common(1)[0][0]
            
            # Calculate consistency of the dominant emotion
            emotion_consistency = (emotions.count(dominant_emotion) / len(emotions)) * 100

            summary = {
                "age": avg_age,
                "gender": dominant_gender,
                "emotion": dominant_emotion,
                "emotion_confidence": round(emotion_consistency, 1),
                "samples_analyzed": len(valid_detections)
            }

            print(f"[DEEPFACE] Result: {dominant_gender}, Age ~{avg_age}, {dominant_emotion.title()} ({emotion_consistency:.1f}%)")
            
            return [summary]

        except Exception as e:
            print(f"[FaceAnalyzer] Critical error: {e}")
            return []
            
        finally:
            cap.release()
