
from .processors.object_detector import ObjectDetector
from .processors import transcriber, face_analyzer, action_recognizer, place_classifier
from .processors.classifier import VisualIntelligenceValidator
from .model_loader import model_loader
import sys
from pathlib import Path

# Add parent directory to sys.path for sibling package imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import videos_collection, recommendations_collection
from app.utils.helper_functions import generate_id
import os
import asyncio
from datetime import datetime


async def _update_progress(video_id: str, progress: int, stage: str):
    """Update the processing progress in the video document."""
    await videos_collection().update_one(
        {"_id": video_id},
        {"$set": {
            "processing_progress": progress,
            "processing_stage": stage
        }}
    )
    print(f"[Progress] {progress}% — {stage}")


async def analyze_video(video_path: str, video_id: str):
    """
    Orchestrates the Self-Correcting Video Analysis Pipeline (Double-Check Loop).
    Writes real-time progress to the video document for frontend polling.
    """
    print(f"\n[AI Service] Starting analysis for video: {video_id}\n")
    
    try:
        if not os.path.exists(video_path):
             return

        # ── 5% Starting ──
        await _update_progress(video_id, 5, "Initializing AI models...")

        print(f"Initializing Visual Intelligence Validator...")
        validator = VisualIntelligenceValidator()
        
        # ── 10% Models running ──
        await _update_progress(video_id, 10, "Running 6 AI models in parallel...")

        print(f"Running AI Models in Parallel...")
        
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
        print(f"[Orchestrator] Starting 6 parallel processing threads...")
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
        print(f"[Orchestrator] All 6 parallel tasks completed successfully.")

        # ── 40% All models done ──
        await _update_progress(video_id, 40, "All models completed. Running validation...")

        # ==============================================================================
        # Running Visual Intelligence & Search Validator...
        # ==============================================================================
        print(f"\n{'='*80}")
        print(f"Running Visual Intelligence & Search Validator...")
        print(f"{'='*80}\n")

        # ── 55% CLIP validation ──
        await _update_progress(video_id, 55, "Validating objects with CLIP...")

        # STEP 3: INTELLIGENT QUERY GENERATION
        print(f"[LLM] Generating intelligent search queries...")
        from .llm_query_generator import QueryGenerator
        query_gen = QueryGenerator()
        
        # Summarize unique objects for LLM
        unique_objects = list(set([obj for frame in raw_objects_per_frame for obj in frame]))
        
        json_summary = {
            "visual_objects": unique_objects,
            "audio_transcript": transcript.get("text", "")[:500] if transcript.get("has_meaningful_speech", True) else "",
            "audio_language": transcript.get("language", "unknown"),
            "has_meaningful_speech": transcript.get("has_meaningful_speech", True),
            "scene_environment": places,
            "video_topic": [scene],
            "demographics": faces[0] if faces else {},
            "actions": actions
        }

        # ── 70% LLM query generation ──
        await _update_progress(video_id, 70, "Generating search queries with LLM...")

        llm_result = query_gen.generate_query(json_summary)
        candidate_queries = llm_result.get('queries', [])
        
        # PHASE 1: CLIP Object Validation
        phase1_result = await asyncio.to_thread(validator.process_video_frames, video_path, raw_objects_per_frame)
        validated_objects = phase1_result["validated_objects"]
        
        # PHASE 2: Multimodal Context Synthesis
        context = validator.synthesize_context(
            validated_objects=validated_objects,
            transcript=transcript.get("text", "") if transcript.get("has_meaningful_speech", True) else "",
            places=places,
            actions=actions,
            faces=faces,
            scene=scene
        )

        # ── 85% FAISS validation ──
        await _update_progress(video_id, 85, "Validating queries with FAISS...")

        # PHASE 3: LLM Query Validation (FAISS Search)
        validated_queries_data = await asyncio.to_thread(validator.rank_and_select_queries, candidate_queries)
        validated_queries = [q["query"] for q in validated_queries_data]

        print(f"[AI Service] Analysis Complete for {video_id}!")
        print(f"   - Scene: {scene}")
        print(f"   - Places: {places}")
        print(f"   - Validated Objects: {validated_objects}")
        print(f"   - Actions: {actions}")
        print(f"   - Language: {transcript.get('language', 'unknown')}")
        print(f"   - Validated Queries: {validated_queries[:3]}")
        print(f"   - Transcript: {transcript.get('text', '')[:100]}...")

        # ── 95% Saving to DB ──
        await _update_progress(video_id, 95, "Saving analysis results...")

        # FINAL AI ANALYSIS SUMMARY
        import json
        final_summary = {
            "validated_objects": validated_objects,
            "audio_transcript": transcript.get("text", "")[:100] + "..." if transcript.get("has_meaningful_speech", True) else "No meaningful speech",
            "scene_environment": places,
            "video_topic": [scene],
            "demographics": faces[0] if faces else {},
            "actions": actions,
            "validated_search_queries": validated_queries,
            "video_duration": f"{len(raw_objects_per_frame)}s" # approx
        }
        
        print(f"\n{'='*80}")
        print(f"FINAL AI ANALYSIS SUMMARY (VALIDATED)")
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
                    "processing_progress": 100,
                    "processing_stage": "Analysis complete!",
                    "smart_tags": all_tags
                }
            }
        )

        # ── 100% Done ──
        print(f"[Progress] 100% — Analysis complete!")

        # ======================================================================
        # PHASE 4: Multi-Platform Discovery — YouTube + Dailymotion → CLIP re-rank → top 5
        # ======================================================================
        print(f"\n[Discovery] Fetching video recommendations for video {video_id}...")
        print(f"[Discovery] Using top {len(validated_queries)} queries, fetching from YouTube + Dailymotion...")
        try:
            from app.services.youtube_service import search_youtube
            from app.services.dailymotion_service import search_dailymotion

            if validated_queries:
                # Fetch from YouTube (5 per query) + Dailymotion (3 per query) concurrently
                async def fetch_for_query(query):
                    yt_results, dm_results = await asyncio.gather(
                        search_youtube(query, max_results=5),
                        search_dailymotion(query, max_results=3),
                    )
                    return {"query": query, "youtube": yt_results, "dailymotion": dm_results}

                fetch_tasks = [fetch_for_query(q) for q in validated_queries]
                all_results = await asyncio.gather(*fetch_tasks)

                # Flatten all results into a single list
                all_videos = []
                yt_count = 0
                dm_count = 0
                for entry in all_results:
                    query = entry["query"]
                    for result in entry["youtube"]:
                        result["search_query_used"] = query
                        all_videos.append(result)
                        yt_count += 1
                    for result in entry["dailymotion"]:
                        result["search_query_used"] = query
                        all_videos.append(result)
                        dm_count += 1
                
                print(f"[Discovery] Fetched {len(all_videos)} total videos (YouTube: {yt_count}, Dailymotion: {dm_count})")

                # Build context string from the uploaded video's AI analysis
                # This gives the re-ranker S3 (Context Match) signal: comparing
                # candidate video metadata against what our AI detected in the input
                context_parts = []
                # Only include speech if it's meaningful
                valid_speech = transcript.get("text", "") if transcript.get("has_meaningful_speech", True) else ""
                if valid_speech:
                    context_parts.append(f"Speech: {valid_speech[:300]}")
                if validated_objects:
                    context_parts.append(f"Objects: {', '.join(validated_objects)}")
                if scene:
                    context_parts.append(f"Scene: {scene}")
                if actions:
                    context_parts.append(f"Actions: {', '.join(actions)}")
                if places:
                    context_parts.append(f"Environment: {', '.join(places)}")
                video_context = ". ".join(context_parts) if context_parts else None
                
                if video_context:
                    print(f"[Discovery] Built video context for re-ranking ({len(video_context)} chars)")

                # CLIP Re-rank: Score ALL videos with 3-signal deep comparison
                top_videos = await asyncio.to_thread(
                    validator.rerank_youtube_results, all_videos, 5, None, video_context
                )

                # Get user_id from the video document
                video_doc = await videos_collection().find_one({"_id": video_id})
                vid_user_id = video_doc.get("user_id", "") if video_doc else ""

                # Store only the top 5 CLIP-ranked videos
                rec_docs = []
                for rank, result in enumerate(top_videos):
                    rec_docs.append({
                        "_id": generate_id("rec"),
                        "recommendation_id": generate_id("rec"),
                        "uploaded_video_id": video_id,
                        "user_id": vid_user_id,
                        "youtube_video_id": result["youtube_video_id"],
                        "title": result["title"],
                        "thumbnail_url": result["thumbnail"],
                        "channel_title": result["channel"],
                        "views": result["views"],
                        "view_count": result["view_count"],
                        "uploaded_at_text": result["uploadedAt"],
                        "published_at": result.get("published_at", ""),
                        "duration": result["duration"],
                        "video_link": result["url"],
                        "similarity": result["similarity"],  # Real CLIP combined score
                        "clip_faiss_score": result.get("_faiss_score", 0),
                        "clip_richtext_score": result.get("_richtext_score", 0),
                        "clip_context_score": result.get("_context_score", 0),
                        "above_threshold": result.get("above_threshold", False),
                        "search_query_used": result.get("search_query_used", ""),
                        "platform": result.get("platform", "youtube"),
                        "rank": rank + 1,
                        "fetched_at": datetime.now(),
                    })

                if rec_docs:
                    await recommendations_collection().insert_many(rec_docs)
                    print(f"[Discovery] Stored top {len(rec_docs)} CLIP-ranked recommendations for video {video_id}")
                else:
                    print(f"[Discovery] No videos survived CLIP re-ranking")
            else:
                print(f"[Discovery] No validated queries available for YouTube search")
        except Exception as yt_err:
            print(f"[Discovery] YouTube fetch failed (non-critical): {yt_err}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"[AI Service] Critical Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        await videos_collection().update_one(
            {"_id": video_id},
            {"$set": {
                "status": "failed",
                "error": str(e),
                "processing_progress": 0,
                "processing_stage": f"Error: {str(e)[:100]}"
            }}
        )
    finally:
        # Clean up temp video file to prevent disk space buildup
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
                print(f"[Cleanup] Deleted temp video: {video_path}")
            except Exception as cleanup_err:
                print(f"[Cleanup] Failed to delete temp video: {cleanup_err}")
