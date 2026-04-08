import { useState, useCallback, useEffect } from "react";
import { Upload, FileVideo, X, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

export function UploadSection() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    showTwoButtons: false,
    duplicateVideoId: null,
    autoCloseMs: 2400
  });

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

  const showPopup = ({ type = "success", title, message, showTwoButtons = false, duplicateVideoId = null, autoCloseMs }) => {
    const resolvedAutoCloseMs = autoCloseMs ?? (showTwoButtons ? 0 : 2400);
    setPopup({
      open: true,
      type,
      title,
      message,
      showTwoButtons,
      duplicateVideoId,
      autoCloseMs: resolvedAutoCloseMs
    });
  };

  const handlePopupClose = () => {
    setPopup({ open: false, type: "info", title: "", message: "", showTwoButtons: false, duplicateVideoId: null, autoCloseMs: 2400 });
  };

  useEffect(() => {
    if (!popup.open || popup.showTwoButtons || !popup.autoCloseMs) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      handlePopupClose();
    }, popup.autoCloseMs);

    return () => clearTimeout(timeoutId);
  }, [popup.open, popup.showTwoButtons, popup.autoCloseMs]);

  const handleSeeRecommendations = () => {
    const videoId = popup.duplicateVideoId;
    handlePopupClose();
    if (videoId) {
      navigate(`/history?video=${videoId}`);
    }
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
      showPopup({
        type: "error",
        title: "Invalid file",
        message: error
      });
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
      showPopup({
        type: "error",
        title: "Invalid file",
        message: error
      });
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showPopup({
          type: "error",
          title: "Session expired",
          message: "Please log in again to continue."
        });
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
          errorMessage.toLowerCase().includes("already") &&
          errorMessage.toLowerCase().includes("uploaded")
        ) {
          // Extract video ID from error message (e.g., "Video ID: vca818c7e8a1e")
          const videoIdMatch = errorMessage.match(/Video ID[:\s]+([a-zA-Z0-9]+)/);
          const duplicateVideoId = videoIdMatch ? videoIdMatch[1] : null;

          showPopup({
            type: "info",
            title: "Already Uploaded",
            message: "This video has already been uploaded to your account.",
            showTwoButtons: true,
            duplicateVideoId: duplicateVideoId
          });
          setIsAnalyzing(false);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Upload success:", data);

      // Store video ID and directly start loading
      setVideoId(data.video_id || data.id);
      setIsUploadComplete(true);

      // Notify dashboard to refresh stats without manual reload
      window.dispatchEvent(new Event("videoUploaded"));
    } catch (err) {
      console.error(err);
      showPopup({
        type: "error",
        title: "Upload failed",
        message: err.message
      });
    } finally {
      setIsAnalyzing(false);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
        delayChildren: 0.05,
        staggerChildren: 0.1,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="upload-section" className="pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-16 sm:pb-24 px-5 sm:px-6 bg-gray-50 relative">
      <div className="container mx-auto max-w-2xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-3 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.7 }}
          variants={containerVariants}
        >
          <div className="inline-block relative mb-4">
            <motion.h1
              className="inline-block text-4xl sm:text-5xl leading-[1.15] pb-1 font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] peer"
              variants={headingVariants}
            >
              Upload Section
            </motion.h1>
            <motion.div
              className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
              variants={headingVariants}
            ></motion.div>
          </div>
          <motion.p
            className="text-base sm:text-lg text-gray-500 mt-4 sm:mt-6"
            variants={headingVariants}
          >
            Upload your video to get started with intelligent recommendations
          </motion.p>
        </motion.div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative border-2 border-dashed rounded-xl p-8 sm:p-16 text-center transition-all duration-300 ${isDragging
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-linear-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-cyan-500" />
                </div>

                <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                  Drop your video here or click to browse
                </p>

                <button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg pointer-events-none transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.02] group-hover:border-cyan-400 group-hover:text-cyan-700 group-hover:shadow-md">
                  <FileVideo className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
                  Select Video File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex-wrap sm:flex-nowrap">
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-70"
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

      {popup.open && (
        <div className={`fixed left-1/2 z-50 -translate-x-1/2 ${popup.showTwoButtons ? "top-5 w-[min(88vw,420px)]" : "top-4 w-max max-w-[92vw]"}`}>
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_65px_-24px_rgba(15,23,42,0.5)] backdrop-blur-sm animate-[fadeIn_220ms_ease-out]">
            <div className={`relative px-6 py-4 ${popup.type === "success" ? "bg-gradient-to-r from-emerald-600 to-green-600" : popup.type === "error" ? "bg-gradient-to-r from-rose-600 to-red-600" : popup.type === "warning" ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/35">
                  {popup.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : popup.type === "info" ? (
                    <Info className="h-5 w-5 text-white" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  {popup.showTwoButtons && <p className="text-xs uppercase tracking-[0.22em] text-white/80">Notification</p>}
                  <h3 className="text-lg font-bold text-white">{popup.title}</h3>
                  {!popup.showTwoButtons && <p className="text-white/90 text-sm">{popup.message}</p>}
                </div>
              </div>
            </div>

            {popup.showTwoButtons ? (
              <div className="px-6 py-5 bg-white/90">
                <p className="text-slate-700 font-medium leading-relaxed mb-5">{popup.message}</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handlePopupClose}
                    className="px-5 py-2.5 bg-white text-slate-800 font-semibold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
                  >
                    OK
                  </button>
                  <button
                    onClick={handleSeeRecommendations}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
                  >
                     Recommendations
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-1.5 bg-white/25">
                <div
                  className="h-full bg-white/90 origin-left"
                  style={{ animation: `notificationTimer ${popup.autoCloseMs}ms linear forwards` }}
                />
              </div>
            )}
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes notificationTimer{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
        </div>
      )}

      {/* Loading Component */}
      <Loading videoId={videoId} isUploadComplete={isUploadComplete} />
    </section>
  );
}