# test_video_upload.py
"""
Test script to verify video upload functionality with hash calculation
"""

import hashlib
import os


def calculate_video_hash(file_path):
    """
    Calculate SHA256 hash of a video file

    Args:
        file_path: Path to the video file

    Returns:
        Hexadecimal hash string
    """
    sha256_hash = hashlib.sha256()

    try:
        with open(file_path, "rb") as f:
            # Read file in chunks to handle large videos
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)

        return sha256_hash.hexdigest()
    except Exception as e:
        print(f"Error calculating hash: {e}")
        return None


def test_duplicate_detection(file1, file2):
    """
    Test if two files are identical by comparing their hashes

    Args:
        file1: Path to first video file
        file2: Path to second video file
    """
    if not os.path.exists(file1):
        print(f"File not found: {file1}")
        return

    if not os.path.exists(file2):
        print(f"File not found: {file2}")
        return

    hash1 = calculate_video_hash(file1)
    hash2 = calculate_video_hash(file2)

    print(f"File 1: {file1}")
    print(f"Hash 1: {hash1}")
    print(f"\nFile 2: {file2}")
    print(f"Hash 2: {hash2}")
    print(f"\nAre files identical? {hash1 == hash2}")


if __name__ == "__main__":
    # Example usage:
    # test_duplicate_detection("video1.mp4", "video2.mp4")

    print("Video Hash Calculator")
    print("=" * 50)
    print("\nThis script helps test video duplicate detection.")
    print("Use calculate_video_hash(file_path) to get a video's hash.")
    print("Use test_duplicate_detection(file1, file2) to compare two videos.")
    print("\nThe same hash algorithm (SHA256) is used in the backend.")
