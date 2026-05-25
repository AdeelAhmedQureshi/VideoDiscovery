
import os
import shutil
import imageio_ffmpeg
import ffmpeg
from ..model_loader import model_loader
from ..config import TEMP_VIDEO_DIR

# 0. Setup FFmpeg Binary globally for Whisper
def setup_ffmpeg():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    base_dir = os.path.dirname(ffmpeg_exe)
    target_path = os.path.join(base_dir, "ffmpeg.exe")
    
    # Create shim if it doesn't exist (Whisper expects 'ffmpeg' command)
    if not os.path.exists(target_path):
        try:
            shutil.copy(ffmpeg_exe, target_path)
        except Exception as e:
            print(f"[Transcriber] Failed to create ffmpeg shim: {e}")
            
    # Add to PATH so Whisper can find it
    if base_dir not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + base_dir
        # print(f"✅ [Transcriber] Added FFmpeg to PATH: {base_dir}")

setup_ffmpeg()

def transcribe_audio(video_path):
    """
    Extracts audio from video and runs Whisper for transcription.
    Returns a dictionary: {'text': str, 'segments': list, 'language': str}
    """
    temp_audio_path = os.path.join(TEMP_VIDEO_DIR, f"temp_audio_{os.path.basename(video_path)}.wav")
    
    # Get the actual ffmpeg executable path from imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    try:
        # 1. Extraction: Extract audio to temporary WAV file
        # Check if video exists first
        if not os.path.exists(video_path):
            print(f"[Transcriber] File not found: {video_path}")
            return {'text': "", 'segments': [], 'language': "error"}

        try:
            # -ac 1: Mono channel (Whisper mixes to mono anyway)
            # -ar 16000: 16kHz sample rate (Whisper native)
            # -vn: No video
            # -y: Overwrite output
            (
                ffmpeg
                .input(video_path)
                .output(temp_audio_path, ac=1, ar=16000, loglevel="error", vn=None)
                .run(cmd=ffmpeg_exe, overwrite_output=True, capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            if "Output file does not contain any stream" in error_msg:
                print(f"[Transcriber] Video contains no audio track. Skipping transcription.")
                return {'text': "", 'segments': [], 'language': "silent"}
            else:
                print(f"[Transcriber] Audio extraction failed: {error_msg}")
                return {'text': "", 'segments': [], 'language': "error"}

        # 2. Transcription using Whisper
        model = model_loader.get_whisper()
        model = model_loader.get_whisper()
        
        # verbose=False reduces console spam
        # language=None allows auto-detection
        result = model.transcribe(temp_audio_path, verbose=False)
        
        detected_lang = result.get('language', 'unknown')
        transcript_text = result['text'].strip()
        word_count = len(transcript_text.split()) if transcript_text else 0
        
        print(f"Detected language: {detected_lang}")
        print(f"[WHISPER] Transcribed {word_count} words")
        
        return {
            'text': transcript_text,
            'segments': result['segments'], # Contains start, end, text
            'language': detected_lang
        }

    except Exception as e:
        print(f"[Transcriber] Unexpected error: {e}")
        return {'text': "", 'segments': [], 'language': "error"}
        
    finally:
        # 4. Cleanup
        if os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception as cleanup_error:
                print(f"[Transcriber] Failed to delete temp audio: {cleanup_error}")
