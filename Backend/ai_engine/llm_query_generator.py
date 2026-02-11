import os
import requests
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LLM_API_KEY = os.getenv('LLM_API_KEY')
# Groq API endpoint (OpenAI-compatible)
LLM_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class QueryGenerator:
    """
    Generates intelligent search queries based on video AI metadata.
    Uses Groq's fast LLM API with Llama model.
    """
    
    def __init__(self):
        self.api_key = LLM_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_query(self, metadata: Dict) -> Dict[str, any]:
        """
        Generate intelligent semantic search queries from AI metadata using Groq API.
        
        Args:
            metadata: Dictionary containing AI analysis results
        
        Returns:
            Dictionary with summary, intent, queries, and semantic_tags
        """
        
        # Build prompt for LLM
        prompt = self._build_prompt(metadata)
        
        # Call Groq API with OpenAI-compatible format
        try:
            response = requests.post(
                LLM_API_URL,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": """You are VideoDiscoveryAI, an intelligent video understanding and search assistant.

Your task is to convert structured video analysis metadata into meaningful semantic search queries.

The metadata describes what happens inside a video using objects, actions, scenes, speech, and emotions detected by AI models.

Your goal is to THINK like a human searching on YouTube or Google.

You must:
1. Understand the overall context and purpose of the video.
2. Infer the main topic and user intent.
3. Generate natural, human-like search queries (not raw keywords).
4. Produce diverse queries that cover different phrasings.
5. Avoid repeating words or robotic combinations of tags.
6. Use semantic understanding, not simple keyword joining.
7. If transcription is in urdu+hindi, queries should be in roman urdu.

Guidelines:
- Queries should sound like real search phrases people type.
- Keep each query short (3–8 words).
- Do not include explanations.
- Do not repeat the same wording.
- Do not output sentences or paragraphs.
- Do not output anything except valid JSON.

Output format (STRICT JSON only):
{
  "summary": "One-sentence description of the video",
  "intent": "Main purpose of the video",
  "queries": ["query1", "query2", "query3", "query4", "query5"],
  "semantic_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}"""
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 400,
                    "response_format": {"type": "json_object"}
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result['choices'][0]['message']['content']
                
                # Parse JSON response
                parsed = self._parse_llm_response(generated_text)
                
                print(f"✅ [LLM/Groq] Generated semantic queries")
                print(f"   📝 Summary: {parsed.get('summary', 'N/A')[:80]}...")
                print(f"   🎯 Intent: {parsed.get('intent', 'N/A')}")
                print(f"   🔍 Queries: {len(parsed.get('queries', []))} variations")
                print(f"   🏷️  Tags: {parsed.get('semantic_tags', [])}")
                
                return parsed
            else:
                print(f"⚠️ [LLM/Groq] API Error {response.status_code}: {response.text}")
                return self._fallback_query(metadata)
                
        except Exception as e:
            print(f"❌ [LLM/Groq] Error: {e}")
            return self._fallback_query(metadata)
    
    def _build_prompt(self, metadata: Dict) -> str:
        """Build a semantic context-rich prompt for the LLM."""
        
        # Extract metadata
        objects = metadata.get('visual_objects', [])
        transcript = metadata.get('audio_transcript', '')
        places = metadata.get('scene_environment', [])
        topic = metadata.get('video_topic', [])
        actions = metadata.get('actions', [])
        demographics = metadata.get('demographics', {})
        duration = metadata.get('video_duration', 'Unknown')
        
        # Format for better context
        objects_str = ", ".join(objects[:10]) if objects else "None visible"
        places_str = ", ".join(places[:3]) if places else "Unknown location"
        topic_str = ", ".join(topic[:2]) if topic else "General content"
        actions_str = ", ".join(actions[:5]) if actions else "No specific actions"
        
        # Demographics
        person_desc = "Not visible"
        if demographics.get('gender') and demographics.get('gender') != 'Unknown':
            gender = demographics.get('gender', '')
            age = demographics.get('age', '')
            emotion = demographics.get('emotion', '')
            person_desc = f"{gender}, ~{age} years old, {emotion} expression"
        
        # Transcript handling
        transcript_preview = transcript[:400] if transcript else "No speech detected"
        
        prompt = f"""VIDEO METADATA:

🎬 Visual Content:
   - Objects: {objects_str}
   - Setting: {places_str}
   - Theme: {topic_str}
   - Duration: {duration}

🎭 Human Presence:
   - {person_desc}

🎯 Activity:
   - Actions: {actions_str}

🗣️ Audio Transcription:
   "{transcript_preview}"

Analyze this video and generate semantic search queries that real users would type when looking for this content."""

        return prompt
    
    def _parse_llm_response(self, text: str) -> Dict:
        """Parse JSON response from LLM."""
        
        import json
        
        try:
            # Try to parse as JSON
            result = json.loads(text)
            
            # Validate required fields
            if not isinstance(result.get('queries'), list):
                result['queries'] = []
            if not isinstance(result.get('semantic_tags'), list):
                result['semantic_tags'] = []
            
            # Ensure we have the main search query (use first query)
            result['search_query'] = result['queries'][0] if result.get('queries') else result.get('summary', '')
            
            return result
            
        except json.JSONDecodeError:
            print(f"⚠️ [LLM] Failed to parse JSON, using fallback")
            # Return minimal structure if JSON parsing fails
            return {
                "summary": "Video content",
                "intent": "General",
                "queries": [],
                "semantic_tags": [],
                "search_query": ""
            }
    
    def _fallback_query(self, metadata: Dict) -> Dict:
        """Generate a simple fallback query if LLM fails."""
        
        objects = metadata.get('visual_objects', [])[:3]
        places = metadata.get('scene_environment', [])[:2]
        actions = metadata.get('actions', [])[:2]
        
        # Simple concatenation for fallback
        query_parts = objects + places + actions
        main_query = " ".join(query_parts[:5])
        
        # Generate basic variations
        queries = [
            main_query,
            " ".join(objects + actions) if objects and actions else main_query,
            " ".join(places + actions) if places and actions else main_query
        ]
        
        # Remove duplicates and empty
        queries = list(dict.fromkeys([q for q in queries if q.strip()]))[:5]
        
        return {
            "summary": f"Video featuring {', '.join(objects[:3])}" if objects else "Video content",
            "intent": "General video content",
            "queries": queries if queries else [main_query],
            "semantic_tags": (objects + actions)[:5],
            "search_query": main_query
        }

