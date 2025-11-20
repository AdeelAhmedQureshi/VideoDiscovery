# colab_connector.py
import requests
from ..config import settings


def send_video_to_colab(video_id: str, video_url: str):
    """
    Send the video URL to the Colab processing endpoint.
    This is a simple POST; the Colab service should call back with results.
    """
    if not settings.COLAB_URL:
        return {"error": "COLAB_URL is not configured"}

    payload = {"video_id": video_id, "video_url": video_url}
    try:
        resp = requests.post(settings.COLAB_URL, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        # in production log and optionally retry
        print("Error sending to Colab:", e)
        return {"error": str(e)}
