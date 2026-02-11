# VideoDiscovery: AI-Powered Video Analysis Platform 🎥

VideoDiscovery is a full-stack application that leverages advanced AI models to provide deep insights into video content. It features automated object detection, transcription, scene classification, facial analysis, and action recognition.

## 🚀 Key Features

-   **Object Detection**: YOLOv8 (identifies people, cars, etc.)
-   **Transcription**: OpenAI Whisper (high-fidelity speech-to-text with search segments)
-   **Scene Classification**: ResNet50 (Places365)
-   **Face Analysis**: DeepFace (Age, Gender, Emotion)
-   **Action Recognition**: SlowFast (Kinetics-400)
-   **Semantic Search**: Find videos by content, spoken words, or visual context.

## 🛠️ Tech Stack

-   **Backend**: Python, FastAPI, MongoDB (Motor), PyTorch, TensorFlow
-   **Frontend**: React, TailwindCSS, Vite
-   **AI Engines**: Ultralytics, OpenAI, Facebook Research (PyTorchVideo), DeepFace

## 📦 Installation

### Prerequisites
-   Python 3.13+
-   Node.js & npm
-   MongoDB (running locally or Atlas)
-   Cloudinary Account (for video storage)
-   FFmpeg (Installed automatically via `imageio-ffmpeg`, no system config needed)

### 1. Backend Setup

1.  Navigate to the project root.
2.  Install dependencies:
    ```bash
    pip install -r Backend/requirements.txt
    ```
    *(Note: PyTorch with CUDA support is included in requirements.txt)*

3.  Configure Environment:
    -   Create a `.env` file in `Backend/` (see `Backend/.env.example`).
    -   Add your MongoDB URI, Cloudinary credentials, etc.

4.  Run the Server:
    ```bash
    python -m uvicorn Backend.app.main:app --reload --host 127.0.0.1 --port 5000
    ```
    -   The server will start at `http://127.0.0.1:5000`.
    -   On first run, it will automatically download necessary AI models (~2-3GB) to `Backend/ai_engine/models/`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    -   The app will be available at `http://localhost:5173`.

## 🧠 AI Models & Storage

-   **Models**: All AI model weights are stored in `Backend/ai_engine/models/`. This directory is git-ignored to keep the repository light.
-   **Temp Files**: Temporary video downloads are stored in `Backend/temp_videos/` and are automatically cleaned up.

## 📝 Usage

1.  Open the frontend in your browser.
2.  Upload a video file (`.mp4`, `.mov`, etc.).
3.  Wait for the processing pipeline to complete (progress is shown in backend console).
4.  View the detailed analysis including detected objects, transcript, demographics, and actions.
