
from .processors.object_detector import ObjectDetector
from .processors import transcriber, face_analyzer, action_recognizer, place_classifier
from .processors.classifier import VisualIntelligenceValidator
from .model_loader import model_loader
import sys
from pathlib import Path

# Add parent directory to sys.path for sibling package imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import videos_collection
import os
import asyncio
from datetime import datetime

async def analyze_video(video_path: str, video_id: str):
    """
    Orchestrates the AI analysis pipeline.
    Run this as a background task.
    """
    print(f"[AI Service] Starting analysis for video: {video_id}")
    
    try:
        if not os.path.exists(video_path):
             print(f"[AI Service] Video file not found: {video_path}")
             return

        # 1. Update status to 'processing'
        await videos_collection().update_one(
            {"_id": video_id},
            {"$set": {"status": "processing"}}
        )

        # 2. Initialize Visual Intelligence Validator (Unified CLIP Processor)
        print(f"🎯 Initializing Visual Intelligence Validator...")
        validator = VisualIntelligenceValidator()
        
        # 3. Run Processors in Parallel
        print(f"🚀 Running AI Models in Parallel...")
        
        # Define wrappers for blocking calls
        def run_object_detection():
            print(f"Detecting Objects (per-frame)...")
            detector = ObjectDetector(model_loader.get_yolo())
            # Use detect_per_frame for validator integration
            return detector.detect_per_frame(video_path)

        def run_transcription():
            print(f"Transcribing Audio...")
            return transcriber.transcribe_audio(video_path)

        def run_scene_classification():
            print(f"Classifying Scene...")
            # Reuse the same validator instance
            return validator.classify_scene(video_path)
            
        def run_face_analysis():
            print(f"Analyzing Faces...")
            # Use the new FaceAnalyzer class
            analyzer = face_analyzer.FaceAnalyzer() 
            return analyzer.analyze_video(video_path)
            
        def run_action_recognition():
            print(f"Recognizing Actions...")
            recognizer = action_recognizer.ActionRecognizer()
            return recognizer.analyze_video(video_path)
            
        def run_place_classification():
            print(f"Classifying Place...")
            classifier = place_classifier.PlaceClassifier()
            return classifier.classify_place(video_path)

        # Execute concurrently
        raw_objects_per_frame, transcript, scene, faces, actions, places = await asyncio.gather(
            asyncio.to_thread(run_object_detection),
            asyncio.to_thread(run_transcription),
            asyncio.to_thread(run_scene_classification),
            asyncio.to_thread(run_face_analysis),
            asyncio.to_thread(run_action_recognition),
            asyncio.to_thread(run_place_classification)
        )
        
        # 3. Aggregate Results
        # Extract meaningful data from transcription result
        transcript_text = transcript.get("text", "")
        transcript_segments = transcript.get("segments", [])
        detected_language = transcript.get("language", "unknown")
        
        # Generate LLM queries FIRST (needed for validator)
        from .llm_query_generator import QueryGenerator
        
        # Flatten objects for LLM (use all detected, validator will filter later)
        all_detected_objects = list(set([obj for frame in raw_objects_per_frame for obj in frame]))
        
        print("🤖 [LLM] Generating intelligent search queries...")
        query_gen = QueryGenerator()
        
        json_summary = {
            "visual_objects": all_detected_objects,
            "audio_transcript": transcript_text[:500] if transcript_text else "",
            "scene_environment": places,
            "video_topic": [scene] if scene else [],
            "demographics": faces[0] if faces else {"gender": "Unknown", "age": "Unknown", "emotion": "Unknown"},
            "actions": actions
        }
        llm_result = query_gen.generate_query(json_summary)
        
        # 4. RUN VISUAL INTELLIGENCE VALIDATOR (3-Stage Pipeline)
        print("\n" + "="*80)
        print("🎯 Running Visual Intelligence & Search Validator...")
        print("="*80)
        
        # Reuse the same validator instance from above
        validated_result = await asyncio.to_thread(
            validator.process_video,
            video_path=video_path,
            raw_objects_per_frame=raw_objects_per_frame,
            transcript=transcript_text,
            places=places,
            actions=actions,
            faces=faces,
            scene=scene,
            llm_queries=llm_result.get('queries', [])
        )
        
        # Use VALIDATED outputs
        validated_objects = validated_result["validated_objects"]
        validated_queries = validated_result["validated_queries"]
        
        ai_metadata = {
            "objects": validated_objects,  # VALIDATED by CLIP
            "object_confidence_scores": validated_result["object_confidence_scores"],
            "transcript": transcript_text,
            "segments": transcript_segments,
            "language": detected_language,
            "scene": scene,
            "faces": faces,
            "actions": actions,
            "places": places,
            "search_queries": validated_queries,  # VALIDATED by FAISS similarity
            "query_scores": validated_result["query_scores"],
            "multimodal_context": validated_result["multimodal_context"],
            "analyzed_at": datetime.now()
        }
        
        print(f"✅ [AI Service] Analysis Complete for {video_id}!")
        print(f"   🔹 Scene: {scene}")
        print(f"   🔹 Places: {places}")
        print(f"   🔹 Validated Objects: {validated_objects}")
        print(f"   🔹 Actions: {actions}")
        print(f"   🔹 Language: {detected_language}")
        print(f"   🔹 Validated Queries: {validated_queries}")
        print(f"   🔹 Transcript: {transcript_text}" if transcript_text else "   🔹 Transcript: [Empty]")
        
        # Calculate video duration
        import cv2
        try:
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            duration_seconds = int(frame_count / fps) if fps > 0 else 0
            cap.release()
        except:
            duration_seconds = 0
        
        # Print JSON Summary (VALIDATED data)
        import json
        final_summary = {
            "validated_objects": validated_objects,  # CLIP-validated
            "audio_transcript": transcript_text[:500] if transcript_text else "",
            "scene_environment": places,
            "video_topic": [scene] if scene else [],
            "demographics": faces[0] if faces else {"gender": "Unknown", "age": "Unknown", "emotion": "Unknown"},
            "actions": actions,
            "validated_search_queries": validated_queries,  # FAISS-validated
            "video_duration": f"{duration_seconds}s"
        }
        
        print("\n" + "="*80)
        print("📊 FINAL AI ANALYSIS SUMMARY (VALIDATED)")
        print("="*80)
        print(json.dumps(final_summary, indent=2, ensure_ascii=False))
        print("="*80 + "\n")
        
        # Add LLM results to metadata
        ai_metadata["llm_generated"] = llm_result
        
        # Combine all tags: VALIDATED objects + scene + actions + places + LLM-generated tags
        llm_tags = llm_result.get("tags", [])
        all_tags = list(set(validated_objects + [scene] + actions + places + llm_tags))
        
        # 4. Save to Database with LLM-enhanced metadata
        await videos_collection().update_one(
            {"_id": video_id},
            {
                "$set": {
                    "ai_metadata": ai_metadata,
                    "status": "completed",
                    "smart_tags": all_tags
                }
            }
        )
        
        # Print Validation Summary
        print(f"\n{'='*80}")
        print("✅ VALIDATION SUMMARY")
        print(f"{'='*80}")
        print(f"📝 LLM Summary: {llm_result.get('summary', 'N/A')}")
        print(f"🎭 LLM Intent: {llm_result.get('intent', 'N/A')}")
        print(f"\n🔍 Top Validated Queries:")
        for i, query_obj in enumerate(validated_result['query_scores'][:3], 1):
            print(f"   {i}. '{query_obj['query']}' (similarity: {query_obj['score']:.4f})")
        print(f"\n🏷️  All Tags: {', '.join(all_tags[:10])}...")
        print(f"{'='*80}\n")
        
        # Cleanup temp file
        # os.remove(video_path) # Uncomment if you want to auto-delete local files

    except Exception as e:
        print(f"[AI Service] Analysis Failed: {e}")
        await videos_collection().update_one(
            {"_id": video_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
