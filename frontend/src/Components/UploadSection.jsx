import { useState, useCallback } from "react";
import { Upload, FileVideo, X, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

export function UploadSection() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" }); // type: success | error | info

  const allowedFormats = [
    "video/mp4",
    "video/avi",
    "video/quicktime", // MOV
    "video/webm",
    "video/x-matroska" // MKV
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = () => setFile(null);

  // Custom popup - now supports 'info' type
  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 5000); // auto-hide after 5s
  };

  const validateVideoFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!allowedFormats.includes(file.type)) {
        reject("Invalid format! Only MP4, AVI, MOV allowed.");
        return;
      }

      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (video.duration > 180) {
          reject("Video too long! Max 3 minutes allowed.");
        } else {
          resolve(file);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject("Cannot read video file.");
      };

      video.src = url;
    });
  };

  const handleFileInput = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const validFile = await validateVideoFile(selectedFile);
      setFile(validFile);
    } catch (error) {
      showPopup(error, "error");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    

    try {
      const validFile = await validateVideoFile(droppedFile);
      setFile(validFile);
    } catch (error) {
      showPopup(error, "error");
    }
  };

  const handleAnalyze = async () => {
  if (!file) return;
  setIsAnalyzing(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      showPopup("Please login again", "error");
      return;
    }

    console.log(file); 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "My Video");
    formData.append("intelligent_query", "dummy query");
    //console.log("Token being sent:", token);


    const response = await fetch(
      "http://localhost:8000/api/videos/upload",
      {
        method: "POST",
        headers: {
           "Authorization": `Bearer ${token}`, // THIS IS IMPORTANT 🔥 THIS WAS MISSING
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if it's a duplicate video message (not an error)
      const errorMessage = errorData.detail || errorData.message || "Upload failed";
      
      if (
        errorMessage.toLowerCase().includes("already uploaded") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("exists") ||
        errorMessage.includes("id")
      ) {
        showPopup(errorMessage, "info");
        setIsAnalyzing(false);
        return;
      } else {
        throw new Error(errorMessage);
      }
    }

    const data = await response.json();
    showPopup("Video uploaded successfully!", "success");
    console.log("Upload success:", data);
  } catch (err) {
    console.error(err);
    showPopup(err.message, "error");
  } finally {
    setIsAnalyzing(false);
  }
};


  return (
    <section id="upload-section" className="py-24 px-6 bg-gray-50 relative">
      <div className="container mx-auto max-w-2xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block relative mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
             Upload Section
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm"></div>
          </div>
          <p className="text-lg text-gray-500 mt-6">Upload your video to get started with intelligent recommendations</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-16 text-center transition-all ${isDragging
                ? "border-cyan-500 bg-cyan-50/50"
                : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
                }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-cyan-500" />
                </div>

                <p className="text-base font-medium text-gray-900 mb-1">
                  Drop your video here or click to browse
                </p>

                <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors pointer-events-none">
                  <FileVideo className="w-4 h-4" />
                  Select Video File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-cyan-100 to-cyan-50 flex items-center justify-center shrink-0">
                  <FileVideo className="w-6 h-6 text-cyan-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={handleRemoveFile}
                  disabled={isAnalyzing}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                     Upload  Video
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Format Info */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span>✓ Visual Analysis</span>
          <span>✓ Audio Transcription</span>
          <span>✓ Text Embedding</span>
          <span>✓ Smart Recommendations</span>
        </div>
      </div>

      {/* Modern Professional Popup with Icons and Animation */}
      {popup.message && (
        <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:items-start sm:justify-end sm:p-6 z-50">
          <div
            className={`max-w-md w-full shadow-2xl rounded-2xl pointer-events-auto overflow-hidden transform transition-all duration-300 ease-out animate-slide-up ${
              popup.type === "success"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : popup.type === "error"
                ? "bg-gradient-to-r from-rose-500 to-red-500"
                : "bg-gradient-to-r from-emerald-500 to-green-500"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {popup.type === "success" && (
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {popup.type === "error" && (
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {popup.type === "info" && (
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-white">
                    {popup.type === "success" && "Success"}
                    {popup.type === "error" && "Error"}
                    {popup.type === "info" && "Information"}
                  </p>
                  <p className="mt-1 text-sm text-white/90 leading-relaxed">
                    {popup.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setPopup({ message: "", type: "" })}
                    className="inline-flex rounded-lg text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="h-1 bg-white/20">
              <div 
                className="h-full bg-white/60 animate-progress"
                style={{ animation: "progress 5s linear" }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </section>
  );
}