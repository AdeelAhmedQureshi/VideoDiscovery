import os
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
    
    def generate_query(self, metadata: Dict) -> Dict[str, any]:
        """
        Generate 5 optimized search queries following strict topic priority and noise removal rules.
        
        Args:
            metadata: Dictionary containing AI analysis results
        
        Returns:
            Dictionary with queries list and metadata for backward compatibility.
        """
        
        # Build prompt for LLM
        prompt_content = self._build_prompt(metadata)
        
        try:
            response = requests.post(
                LLM_API_URL,
                headers=self.headers,
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": """You are an intelligent video search query generator.

You will receive structured video metadata in JSON format.
Your task is to analyze the entire metadata and generate short, highly relevant, and accurate search queries.

Follow these rules strictly:

1. Identify the dominant topic using:
   - Audio transcript (highest priority)
   - Named entities (people, brands, shows, events)
   - Scene environment
   - Video topic
   - Validated objects
   - Actions (only if contextually relevant)

2. Remove noise:
   - Ignore generic objects like "person"
   - Ignore random or low-confidence actions
   - Ignore technical metadata
   - Do not repeat unnecessary words

3. Generate short queries:
   - EACH individual query MUST be between 5 and 8 words long (STRICT).
   - If a query is less than 5 words, expand it with relevant context.
   - If a query is more than 8 words, trim it while keeping core keywords.
   - No filler words, punctuation, hashtags, or explanations.

4. Queries must:
   - Be contextually accurate
   - Reflect the dominant theme
   - Be suitable for YouTube search
   - Avoid hallucination

5. Return exactly 5 optimized search queries ranked from most relevant to less relevant.

Output format:
Return only a JSON array of strings. Do not include markdown formatting like ```json or any other text."""
                        },
                        {
                            "role": "user",
                            "content": f"VIDEO METADATA (JSON):\n{json.dumps(prompt_content, indent=2)}"
                        }
                    ],
                    "temperature": 0.3, # Low temperature for high precision and compliance
                    "max_tokens": 300
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
                    "queries": queries[:5],
                    "semantic_tags": metadata.get('actions', []) + metadata.get('scene_environment', []),
                    "search_query": queries[0] if queries else ""
                }
                
                print(f"[LLM/Search] Generated {len(queries)} optimized search queries")
                return parsed
            else:
                print(f"[LLM/Search] API Error {response.status_code}: {response.text}")
                return self._fallback_query(metadata)
                
        except Exception as e:
            print(f"[LLM/Search] Error: {e}")
            return self._fallback_query(metadata)
    
    def _build_prompt(self, metadata: Dict) -> Dict:
        """Filter and format metadata for the LLM prompt."""
        
        # Filter common noise from objects
        noise_to_ignore = ["person", "clothing", "human", "face"]
        objects = [obj for obj in metadata.get('visual_objects', metadata.get('validated_objects', [])) 
                  if obj.lower() not in noise_to_ignore]
        
        return {
            "validated_objects": objects[:10],
            "audio_transcript": metadata.get('audio_transcript', '')[:500],
            "scene_environment": metadata.get('scene_environment', [])[:3],
            "video_topic": metadata.get('video_topic', [])[:2],
            "demographics": metadata.get('demographics', {}),
            "actions": metadata.get('actions', [])[:5]
        }
    
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

