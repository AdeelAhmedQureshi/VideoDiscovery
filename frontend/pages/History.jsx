import {
    Video,
    Brain,
    MessageSquare,
    Calendar,
    Star,
    ArrowUpRight,
    Clock,
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function History() {
    const historyData = [
        {
            id: 1,
            title: "Machine Learning Basics",
            date: "12 Jan 2026",
            recommendations: 5,
            feedback: "Very helpful content, explained clearly.",
            duration: "12:05",
            rating: 4.8,
        },
        {
            id: 2,
            title: "React Hooks Explained",
            date: "20 Jan 2026",
            recommendations: 3,
            feedback: null,
            duration: "08:30",
            rating: 4.5,
        },
        {
            id: 3,
            title: "AI in Healthcare",
            date: "02 Feb 2026",
            recommendations: 7,
            feedback: "Excellent recommendations on diagnostics.",
            duration: "24:15",
            rating: 4.9,
        },
    ];
    const navigate = useNavigate();

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
        <div className="min-h-screen font-sans text-gray-800 bg-white">

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
                        className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition font-semibold cursor-pointer"
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
                            className="inline-block text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] peer"
                            variants={headingVariants}
                        >
                            History & Activity
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
                        Review your recent video interactions and Recommendations
                    </motion.p>
                </motion.div>

                {/* Section Header (Light only) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <button className="text-sm text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-2 transition-all duration-300 hover:gap-3 bg-white hover:bg-cyan-50 px-4 py-2 rounded-lg border border-cyan-300 shadow">
                        View all <ArrowUpRight className="w-4 h-4 text-cyan-600" />
                    </button>
                </div>

                {/* Cards */}
                <div className="grid gap-6">
                    {historyData.map((item, index) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl "
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Light Background */}
                            <div className="absolute inset-0 border border-gray-200 group-hover:border-cyan-400 transition-all duration-500"></div>

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 "></div>

                            <div className="relative p-7 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                                    <div className="flex items-start gap-5 flex-1">

                                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-100 to-indigo-100 text-cyan-600 shrink-0 border border-cyan-200 shadow">
                                            <Video className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors duration-300">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                    <Calendar className="w-4 h-4" />
                                                    {item.date}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                    <Clock className="w-4 h-4" />
                                                    {item.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-300 px-4 py-3 rounded-xl text-center min-w-max">
                                        <p className="text-yellow-600 font-bold text-lg flex items-center gap-1">
                                            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                            {item.rating}
                                        </p>
                                        <p className="text-xs text-yellow-600/70 mt-1">Rating</p>
                                    </div>
                                </div>

                                <div className="my-6 h-px bg-gradient-to-r from-gray-200 via-cyan-200 to-gray-200 w-full" />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                                    {/* Recommendations */}
                                    <div className="md:col-span-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border border-indigo-200">
                                                <Brain className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">
                                                    AI Recommendations
                                                </p>
                                                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                                    {item.recommendations}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div className="md:col-span-8 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 border border-pink-200">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
                                                    User Feedback
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {item.feedback ? (
                                                        <span className="italic text-cyan-600">"{item.feedback}"</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No feedback submitted yet.</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-500"></div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}
