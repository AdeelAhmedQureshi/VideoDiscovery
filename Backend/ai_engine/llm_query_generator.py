import os
import re
import requests
import json
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LLM_API_KEY = os.getenv('LLM_API_KEY')
# Groq API endpoint (OpenAI-compatible)
LLM_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class QueryGenerator:
    """
    Intelligent Video Search Query Generator.
    Analyzes video metadata to generate highly relevant, human-like search queries.
    """
    
    def __init__(self):
        self.api_key = LLM_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_query(self, metadata: Dict, filename: str = None) -> Dict[str, any]:
        """
        Generate 8 optimized search queries following strict topic priority and noise removal rules.
        More candidates are generated so that FAISS validation can select the best 3.
        
        Args:
            metadata: Dictionary containing AI analysis results
        
        Returns:
            Dictionary with queries list and metadata for backward compatibility.
        """
        
        # Build prompt for LLM (include sanitized filename when provided)
        metadata_for_prompt = dict(metadata) if metadata else {}
        if filename:
            metadata_for_prompt['filename'] = filename
        prompt_content = self._build_prompt(metadata_for_prompt)
        
        try:
            response = requests.post(
                LLM_API_URL,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": """You are a precision video search query generator optimized for maximum retrieval accuracy.

You will receive structured video metadata in JSON format.
Your task is to analyze ALL metadata signals and generate highly specific, accurate search queries that will retrieve the MOST SIMILAR videos on YouTube.

Follow these rules strictly:

1. PRIORITY ORDER for identifying the dominant topic:
   a) Audio transcript — extract EXACT named entities (people, brands, shows, events, products)
   b) Specific keywords and phrases from the transcript (use verbatim terms when possible)
   c) Scene environment + video topic combined
   d) Validated objects (only specific ones, never generic)
   e) Actions (only if they define the core activity)

2. STRICT noise removal:
   - NEVER include generic objects: "person", "human", "face", "clothing", "hand"
   - NEVER include vague actions: "standing", "sitting", "walking"
   - NEVER include technical terms or metadata
   - NEVER repeat words across queries
   - NEVER hallucinate — only use information present in the metadata

3. Query construction:
   - EACH query MUST be 5-8 words long (STRICT)
   - Use SPECIFIC nouns and verbs, not generic ones
   - Include brand names, show names, or person names if found in transcript
   - Each query should target a DIFFERENT ANGLE of the same video topic
   - Queries must work as YouTube search strings

4. DIVERSITY requirement:
   - Query 1-3: Directly about the main topic (most specific)
   - Query 4-5: Related subtopics or context
   - Query 6-8: Broader but still relevant variations

5. Return exactly 8 optimized search queries ranked from most specific to broader.

86: DRAMA / SERIES / EPISODE / MOVIE detection (CRITICAL):
   If the transcript contains dialogue that sounds like a TV show, drama, web series, movie, or episodic content:
   - Look for character names, show/series names, or famous dialogue lines in the transcript
   - Look for emotional dialogue, dramatic scenes, background music cues mentioned
   - If you detect this is from a known show, series, or movie, use the EXACT show name in queries
   - If the show name is uncertain but it looks like drama/series content, use descriptive queries like:
     "drama scene [key dialogue phrase]" or "[language] drama [topic] scene"
   - For regional content (Urdu/Hindi/Korean/Turkish drama), include the language/region

7. MULTI-LANGUAGE QUERY GENERATION (CRITICAL):
   If the 'audio_language' is NOT English (e.g., urdu, hindi, spanish, etc.):
   - At least 3-4 queries MUST be in the native language's Romanized script (e.g., Roman Urdu/Hindi like "kya haal hai" instead of native script).
   - At least 1-2 queries MUST be in the actual native script if applicable (e.g., Urdu/Hindi script).
   - The remaining queries should be the English translation of the core topic.
   - Example for Urdu: generate queries like "best pakistani drama scene", "aj ka episode", "آج کا ایپی سوڈ".

8. MEDIA CONTENT PRIORITY:
   When the video appears to be a clip from existing media (not original/user-created content):
   - At least 2-3 queries MUST include the show/movie/series name if identifiable
   - Include episode-related terms: "episode", "scene", "clip", "drama"
   - Include character names if mentioned in transcript
   - Use exact memorable dialogue quotes (3-5 words) as search terms

