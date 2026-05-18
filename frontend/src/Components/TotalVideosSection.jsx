import { Play, Trash2, Calendar, Clock, AlertCircle, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function TotalVideosSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

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
    const fetchVideos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not signed in. Please log in to view videos.");
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
            setError("Failed to load videos. Try again later.");
          }
          setLoading(false);
          return;
        }

        const historyData = await historyRes.json();
        const history = historyData.history || [];

        const formattedVideos = history.map((item) => {
          const uploadDate = item.uploaded_at
            ? new Date(item.uploaded_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
            : "N/A";

          const formatDuration = (seconds) => {
            if (!seconds || seconds === 0) return "N/A";
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            if (hours > 0) {
              return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins}:${secs.toString().padStart(2, '0')}`;
          };

          return {
            id: item.video_id,
            title: item.file_name || "Untitled Video",
            date: uploadDate,
            duration: formatDuration(item.video_duration),
            file_url: item.file_url,
            thumbnail_url: item.thumbnail_url,
          };
        });

        setVideos(formattedVideos);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching videos:", e);
        setError("Network error while loading videos.");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDeleteClick = (videoId) => {
    setVideoToDelete(videoId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const videoId = videoToDelete;
    setShowDeleteModal(false);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not signed in. Please log in again.");
      return;
    }

    setDeletingVideoId(videoId);

    try {
      const deleteRes = await fetch(`http://localhost:8000/api/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!deleteRes.ok) {
        toast.error("Failed to delete video");
        setDeletingVideoId(null);
        return;
      }

      setVideos((prevData) => prevData.filter((item) => item.id !== videoId));
      setDeletingVideoId(null);
      toast.success("Video deleted successfully");
    } catch (e) {
      console.error("Error deleting video:", e);
      toast.error("Network error while deleting video.");
      setDeletingVideoId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
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
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
            Your Videos
          </h2>
          <motion.div
            className="absolute -bottom-2 left-0 h-1 w-32 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-sm"
            variants={headingVariants}
          ></motion.div>
        </motion.div>
        <motion.p
          className="text-slate-600 mt-4 text-base"
          variants={headingVariants}
        >
          Manage all your uploaded videos in one place
        </motion.p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading your videos...</p>
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
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No videos uploaded yet</p>
          <p className="text-slate-500 text-sm mt-2">Upload your first video to see it here</p>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && videos.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              variants={cardVariants}
            >
              {/* Thumbnail or Placeholder */}
              <div className="relative h-40 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm">
                    <Video className="w-12 h-12 text-white/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(video.id)}
                  disabled={deletingVideoId === video.id}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all duration-300 shadow-md disabled:opacity-50"
                >
                  {deletingVideoId === video.id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-cyan-600 transition-colors duration-300 mb-3">
                  {video.title}
                </h3>

                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{video.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>{video.duration}</span>
                  </div>
                </div>

                {/* Gradient Bottom Border */}
                <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed top-6 left-1/2 z-50 w-[min(85vw,380px)] -translate-x-1/2 animate-in fade-in zoom-in-95">
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Delete Video</h3>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white">
              <p className="text-slate-700 font-medium mb-6">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2.5 bg-slate-100 text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
