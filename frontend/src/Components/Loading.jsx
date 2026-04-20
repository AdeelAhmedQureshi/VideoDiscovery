import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Loading = ({ videoId, isUploadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const navigate = useNavigate();
  const pollRef = useRef(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isUploadComplete || !videoId) return;

    const pollProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8000/api/videos/${videoId}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        const serverProgress = data.progress || 0;
        const stage = data.stage || "Processing...";
        const status = data.status;

        // Smoothly animate progress (never go backwards)
        setProgress(prev => Math.max(prev, serverProgress));
        setCurrentTask(stage);

        // Navigate when complete
        if ((serverProgress >= 100 || status === "completed") && !hasNavigated.current) {
          hasNavigated.current = true;
          setProgress(100);
          setCurrentTask("Analysis complete!");

          // Brief pause to show 100% before navigating
          setTimeout(() => {
            navigate(`/recommendations/${videoId}`);
          }, 800);
          return;
        }

        // Handle failure
        if (status === "failed") {
          setCurrentTask("Processing failed. Please try again.");
          clearInterval(pollRef.current);
          return;
        }
      } catch (err) {
        // Silently retry on network errors
      }
    };

    // Start polling immediately, then every 2 seconds
    pollProgress();
    pollRef.current = setInterval(pollProgress, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isUploadComplete, videoId, navigate]);

  if (!isUploadComplete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(92vw,540px)] overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl">
        {/* Header with gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-white/80 mb-1">Processing</p>
              <h3 className="text-xl font-bold text-white">Analyzing Your Video</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 bg-white/90">
          {/* Circular Progress */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-40 h-40">
              {/* Background Circle */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Task */}
          <div className="text-center">
            <p className="text-teal-700 font-semibold text-lg mb-2 min-h-[28px]">
              {currentTask}
            </p>
            <p className="text-slate-600 text-sm">
              {progress >= 100 ? 'Redirecting to recommendations...' : 'Please wait while we process your video...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;