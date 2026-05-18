import { Brain, Play, AlertCircle, Video, ArrowRight, ExternalLink, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AIRecommendationsSection() {
  const navigate = useNavigate();
  const [videosWithRecs, setVideosWithRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState({});

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delayChildren: 0.1,
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
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
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not signed in. Please log in to view recommendations.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user's videos
        const historyRes = await fetch("http://localhost:8000/api/videos/user/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!historyRes.ok) {
          if (historyRes.status === 401 || historyRes.status === 403) {
            setError("Session expired. Please sign in again.");
          } else {
            setError("Failed to load recommendations. Try again later.");
          }
          setLoading(false);
          return;
        }

        const historyData = await historyRes.json();
        const history = historyData.history || [];

        // Filter videos with recommendations
        const videosWithRecsData = history
          .filter((video) => (video.recommendation_count || 0) > 0)
          .sort((a, b) => (b.recommendation_count || 0) - (a.recommendation_count || 0))
          .map((item) => ({
            id: item.video_id,
            title: item.file_name || "Untitled Video",
            recommendations: item.recommendation_count || 0,
            thumbnail_url: item.thumbnail_url,
            recommendedVideos: [],
          }));

        setVideosWithRecs(videosWithRecsData);

        // Fetch recommendations for first video by default
        if (videosWithRecsData.length > 0) {
          setExpandedVideo(videosWithRecsData[0].id);
          await fetchRecommendationsForVideo(videosWithRecsData[0].id, token);
        }

        setLoading(false);
      } catch (e) {
        console.error("Error fetching recommendations:", e);
        setError("Network error while loading recommendations.");
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const fetchRecommendationsForVideo = async (videoId, token) => {
    setLoadingRecs((prev) => ({ ...prev, [videoId]: true }));

    try {
      const recsRes = await fetch(
        `http://localhost:8000/api/recommendations/${videoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!recsRes.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const recsData = await recsRes.json();
      console.log(`[AIRecs] Response for ${videoId}:`, recsData);
      
      // Use query_tabs (all candidates from queries) instead of just top_recommendations
      // This matches the behavior of VideoRecommendation.jsx and shows all available matches
      let videos = [];
      
      // Prefer query_tabs (detailed per-query candidates) to show all results
      if (recsData.query_tabs && recsData.query_tabs.length > 0) {
        videos = recsData.query_tabs.flatMap(tab => tab.recommendations || []);
      } else if (recsData.top_recommendations && recsData.top_recommendations.length > 0) {
        videos = recsData.top_recommendations;
      }
      
      // Deduplicate by youtube_video_id while preserving order
      const seen = new Set();
      const deduped = [];
      for (const v of videos) {
        const key = v.youtube_video_id || v.id || v.url || v.video_link || null;
        if (!key) {
          if (!deduped.includes(v)) deduped.push(v);
          continue;
        }
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(v);
        }
      }
      
      // If empty and there's a reason, log it
      if (deduped.length === 0 && recsData.not_found_reason) {
        console.warn(`[AIRecs] No recommendations for ${videoId}: ${recsData.not_found_reason}`);
        toast.info(`Some recommendations may be below quality threshold`, {
          description: recsData.not_found_reason || "No matching videos found"
        });
      }

      setVideosWithRecs((prev) =>
        prev.map((video) =>
          video.id === videoId 
            ? { ...video, recommendedVideos: deduped, recommendations: deduped.length }
            : video
        )
      );
    } catch (e) {
      console.error("Error fetching recommendations for video:", e);
      toast.error(`Failed to load recommendations`);
    } finally {
      setLoadingRecs((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const totalRecommendations = videosWithRecs.reduce((sum, video) => sum + video.recommendations, 0);

  return (
    <div className="mt-16">
      {/* Section Header */}
      <motion.div
        className="text-left mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.7 }}
        variants={containerVariants}
      >
        <motion.div className="inline-block relative mb-2" variants={headingVariants}>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Recommendations
          </h2>
          <motion.div
            className="absolute -bottom-2 left-0 h-1 w-40 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-sm"
            variants={headingVariants}
          ></motion.div>
        </motion.div>
        <motion.p
          className="text-slate-600 mt-4 text-base"
          variants={headingVariants}
        >
          Explore AI-generated video recommendations for your content
        </motion.p>
      </motion.div>

      {/* Stats Bar */}
      {!loading && !error && videosWithRecs.length > 0 && (
        <motion.div
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">Summary</p>
              <p className="text-2xl font-bold text-indigo-900">
                {videosWithRecs.length} <span className="text-lg text-indigo-600">videos</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">Total Recommendations</p>
              <p className="text-2xl font-bold text-purple-900">
                {videosWithRecs.reduce((sum, v) => sum + (v.recommendedVideos.length > 0 ? v.recommendedVideos.length : v.recommendations), 0)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading recommendations...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && videosWithRecs.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <Brain className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No recommendations yet</p>
          <p className="text-slate-500 text-sm mt-2">Upload videos and wait for AI to generate recommendations</p>
        </div>
      )}

      {/* Videos Grid with Recommendations */}
      {!loading && !error && videosWithRecs.length > 0 && (
        <div className="space-y-12">
          {videosWithRecs.map((video) => (
            <motion.div
              key={video.id}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              {/* User Video Card Header */}
              <motion.button
                onClick={() => {
                  if (expandedVideo === video.id) {
                    setExpandedVideo(null);
                  } else {
                    setExpandedVideo(video.id);
                    if (video.recommendedVideos.length === 0) {
                      const token = localStorage.getItem("token");
                      if (token) {
                        fetchRecommendationsForVideo(video.id, token);
                      }
                    }
                  }
                }}
                className="w-full group relative overflow-hidden rounded-2xl bg-white border border-indigo-100 hover:border-indigo-400 transition-all duration-300 text-left"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-4 p-5 sm:p-6">
                  {/* Video Thumbnail */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl overflow-hidden">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm">
                          <Video className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 mb-2">
                      {video.title}
                    </h3>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1.5 rounded-full border border-indigo-300">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-700">
                        {video.recommendations} recommendation{video.recommendations !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: expandedVideo === video.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ArrowRight className="w-6 h-6 text-indigo-600" />
                  </motion.div>
                </div>
              </motion.button>

              {/* Recommended Videos Grid */}
              <AnimatePresence>
                {expandedVideo === video.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {loadingRecs[video.id] ? (
                      <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-slate-600">Loading recommendations...</p>
                      </div>
                    ) : video.recommendedVideos.length > 0 ? (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                      >
                        {video.recommendedVideos.map((recVideo, idx) => (
                          <motion.div
                            key={idx}
                            className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            onClick={() => {
                              if (recVideo.url) {
                                window.open(recVideo.url, '_blank');
                              }
                            }}
                          >
                            {/* Thumbnail */}
                            <div className="relative h-32 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
                              {recVideo.thumbnail ? (
                                <img
                                  src={recVideo.thumbnail}
                                  alt={recVideo.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                                  <Youtube className="w-8 h-8 text-white/30" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                              {/* Hover Play Button */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                                </div>
                              </div>

                              {/* Platform Badge */}
                              {recVideo.platform && (
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-slate-700">
                                  {recVideo.platform === "dailymotion" ? "Dailymotion" : "YouTube"}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-3">
                              <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                                {recVideo.title}
                              </h4>
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs text-slate-500 line-clamp-1">
                                  {recVideo.channel || "Unknown Channel"}
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>

                            {/* Gradient Bottom Border */}
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"></div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-200">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">No recommendations available</p>
                        <p className="text-slate-500 text-sm mt-1">Recommendations may still be processing or below quality threshold</p>
                        <button
                          onClick={() => {
                            const token = localStorage.getItem("token");
                            if (token) {
                              fetchRecommendationsForVideo(video.id, token);
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
