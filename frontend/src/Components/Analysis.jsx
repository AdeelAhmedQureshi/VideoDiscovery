import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Brain, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardStats() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [data, setData] = useState({
    total_videos: 0,
    total_feedback: 0,
    total_recommendations: 0,
  });

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSessionExpired(true);
      setError("Not signed in. Please log in to view stats.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/users/account-stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setSessionExpired(true);
          setError("Session expired. Please sign in again.");
        } else {
          setSessionExpired(false);
          setError("Failed to load stats. Try again later.");
        }
        setLoading(false);
        return;
      }

      const json = await res.json();
      setSessionExpired(false);
      setError("");
      console.log("[Dashboard] Stats response:", json);
      const statsObj = json?.data?.statistics ?? json?.statistics ?? json;
      const mapped = {
        total_videos:
          statsObj?.total_videos ?? statsObj?.video_count ?? statsObj?.videos ?? 0,
        total_feedback:
          statsObj?.total_feedback ?? statsObj?.feedback_count ?? statsObj?.feedback ?? 0,
        total_recommendations:
          statsObj?.total_recommendations ?? statsObj?.recommendation_count ?? statsObj?.recommendations ?? 0,
      };
      setData(mapped);
      setLoading(false);
    } catch (e) {
      setSessionExpired(false);
      setError("Network error while loading stats.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    fetchStats();

    // Listen for upload events to refresh stats
    const handler = () => {
      setLoading(true);
      fetchStats();
    };
    window.addEventListener("videoUploaded", handler);
    return () => window.removeEventListener("videoUploaded", handler);
  }, [fetchStats]);

  const stats = [
    {
      title: "Total Videos",
      value: loading || sessionExpired ? "—" : String(data.total_videos),
      icon: <Video size={28} />,
      color: "from-teal-600 to-cyan-500",
      hoverBorder: "hover:border-teal-200",
      link: "/videos",
    },
    {
      title: "AI Recommendations",
      value: loading || sessionExpired ? "—" : String(data.total_recommendations),
      icon: <Brain size={28} />,
      color: "from-indigo-500 to-purple-400",
      hoverBorder: "hover:border-indigo-400",
      link: "/recommendations",
    },
    {
      title: "Feedback Submitted",
      value: loading || sessionExpired ? "—" : String(data.total_feedback),
      icon: <MessageSquare size={28} />,
      color: "from-pink-500 to-rose-400",
      hoverBorder: "hover:border-pink-400",
      link: "/feedback",
    },
  ];

  // Same animation style as Hero text
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: i * 0.15,
      },
    }),
  };

  return (
    <section className="w-full bg-[linear-gradient(180deg,#f7fbfb_0%,#ffffff_55%,#f8fbff_100%)] py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sessionExpired && (
          <div className="mb-6 sm:mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm sm:text-base font-semibold text-amber-900">
                Your session has expired. Please sign in again to refresh dashboard stats.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="self-start sm:self-auto rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Sign In Again
              </button>
            </div>
          </div>
        )}

        {!sessionExpired && error && (
          <div className="mb-6 sm:mb-8 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
            <p className="text-sm sm:text-base font-semibold text-rose-900">{error}</p>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          initial="hidden"
          animate="visible"
        >
          {stats.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              onClick={() => navigate(item.link)}
              className={`
                relative overflow-hidden rounded-xl sm:rounded-2xl
                bg-white/85 backdrop-blur-lg
                shadow-md p-4 sm:p-5 md:p-6
                border border-slate-200/70 ${item.hoverBorder}
                cursor-pointer
                transition-all duration-300
              `}
            >
              {/* Glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.color}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.18 }}
                transition={{ duration: 0.3 }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-3 sm:gap-4 md:gap-5 items-center text-center sm:items-start sm:text-left">
                <div
                  className={`w-fit p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-white bg-gradient-to-br ${item.color} shadow-md mx-auto sm:mx-0`}
                >
                  {item.icon}
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>

                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
