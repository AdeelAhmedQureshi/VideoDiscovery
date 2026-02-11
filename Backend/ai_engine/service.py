
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
    Orchestrates the Self-Correcting Video Analysis Pipeline (Double-Check Loop).
    Strictly follows the Architecture Blueprint console output example.
    """
    print(f"\n[AI Service] Starting analysis for video: {video_id}\n")
    
    try:
        if not os.path.exists(video_path):
             return

        print(f"🎯 Initializing Visual Intelligence Validator...")
        validator = VisualIntelligenceValidator()
        
        print(f"🚀 Running AI Models in Parallel...")
        
        # Define wrappers for parallel execution
        def run_yolo():
            print(f"   Detecting Objects (per-frame)... Started")
            detector = ObjectDetector(model_loader.get_yolo())
            result = detector.detect_per_frame(video_path)
            print(f"   Detecting Objects (per-frame)... Finished")
            return result

        def run_whisper():
            print(f"   Transcribing Audio... Started")
            result = transcriber.transcribe_audio(video_path)
            print(f"   Transcribing Audio... Finished")
            return result

        def run_clip_scene():
            print(f"   Classifying Scene... Started")
            result = validator.classify_scene(video_path)
            print(f"   Classifying Scene... Finished")
            return result
            
        def run_deepface():
            print(f"   Analyzing Faces... Started")
            analyzer = face_analyzer.FaceAnalyzer() 
            result = analyzer.analyze_video(video_path)
            print(f"   Analyzing Faces... Finished")
            return result
            
        def run_slowfast():
            print(f"   Recognizing Actions... Started")
            recognizer = action_recognizer.ActionRecognizer()
            result = recognizer.analyze_video(video_path)
            print(f"   Recognizing Actions... Finished")
            return result
            
        def run_places():
            print(f"   Classifying Place... Started")
            classifier = place_classifier.PlaceClassifier()
            result = classifier.classify_place(video_path)
            print(f"   Classifying Place... Finished")
            return result

        # Execute concurrently (Performance Target: ~20s)
        print(f"🚀 [Orchestrator] Starting 6 parallel processing threads...")
        tasks = [
            asyncio.to_thread(run_yolo),
            asyncio.to_thread(run_whisper),
            asyncio.to_thread(run_clip_scene),
            asyncio.to_thread(run_deepface),
            asyncio.to_thread(run_slowfast),
            asyncio.to_thread(run_places)
        ]
        
        results = await asyncio.gather(*tasks)
        raw_objects_per_frame, transcript, scene, faces, actions, places = results
        print(f"✅ [Orchestrator] All 6 parallel tasks completed successfully.")
        
        # ==============================================================================
        # 🎯 Running Visual Intelligence & Search Validator...
        # ==============================================================================
        print(f"\n{'='*80}")
        print(f"🎯 Running Visual Intelligence & Search Validator...")
        print(f"{'='*80}\n")

        # STEP 3: INTELLIGENT QUERY GENERATION
        print(f"🤖 [LLM] Generating intelligent search queries...")
        from .llm_query_generator import QueryGenerator
        query_gen = QueryGenerator()
        
        # Summarize unique objects for LLM
        unique_objects = list(set([obj for frame in raw_objects_per_frame for obj in frame]))
        
        json_summary = {
            "visual_objects": unique_objects,
            "audio_transcript": transcript.get("text", "")[:500],
            "scene_environment": places,
            "video_topic": [scene],
            "demographics": faces[0] if faces else {},
            "actions": actions
        }
        
        llm_result = query_gen.generate_query(json_summary)
        candidate_queries = llm_result.get('queries', [])
        
        # PHASE 1: CLIP Object Validation
        phase1_result = await asyncio.to_thread(validator.process_video_frames, video_path, raw_objects_per_frame)
        validated_objects = phase1_result["validated_objects"]
        
        # PHASE 2: Multimodal Context Synthesis
        context = validator.synthesize_context(
            validated_objects=validated_objects,
            transcript=transcript.get("text", ""),
            places=places,
            actions=actions,
            faces=faces,
            scene=scene
        )
        
        # PHASE 3: LLM Query Validation (FAISS Search)
        validated_queries_data = await asyncio.to_thread(validator.rank_and_select_queries, candidate_queries)
        validated_queries = [q["query"] for q in validated_queries_data]

        print(f"✅ [AI Service] Analysis Complete for {video_id}!")
        print(f"   🔹 Scene: {scene}")
        print(f"   🔹 Places: {places}")
        print(f"   🔹 Validated Objects: {validated_objects}")
        print(f"   🔹 Actions: {actions}")
        print(f"   🔹 Language: {transcript.get('language', 'unknown')}")
        print(f"   🔹 Validated Queries: {validated_queries[:3]}")
        print(f"   🔹 Transcript: {transcript.get('text', '')[:100]}...")

        # FINAL AI ANALYSIS SUMMARY
        import json
        final_summary = {
            "validated_objects": validated_objects,
            "audio_transcript": transcript.get("text", "")[:100] + "...",
            "scene_environment": places,
            "video_topic": [scene],
            "demographics": faces[0] if faces else {},
            "actions": actions,
            "validated_search_queries": validated_queries,
            "video_duration": f"{len(raw_objects_per_frame)}s" # approx
        }
        
        print(f"\n{'='*80}")
        print(f"📊 FINAL AI ANALYSIS SUMMARY (VALIDATED)")
        print(f"{'='*80}")
        print(json.dumps(final_summary, indent=2))
        print(f"{'='*80}\n")

        # Save to Database
        # Convert any numpy types to standard Python types for MongoDB compatibility
        def fix_types(obj):
            if isinstance(obj, dict):
                return {k: fix_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [fix_types(i) for i in obj]
            elif hasattr(obj, 'item'): # Handle numpy/torch scalars
                return obj.item()
            return obj

        ai_metadata = fix_types({
            "objects": validated_objects,
            "object_confidence_scores": phase1_result["object_scores"],
            "transcript": transcript.get("text", ""),
            "segments": transcript.get("segments", []),
            "language": transcript.get("language", "unknown"),
            "scene": scene,
            "faces": faces,
            "actions": actions,
            "places": places,
            "search_queries": validated_queries,
            "query_scores": validated_queries_data,
            "multimodal_context": context,
            "llm_generated": llm_result,
            "analyzed_at": datetime.now()
        })

        all_tags = list(set(validated_objects + [scene] + actions + places + llm_result.get("tags", [])))
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

    except Exception as e:
        print(f"❌ [AI Service] Critical Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        await videos_collection().update_one(
            {"_id": video_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

