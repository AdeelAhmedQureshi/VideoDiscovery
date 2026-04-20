import {
    Video,
    Brain,
    MessageSquare,
    Calendar,
    Star,
    ArrowUpRight,
    Clock,
    ArrowLeft,
    Trash2,
    CheckCircle,
    AlertCircle,
    Search
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function History() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetVideoId = searchParams.get('video');
    const videoRefs = useRef({});
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingVideoId, setDeletingVideoId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [highlightedVideo, setHighlightedVideo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [feedbackOnly, setFeedbackOnly] = useState(false);

    useEffect(() => {
        const fetchHistoryData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not signed in. Please log in to view history.");
                setLoading(false);
                return;
            }

            try {
                // Fetch user's video history with recommendations and feedback
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
                        setError("Failed to load history. Try again later.");
                    }
                    setLoading(false);
                    return;
                }

                const historyData = await historyRes.json();
                const history = historyData.history || [];

                // Transform history to match the display format
                const formattedData = history.map((item) => {
                    // Format date
                    const uploadDate = item.uploaded_at 
                        ? new Date(item.uploaded_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })
                        : "N/A";

                    // Format duration (convert seconds to HH:MM:SS or MM:SS)
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
                        query: item.intelligent_query || null,
                        date: uploadDate,
                        recommendations: item.recommendation_count || 0,
                        feedback: item.feedback?.comment || null,
                        rating: item.feedback?.rating || null,
                        duration: formatDuration(item.video_duration),
                        file_url: item.file_url,
                        thumbnail_url: item.thumbnail_url,
                    };
                });

                setHistoryData(formattedData);
                setLoading(false);
            } catch (e) {
                console.error("Error fetching history:", e);
                setError("Network error while loading history.");
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, []);

    // Scroll to and highlight targeted video
    useEffect(() => {
        if (targetVideoId && historyData.length > 0) {
            const videoExists = historyData.some(item => item.id === targetVideoId);
            if (videoExists) {
                setHighlightedVideo(targetVideoId);
                // Wait for DOM to render
                setTimeout(() => {
                    const element = videoRefs.current[targetVideoId];
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    // Remove highlight after 3 seconds
                    setTimeout(() => setHighlightedVideo(null), 3000);
                }, 100);
            }
        }
    }, [targetVideoId, historyData]);

    const handleDeleteClick = (videoId) => {
        setVideoToDelete(videoId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        const videoId = videoToDelete;
        setShowDeleteModal(false);

        const token = localStorage.getItem("token");
        if (!token) {
            setNotification({ show: true, message: "Not signed in. Please log in again.", type: "error" });
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
                if (deleteRes.status === 401 || deleteRes.status === 403) {
                    setNotification({ show: true, message: "Session expired. Please sign in again.", type: "error" });
                } else if (deleteRes.status === 404) {
                    setNotification({ show: true, message: "Video not found.", type: "error" });
                } else {
                    setNotification({ show: true, message: "Failed to delete video. Please try again later.", type: "error" });
                }
                setDeletingVideoId(null);
                return;
            }

            // Remove the deleted video from the state
            setHistoryData((prevData) => prevData.filter((item) => item.id !== videoId));
            setDeletingVideoId(null);
            setNotification({ show: true, message: "Video deleted successfully", type: "success" });

        } catch (e) {
            console.error("Error deleting video:", e);
            setNotification({ show: true, message: "Network error while deleting video.", type: "error" });
            setDeletingVideoId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setVideoToDelete(null);
    };

    useEffect(() => {
        if (!notification.show || notification.type !== "success") {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [notification.show, notification.type]);

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

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredHistory = historyData.filter((item) => {
        if (feedbackOnly && !item.feedback) {
            return false;
        }
        if (!normalizedQuery) {
            return true;
        }
        const titleMatch = item.title?.toLowerCase().includes(normalizedQuery);
        const feedbackMatch = item.feedback?.toLowerCase().includes(normalizedQuery);
        return Boolean(titleMatch || feedbackMatch);
    });

    return (
        <div className="min-h-screen font-sans text-slate-800 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_46%,#f8fbff_100%)]">

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition font-semibold cursor-pointer"
                    >
                        <ArrowLeft className="w-6 h-6 font-bold" />
                        Back
                    </button>
                </div>


                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.7 }}
                    variants={containerVariants}
                >
                    <div className="inline-block relative mb-4">
                        <motion.h1
                            className="display-font inline-block text-4xl sm:text-5xl leading-[1.15] pb-1 font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(20,184,166,0.35)] peer"
                            variants={headingVariants}
                        >
                            History & Activity
                        </motion.h1>
                        <motion.div
                            className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
                            variants={headingVariants}
                        ></motion.div>
                    </div>
                    <motion.p
                        className="text-base sm:text-lg text-slate-600 mt-4 sm:mt-6"
                        variants={headingVariants}
                    >
                        Review your recent video interactions and Recommendations
                    </motion.p>
                </motion.div>

                {/* Section Header (Light only) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Activity</h2>
                    {/* <button className="text-sm text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-2 transition-all duration-300 hover:gap-3 bg-white hover:bg-cyan-50 px-4 py-2 rounded-lg border border-cyan-300 shadow">
                        View all <ArrowUpRight className="w-4 h-4 text-cyan-600" />
                    </button> */}
                </div>

                {/* Search */}
                {!loading && !error && historyData.length > 0 && (
                    <div className="mb-8 rounded-3xl border border-teal-200/60 bg-[linear-gradient(90deg,rgba(247,251,250,0.9),rgba(255,255,255,0.95),rgba(248,251,255,0.9))] p-4 sm:p-5 shadow-[0_12px_30px_-18px_rgba(31,143,127,0.4)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-teal-600">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search by video title or feedback..."
                                    className="brand-ring relative z-0 w-full rounded-2xl border border-teal-200/60 bg-white/90 px-12 py-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition focus:border-teal-400"
                                />
                            </div>
                            <label className="flex items-center gap-2 rounded-2xl border border-teal-200/60 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={feedbackOnly}
                                    onChange={(event) => setFeedbackOnly(event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
                                />
                                Feedback only
                            </label>
                        </div>
                        {normalizedQuery && (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Showing {filteredHistory.length} of {historyData.length}
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-600">Loading your history...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
                            <MessageSquare className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-600 font-semibold">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && historyData.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                            <Video className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-semibold">No videos uploaded yet</p>
                        <p className="text-slate-500 text-sm mt-2">Upload your first video to see your history</p>
                    </div>
                )}

                {!loading && !error && historyData.length > 0 && filteredHistory.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-semibold">No results found</p>
                        <p className="text-slate-500 text-sm mt-2">Try a different title or feedback keyword.</p>
                    </div>
                )}

                {/* Cards */}
                {!loading && !error && filteredHistory.length > 0 && (
                <div className="grid gap-6">
                    {filteredHistory.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => (videoRefs.current[item.id] = el)}
                            className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl ${
                                highlightedVideo === item.id ? 'ring-4 ring-cyan-400 shadow-2xl' : ''
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Light Background */}
                            <div className="absolute inset-0 border border-slate-200 group-hover:border-teal-400 transition-all duration-500"></div>

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 "></div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteClick(item.id)}
                                disabled={deletingVideoId === item.id}
                                className="absolute top-4 right-4 z-20 p-2.5 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                                title="Delete video"
                            >
                                {deletingVideoId === item.id ? (
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Trash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform duration-200" />
                                )}
                            </button>

                            <div className="relative p-7 sm:p-8 pt-16">
                                <div className="flex flex-col gap-6 mb-6">
                                    <div className="flex items-start gap-5 flex-1 pr-16">

                                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700 shrink-0 border border-teal-200 shadow">
                                            <Video className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                                                <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-full">
                                                    <Calendar className="w-4 h-4" />
                                                    {item.date}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                    <Clock className="w-4 h-4" />
                                                    {item.duration}
                                                </span>
                                                
                                                {/* Rating - Show if rating exists */}
                                                {item.rating && (
                                                    <span className="flex items-center gap-1.5 bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-300 px-3 py-1.5 rounded-full">
                                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                        <span className="font-bold text-yellow-600">{item.rating}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                <div className="my-6 h-px bg-gradient-to-r from-slate-200 via-teal-200 to-slate-200 w-full" />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                                    {/* Recommendations */}
                                    <div className="md:col-span-4 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/60">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700 border border-teal-200">
                                                <Brain className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-1">
                                                    AI Recommendations
                                                </p>
                                                <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                                    {item.recommendations}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div className="md:col-span-8 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/60">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 border border-sky-200">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">
                                                    User Feedback
                                                </p>
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    {item.feedback ? (
                                                        <span className="italic text-teal-600">"{item.feedback}"</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">No feedback submitted yet.</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 transition-all duration-500"></div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed top-6 left-1/2 z-50 w-[min(85vw,380px)] -translate-x-1/2">
                    <div className="overflow-hidden rounded-3xl border border-red-200 bg-white/90 shadow-2xl">
                        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm uppercase tracking-widest text-white/85">Confirmation</p>
                                    <h3 className="text-lg font-bold text-white">Delete Video</h3>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-white/85">
                            <p className="text-slate-700 font-medium mb-4">
                                Are you sure you want to delete this video? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notification.show && (
                <div className={`fixed left-1/2 z-50 -translate-x-1/2 ${notification.type === "success" ? "top-4 w-max max-w-[92vw]" : "top-6 w-[min(85vw,380px)]"}`}>
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_24px_65px_-24px_rgba(15,23,42,0.5)] animate-[fadeIn_220ms_ease-out] backdrop-blur-sm">
                        <div className={`relative px-6 py-4 ${
                            notification.type === "success"
                                ? "bg-gradient-to-r from-emerald-600 to-green-600"
                                : "bg-gradient-to-r from-red-600 to-rose-600"
                        }`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/35">
                                    {notification.type === "success" ? (
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate">
                                        {notification.type === "success" ? "Video deleted" : "Error"}
                                    </h3>
                                    <p className="text-white/90 text-sm">{notification.message}</p>
                                </div>
                            </div>
                        </div>

                        {notification.type === "success" ? (
                            <div className="h-1.5 bg-white/25">
                                <div className="h-full bg-white/90 origin-left" style={{ animation: "loginPopupTimer 2000ms linear forwards" }} />
                            </div>
                        ) : (
                            <div className="px-6 py-5 bg-white/90">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setNotification({ show: false, message: "", type: "" })}
                                        className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-2xl hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes loginPopupTimer {
                    from {
                        transform: scaleX(1)
                    }
                    to {
                        transform: scaleX(0)
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px)
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0)
                    }
                }
      `}</style>
        </div>
    );
}
