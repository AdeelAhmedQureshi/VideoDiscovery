import { MessageSquare, Star, AlertCircle, Video, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function UserFeedbackSection() {
  const [videosWithFeedback, setVideosWithFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchFeedback = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not signed in. Please log in to view feedback.");
        setLoading(false);
        return;
      }

      try {
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
            setError("Failed to load feedback. Try again later.");
          }
          setLoading(false);
          return;
        }

        const historyData = await historyRes.json();
        const history = historyData.history || [];

        const formattedVideos = history
          .map((item) => ({
            id: item.video_id,
            title: item.file_name || "Untitled Video",
            rating: item.feedback?.rating || null,
            comment: item.feedback?.comment || null,
            feedback_date: item.feedback?.created_at || null,
            thumbnail_url: item.thumbnail_url,
            recommendations: item.recommendation_count || 0,
          }))
          .filter((video) => video.rating || video.comment)
          .sort((a, b) => {
            if (a.rating !== b.rating) return (b.rating || 0) - (a.rating || 0);
            return new Date(b.feedback_date || 0) - new Date(a.feedback_date || 0);
          });

        setVideosWithFeedback(formattedVideos);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching feedback:", e);
        setError("Network error while loading feedback.");
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

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
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
            Your Feedback
          </h2>
          <motion.div
            className="absolute -bottom-2 left-0 h-1 w-32 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-sm"
            variants={headingVariants}
          ></motion.div>
        </motion.div>
        <motion.p
          className="text-slate-600 mt-4 text-base"
          variants={headingVariants}
        >
          Review all feedback you've submitted for your videos
        </motion.p>
      </motion.div>

      {/* Stats Bar */}
      {!loading && !error && videosWithFeedback.length > 0 && (
        <motion.div
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-start flex-wrap gap-8">
            <div>
              <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-1">Total Feedback</p>
              <p className="text-2xl font-bold text-pink-900">{videosWithFeedback.length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading feedback...</p>
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
      {!loading && !error && videosWithFeedback.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No feedback submitted yet</p>
          <p className="text-slate-500 text-sm mt-2">Submit feedback on recommendations to see it here</p>
        </div>
      )}

      {/* Feedback Cards */}
      {!loading && !error && videosWithFeedback.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {videosWithFeedback.map((video) => (
            <motion.div
              key={video.id}
              className="group relative overflow-hidden rounded-2xl bg-white border border-pink-100 hover:border-pink-400 transition-all duration-300 hover:shadow-2xl"
              variants={cardVariants}
            >
              <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8">
                {/* Video Thumbnail */}
                <div className="w-full md:w-40 h-32 flex-shrink-0">
                  <div className="relative h-full bg-gradient-to-br from-pink-900 to-rose-900 rounded-xl overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-600/30 to-rose-600/30 backdrop-blur-sm">
                        <Video className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 mb-3">
                    {video.title}
                  </h3>

                  {/* Rating */}
                  {video.rating && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-600 mb-2">Your Rating</p>
                      <div className="flex items-center gap-3">
                        {renderStars(video.rating)}
                        <span className="text-lg font-bold text-amber-600">{video.rating}/5</span>
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {video.comment && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-600 mb-2">Comment</p>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-200">
                        "{video.comment}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Gradient Bottom Border */}
                <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
