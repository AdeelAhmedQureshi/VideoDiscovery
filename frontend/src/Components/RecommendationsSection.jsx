import { Play, ExternalLink, Loader, Star, AlertCircle, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getRecommendedVideos } from "../../Services/VideoApi";

export function RecommendationsSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
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

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecommendedVideos(3);
        console.log("Fetched recommended videos:", data); // Debug log
        
        if (data.videos && data.videos.length > 0) {
          // Verify URLs are present
          const videosWithoutUrl = data.videos.filter(v => !v.url);
          if (videosWithoutUrl.length > 0) {
            console.warn(`${videosWithoutUrl.length} videos missing URLs:`, videosWithoutUrl);
          }
        }
        
        setVideos(data.videos || []);
        
        if (data.videos?.length === 0) {
          console.log("No recommended videos found");
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.message || "Failed to load recommended videos");
        setVideos([]);
        toast.error("Error loading videos", {
          description: err.message || "Failed to fetch recommended videos",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedVideos();
  }, []);

  // Helper function to open video
  const handleVideoClick = (video, source = "card") => {
    const url = video?.url;
    
    if (!url) {
      console.error("Video URL is missing:", video);
      toast.error("Video link unavailable", {
        description: `${video?.title || "This video"} doesn't have a valid link.`,
      });
      return;
    }

    // Validate URL format
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.error("Invalid URL format:", url);
      toast.error("Invalid video link", {
        description: "The video link format is not valid.",
      });
      return;
    }

    console.log(`Opening video from ${source}:`, url);
    window.open(url, "_blank");
    toast.success("Opening video", {
      description: `Loading: ${video?.title || "Video"}`,
    });
  };
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-5 md:px-6 bg-white" id="recommendation-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-14 lg:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.7 }}
          variants={containerVariants}
        >
          <div className="inline-block relative mb-3 sm:mb-4">
            <motion.h1
              className="inline-block text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] peer px-2 sm:px-0"
              variants={headingVariants}
            >
              AI Recommended Videos
            </motion.h1>
            <motion.div
              className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1 sm:peer-hover:h-1.5 peer-hover:opacity-80"
              variants={headingVariants}
            ></motion.div>
          </div>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-gray-500 mt-3 sm:mt-4 md:mt-6 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto"
            variants={headingVariants}
          >
            System-recommended videos based on your uploads (★ 3.0+) - discover similar content that matches your input videos
          </motion.p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex justify-center items-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
              <p className="text-gray-600 text-sm sm:text-base">Loading your rated videos...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-2">Unable to Load Videos</p>
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && videos.length === 0 && (
          <motion.div
            className="bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50 border border-cyan-200 rounded-lg p-8 sm:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Star className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-700 font-semibold text-base sm:text-lg mb-2">No AI Recommendations Yet</p>
            <p className="text-gray-600 text-sm sm:text-base">
              Upload and rate videos to see AI-recommended similar content. Recommendations with 3+ star ratings will appear here.
            </p>
          </motion.div>
        )}

        {/* Videos Grid */}
        {!loading && !error && videos.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {videos.map((video, index) => (
              <motion.div
                key={video.recommendation_id || index}
                className="group bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-105"
                variants={cardVariants}
                onClick={() => handleVideoClick(video, "thumbnail")}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleVideoClick(video, "keyboard");
                  }
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100 cursor-pointer">
                      <div className="text-center">
                        <Play className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-gray-500">Video</p>
                      </div>
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5 sm:ml-1" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-black/80 text-white text-[10px] sm:text-xs font-medium">
                      {video.duration}
                    </div>
                  )}

                  {/* Rating badge */}
                  {video.rating && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
                      {video.rating.toFixed(1)}
                    </div>
                  )}

                  {/* Similarity badge */}
                  {video.similarity && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1">
                      {Math.round(video.similarity * 100)}% Match
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-sm sm:text-base leading-snug text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                    {video.title || "Untitled Video"}
                  </h3>

                  {/* Channel Info */}
                  {video.channel && (
                    <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {video.channel.charAt(0).toUpperCase()}
                      </span>
                      {video.channel}
                    </p>
                  )}

                  {/* Video Stats */}
                  {(video.views || video.uploadedAt) && (
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-medium">
                      {video.views && <span>{video.views} views</span>}
                      {video.views && video.uploadedAt && <span>•</span>}
                      {video.uploadedAt && <span>{video.uploadedAt}</span>}
                    </div>
                  )}

                  {/* Rating and Comment */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-md p-2 sm:p-2.5 border border-cyan-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                            i < Math.round(video.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-1">
                        {video.rating ? `${video.rating.toFixed(1)}/5` : "Not rated"}
                      </span>
                    </div>
                    {video.comment && (
                      <p className="text-[10px] sm:text-xs text-gray-600 italic line-clamp-2">
                        "{video.comment}"
                      </p>
                    )}
                  </div>

                  {/* Rated Date */}
                  {video.rated_at && (
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Rated: {formatDate(video.rated_at)}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(video, "button");
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        handleVideoClick(video, "button-keyboard");
                      }
                    }}
                    className="w-full flex items-center justify-between text-xs sm:text-sm text-cyan-600 font-medium pt-1 sm:pt-2 px-0 hover:text-cyan-700 transition-colors group-hover:bg-cyan-50 py-2 pl-2 pr-1 rounded hover:rounded-md"
                    title={video?.url ? "Click to watch video on YouTube" : "Video link not available"}
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Helper function to format duration (seconds to MM:SS)
function formatDuration(seconds) {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}