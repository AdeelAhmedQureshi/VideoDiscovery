import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Video, Play, ArrowLeft, Sparkles, Youtube, ExternalLink, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RecommendationFeedback } from "../src/Components/RecommendationFeedback";

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

    const isDailymotion = video.platform === "dailymotion";
    const platformLabel = isDailymotion ? "Dailymotion" : "YouTube";
    // Similarity is kept in data but hidden in UI per user preference
    const similarityPercent = null;

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

                {/* Rank Badge */}
                <div className="absolute top-3 left-3">
                    <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-black text-slate-800">#{index + 1}</span>
                    </div>
                </div>

                {/* Similarity badge removed */}

                {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/90 rounded-lg text-white text-xs font-semibold">
                        {video.duration}
                    </div>
                )}

                {/* Platform Badge */}
                <div className="absolute bottom-3 left-3">
                    <div className={`px-2 py-1 rounded-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md ${isDailymotion ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {isDailymotion ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12.894 21.921c-2.253.098-4.181-.49-5.785-1.764C5.502 18.879 4.547 17.27 4.24 15.42L4.1 15.42l-.18 6.241-3.921 0 0-21.379L4.1.282 4.1 8.923l.14 0c.585-1.288 1.429-2.272 2.532-2.953 1.106-.681 2.367-1.021 3.784-1.021 2.382 0 4.268.898 5.653 2.693 1.387 1.797 2.08 4.136 2.08 7.019 0 2.91-.749 5.28-2.247 7.107-1.498 1.83-3.474 2.79-5.928 2.877l-.725.026-.495-.75zm-.7-13.662c-1.471 0-2.666.555-3.581 1.666-.915 1.111-1.373 2.552-1.373 4.325 0 1.773.458 3.216 1.373 4.327.915 1.113 2.11 1.668 3.581 1.668 1.471 0 2.657-.542 3.562-1.625.903-1.084 1.355-2.541 1.355-4.37 0-1.829-.452-3.284-1.355-4.367-.905-1.083-2.091-1.624-3.562-1.624z" /></svg>
                        ) : (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        )}
                        {platformLabel}
                    </div>
                </div>
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

                {/* Search query badge */}
                {video.search_query_used && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[250px]">
                            Found via: "{video.search_query_used}"
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-cyan-600 font-medium">Watch on {platformLabel}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function Recommendation() {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [platformFilter, setPlatformFilter] = useState("all");
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [notFoundReason, setNotFoundReason] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, [videoId]);
    const fetchRecommendations = async (forceRefresh = false) => {
        setLoading(true);
        setVisibleCount(5);
        try {
            const token = localStorage.getItem("token");

            const url = `http://localhost:8000/api/recommendations/${videoId}${forceRefresh ? '?refresh=true' : ''}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch recommendations");

            const data = await response.json();
            setUploadedVideo(data.uploaded_video || null);
            setNotFoundReason(data.not_found_reason || data.message || null);

            // Prefer query_tabs (detailed per-query candidates) to show all platform results.
            let full = [];
            if (data.query_tabs && data.query_tabs.length > 0) {
                full = data.query_tabs.flatMap(tab => tab.recommendations || []);
            } else if (data.top_recommendations && data.top_recommendations.length > 0) {
                full = data.top_recommendations;
            } else {
                full = [];
            }

            // Deduplicate by youtube_video_id / id / url while preserving order
            const seen = new Set();
            const deduped = [];
            for (const v of full) {
                const key = v.youtube_video_id || v.id || v.url || v.video_link || v.youtube_id || v.youtubeId || null;
                if (!key) {
                    // keep items without keys but avoid exact duplicates
                    if (!deduped.includes(v)) deduped.push(v);
                    continue;
                }
                if (!seen.has(key)) {
                    seen.add(key);
                    deduped.push(v);
                }
            }

            // Sort by similarity descending when available
            deduped.sort((a, b) => (Number(b.similarity) || 0) - (Number(a.similarity) || 0));
            setAllRecommendations(deduped);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setAllRecommendations([]);
        } finally {
            setTimeout(() => setLoading(false), 1200);
        }
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

    // Filter and paging
    const filteredRecommendations = allRecommendations.filter((video) => {
        if (platformFilter === "all") return true;
        if (platformFilter === "youtube") return (video.platform || "").toLowerCase() === "youtube";
        if (platformFilter === "dailymotion") return (video.platform || "").toLowerCase() === "dailymotion" || (video.platform || "").toLowerCase() === "dailymotion";
        return true;
    });

    const totalFiltered = filteredRecommendations.length;
    const visibleRecommendations = filteredRecommendations.slice(0, visibleCount);
    const hasMore = visibleCount < totalFiltered;

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
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50/80 transition-all group cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline">Back</span>
                            </button>

                            {!loading && (
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-200"
                                    >
                                        <Sparkles className="w-4 h-4 text-cyan-600" />
                                        <span className="text-sm font-bold text-slate-700">
                                            Top {Math.min(5, totalFiltered || 5)} AI-Ranked Videos
                                        </span>
                                    </motion.div>

                                    <button
                                        onClick={() => fetchRecommendations(true)}
                                        className="px-3 py-2 rounded-md text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50"
                                    >
                                        Refresh Sources
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Title */}
                    <motion.div
                        className="text-center mb-3 sm:mb-10"
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
                                Best Matches
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
                            Top 5 most similar videos ranked by AI semantic analysis of your uploaded content.
                        </motion.p>
                    </motion.div>

                    {/* Platform filter and Videos List — shows initial 5 with Show More */}
                    <div className="max-w-6xl mx-auto mb-6 flex items-center justify-center gap-3">
                        <button
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${platformFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}
                            onClick={() => { setPlatformFilter('all'); setVisibleCount(5); }}
                        >
                            All
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${platformFilter === 'youtube' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}
                            onClick={() => { setPlatformFilter('youtube'); setVisibleCount(5); }}
                        >
                            YouTube
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${platformFilter === 'dailymotion' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}
                            onClick={() => { setPlatformFilter('dailymotion'); setVisibleCount(5); }}
                        >
                            Dailymotion
                        </button>
                    </div>
                    {loading ? (
                        <div className="space-y-8 max-w-6xl mx-auto">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : allRecommendations.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8 max-w-6xl mx-auto"
                        >
                            {/* Feedback Section - Appears before recommendations */}
                            <RecommendationFeedback videoId={videoId} />

                            {/* Partial match warning */}
                            {notFoundReason && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
                                >
                                    <span className="text-lg">⚠️</span>
                                    <p>{notFoundReason}</p>
                                </motion.div>
                            )}
                            {visibleRecommendations.map((video, index) => (
                                <VideoCard key={video.youtube_video_id || video.id || index} video={video} index={index} />
                            ))}

                            {/* Show More / Show Less */}
                            {totalFiltered > 5 && (
                                <div className="mt-8 flex justify-center">
                                    {hasMore ? (
                                        <button
                                            onClick={() => setVisibleCount((c) => Math.min(c + 5, totalFiltered))}
                                            className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-700"
                                        >
                                            Show More
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setVisibleCount(5)}
                                            className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md"
                                        >
                                            Show Less
                                        </button>
                                    )}
                                </div>
                            )}
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
                                No Matching Videos Found
                            </h3>
                            <p className="text-slate-600 mb-3 max-w-md">
                                {notFoundReason ||
                                    "We couldn't find videos matching your uploaded content on YouTube or Dailymotion."}
                            </p>
                            <p className="text-slate-400 text-sm mb-8 max-w-sm">
                                Try uploading a video with more distinctive scenes, objects, or dialogue.
                            </p>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/40 transition-all transform hover:scale-105 cursor-pointer"
                            >
                                Try Another Video
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