Output format:
Return ONLY a JSON array of 8 strings. No markdown, no explanations."""
                        },
                        {
                            "role": "user",
                            "content": f"VIDEO METADATA (JSON):\n{json.dumps(prompt_content, indent=2)}"
                        }
                    ],
                    "temperature": 0.2, # Very low temperature for maximum precision
                    "max_tokens": 400
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result['choices'][0]['message']['content'].strip()
                
                # Cleanup markdown if necessary
                if generated_text.startswith("```"):
                    lines = generated_text.split("\n")
                    generated_text = "\n".join(lines[1:-1]) if lines[0].startswith("```") else "\n".join(lines[1:-1])

                # Parse JSON array
                queries = json.loads(generated_text)
                
                if not isinstance(queries, list):
                    raise ValueError("LLM did not return a JSON array")

                # Wrap for backend compatibility
                parsed = {
                    "summary": queries[0] if queries else "Video content",
                    "intent": "Intelligent Search",
                    "queries": queries[:8],
                    "semantic_tags": metadata.get('actions', []) + metadata.get('scene_environment', []),
                    "search_query": queries[0] if queries else "",
                    "tags": metadata.get('actions', []) + metadata.get('scene_environment', [])
                }
                
                print(f"[LLM/Search] Generated {len(queries)} candidate search queries (top 3 will be selected by FAISS)")
                return parsed
            else:
                print(f"[LLM/Search] API Error {response.status_code}: {response.text}")
                return self._fallback_query(metadata)
                
        except Exception as e:
            print(f"[LLM/Search] Error: {e}")
            return self._fallback_query(metadata)
    
    def _build_prompt(self, metadata: Dict) -> Dict:
        """Filter and format metadata for the LLM prompt."""
        
        def _sanitize_filename(fn: str) -> str:
            if not fn:
                return ""
            s = fn
            # Remove common file extensions
            s = re.sub(r"\.[a-zA-Z0-9]{1,5}$", "", s)
            # Remove hashtags
            s = re.sub(r"#\w+", "", s)
            # Remove emoji / non-ascii characters (keeps most readable text)
            s = re.sub(r"[^\x00-\x7F]+", " ", s)
            # Remove 'by <channel>' patterns
            s = re.sub(r"\bby\b\s+[A-Za-z0-9 _\-]{1,100}", "", s, flags=re.IGNORECASE)
            # Collapse whitespace
            s = re.sub(r"\s+", " ", s).strip()
            return s

        # Filter common noise from objects
        noise_to_ignore = ["person", "clothing", "human", "face"]
        objects = [obj for obj in metadata.get('visual_objects', metadata.get('validated_objects', []))
                  if obj.lower() not in noise_to_ignore]

        prompt = {
            "validated_objects": objects[:10],
            "audio_transcript": metadata.get('audio_transcript', '')[:500],
            "scene_environment": metadata.get('scene_environment', [])[:3],
            "video_topic": metadata.get('video_topic', [])[:2],
            "demographics": metadata.get('demographics', {}),
            "actions": metadata.get('actions', [])[:5]
        }

        # Include a sanitized filename to guide concise query generation (if provided)
        if filename := metadata.get('filename') or metadata.get('file_name') or None:
            # Prefer filename in metadata if already set; otherwise will be passed explicitly
            prompt['filename'] = _sanitize_filename(filename)
        return prompt
    
    def _fallback_query(self, metadata: Dict) -> Dict:
        """Generate a basic fallback query array if LLM fails."""
        
        objects = metadata.get('visual_objects', metadata.get('validated_objects', []))[:3]
        places = metadata.get('scene_environment', [])[:2]
        
        main_query = " ".join(objects + places)
        queries = [
            f"Video of {main_query}",
            f"Show me {', '.join(objects)}",
            f"{' '.join(places)} video",
            f"Clip featuring {', '.join(objects)}",
            f"Search for {main_query}"
        ]
        
        return {
            "summary": "AI analyzed video content",
            "intent": "Fallback Search",
            "queries": queries,
            "semantic_tags": objects + places,
            "search_query": queries[0]
        }

