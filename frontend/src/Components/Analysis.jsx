import { useEffect, useState, useCallback } from "react";
import { Video, Brain, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    total_videos: 0,
    total_feedback: 0,
    total_recommendations: 0,
  });

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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
          setError("Session expired. Please sign in again.");
        } else {
          setError("Failed to load stats. Try again later.");
        }
        setLoading(false);
        return;
      }

      const json = await res.json();
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
      value: loading ? "—" : String(data.total_videos),
      icon: <Video size={28} />,
      color: "from-cyan-500 to-teal-400",
      hoverBorder: "hover:border-cyan-200",
    },
    {
      title: "AI Recommendations",
      value: loading ? "—" : String(data.total_recommendations),
      icon: <Brain size={28} />,
      color: "from-indigo-500 to-purple-400",
      hoverBorder: "hover:border-indigo-400",
    },
    {
      title: "Feedback Submitted",
      value: loading ? "—" : String(data.total_feedback),
      icon: <MessageSquare size={28} />,
      color: "from-pink-500 to-rose-400",
      hoverBorder: "hover:border-pink-400",
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
    <section className="max-h-10 bg-gradient-to-br from-cyan-50 to-slate-100 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
              className={`
                relative overflow-hidden rounded-2xl
                bg-white/70 backdrop-blur-lg
                shadow-md p-5 sm:p-6
                border border-transparent ${item.hoverBorder}
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
              <div className="relative z-10 flex flex-col gap-5 items-center text-center sm:items-start sm:text-left">
                <div
                  className={`w-fit p-3 rounded-xl text-white bg-gradient-to-br ${item.color} shadow-md mx-auto sm:mx-0`}
                >
                  {item.icon}
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>

                <p className="text-sm font-medium text-gray-600">
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
