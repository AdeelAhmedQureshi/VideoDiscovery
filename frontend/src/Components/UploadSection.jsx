import { useState, useCallback } from "react";
import { Upload, FileVideo, X, Loader2 } from "lucide-react";

export  function UploadSection() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <section id="upload-section" className="py-24 px-6 bg-gray-50 mt-10">
      <div className="container mx-auto max-w-2xl">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Upload Your Video
          </h2>
          <p className="text-base text-gray-600">
            Drag and drop your video file or click to browse. We support MP4, AVI, MOV, Wemb, MKV and more.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-16 text-center transition-all ${
                isDragging
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

                <div>
                  <p className="text-base font-medium text-gray-900 mb-1">
                    Drop your video here or click to browse
                  </p>
                  {/* <p className="text-sm text-gray-500">
                    Supports MP4, AVI, MOV, WebM up to 500MB
                  </p> */}
                </div>

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

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Analyze Video
                  </>
                )}
              </button>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing multimodal analysis...</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-cyan-500 to-blue-600 w-[65%] transition-all duration-500" />
                  </div>
                </div>
              )}
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
    </section>
  );
}