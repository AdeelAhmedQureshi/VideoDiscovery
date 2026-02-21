import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Video, Play, ArrowLeft, Sparkles, Youtube, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Skeleton Loader
const SkeletonCard = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-5"
    >
        <div className="w-96 h-56 flex-shrink-0 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_linear_infinite]"></div>
        <div className="flex-1 space-y-3 py-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-[shimmer_1.5s_linear_infinite]"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-3/4 animate-[shimmer_1.5s_linear_infinite]"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-1/2 animate-[shimmer_1.5s_linear_infinite]"></div>
        </div>
    </motion.div>
);

// Video Card
const VideoCard = ({ video, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (video.url) {
            window.open(video.url, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
            }}
            className="flex gap-8 group cursor-pointer"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail */}
            <div className="relative w-96 h-56 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg">
                {video.thumbnail ? (
                    <>
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm">
                        <Youtube className="w-20 h-20 text-white/30" />
                    </div>
                )}

                {/* Hover Overlay */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center"
                            >
                                <Play className="w-7 h-7 text-cyan-600 ml-1" fill="currentColor" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Match Badge */}
                {video.similarity && (
                    <div className="absolute top-3 left-3">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-bold">
                                {Math.round(video.similarity * 100)}% Match
                            </span>
                        </div>
                    </div>
                )}

                {/* Duration */}
                {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/90 rounded-lg text-white text-xs font-semibold">
                        {video.duration}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 py-3 pl-2">
                <h3 className="font-bold text-slate-900 text-xl leading-tight line-clamp-2 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                    {video.title}
                </h3>

                {video.channel && (
                    <p className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            {video.channel.charAt(0)}
                        </span>
                        {video.channel}
                    </p>
                )}

                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                    {video.views && <span className="font-medium">{video.views} views</span>}
                    {video.uploadedAt && video.views && <span>•</span>}
                    {video.uploadedAt && <span>{video.uploadedAt}</span>}
                </div>

                <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-cyan-600 font-medium">Watch on YouTube</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function Recommendation() {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 12; // retry up to 12 times (60 seconds total)
        let timeoutId = null;
        let cancelled = false;

        const fetchRecommendations = async () => {
            if (cancelled) return;
            console.log(`[Recommendation] Fetching for videoId=${videoId}, attempt ${retryCount + 1}/${maxRetries}`);
            try {
                const token = localStorage.getItem("token");
                console.log(`[Recommendation] Token exists: ${!!token}, value: ${token ? token.substring(0, 20) + '...' : 'NULL'}`);

                const response = await fetch(
                    `http://localhost:8000/api/recommendations/${videoId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: "include",
                    }
                );

                console.log(`[Recommendation] Response status: ${response.status}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Recommendation] Error response:`, errorText);
                    throw new Error(`Failed to fetch recommendations: ${response.status}`);
                }

                const data = await response.json();
                console.log(`[Recommendation] API response:`, JSON.stringify(data, null, 2));
                setUploadedVideo(data.uploaded_video || null);

                const recs = data.recommendations || [];
                const message = data.message || "";
                console.log(`[Recommendation] Recs count: ${recs.length}, message: "${message}"`);

                if (recs.length > 0) {
                    // We got recommendations — show them
                    setRecommendations(recs);
                    setStatusMessage("");
                    setLoading(false);
                } else if (
                    retryCount < maxRetries &&
                    (message.toLowerCase().includes("still") ||
                        message.toLowerCase().includes("processing") ||
                        message.toLowerCase().includes("no search queries") ||
                        recs.length === 0)
                ) {
                    // Video still processing or no recs found yet — retry
                    retryCount++;
                    setStatusMessage(
                        message || `Waiting for AI analysis to complete... (attempt ${retryCount}/${maxRetries})`
                    );
                    timeoutId = setTimeout(fetchRecommendations, 5000);
                } else {
                    // Max retries reached or final empty
                    setRecommendations([]);
                    setStatusMessage("");
                    setLoading(false);
                }
            } catch (error) {
                console.error("[Recommendation] Error:", error);
                if (retryCount < maxRetries) {
                    retryCount++;
                    setStatusMessage(`Connecting to server... (attempt ${retryCount}/${maxRetries})`);
                    timeoutId = setTimeout(fetchRecommendations, 5000);
                } else {
                    setRecommendations([]);
                    setStatusMessage("");
                    setLoading(false);
                }
            }
        };

        fetchRecommendations();

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [videoId]);

    const headingVariants = {
        hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.6, ease: "easeOut" },
        },
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
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
            {/* Content */}
            <div>
                {/* Header */}
                <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50/80 transition-all group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline">Back</span>
                            </button>

                            {!loading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-200"
                                >
                                    <Sparkles className="w-4 h-4 text-cyan-600" />
                                    <span className="text-sm font-bold text-slate-700">
                                        {recommendations.length} Videos Found
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Title */}
                    <motion.div
                        className="text-center mb-3 sm:mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.7 }}
                        variants={containerVariants}
                    >
                        <div className="inline-block relative mb-4">
                            <motion.h1
                                className="inline-block text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] peer"
                                variants={headingVariants}
                            >
                                Video Recommendations
                            </motion.h1>
                            <motion.div
                                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
                                variants={headingVariants}
                            ></motion.div>
                        </div>
                        <motion.p
                            className="text-base sm:text-lg text-gray-500 mt-4 sm:mt-6"
                            variants={headingVariants}
                        >
                            Based on the video you uploaded, here are some similar videos we found for you.
                        </motion.p>
                    </motion.div>

                    {/* Videos Grid */}
                    {loading ? (
                        <div className="space-y-8 max-w-6xl mx-auto">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                            {statusMessage && (
                                <div className="text-center py-4">
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-50 border border-cyan-200 rounded-full">
                                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-medium text-cyan-700">{statusMessage}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : recommendations.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8 max-w-6xl mx-auto"
                        >
                            {recommendations.map((video, index) => (
                                <VideoCard key={video.id} video={video} index={index} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
                                <Video className="w-14 h-14 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                No Recommendations Available
                            </h3>
                            <p className="text-slate-600 mb-8 max-w-md">
                                We couldn't find matching videos. Try uploading a different video.
                            </p>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/40 transition-all transform hover:scale-105"
                            >
                                Go to Dashboard
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    );
}

