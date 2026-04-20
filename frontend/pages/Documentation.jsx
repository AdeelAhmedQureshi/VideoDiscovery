import { Upload, Video, BookOpen, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

export function Documentation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);

  // ---------- Handlers ----------
  const handleCreateAccount = () => {
    if (user) {
      setShowModal(true);
    } else {
      navigate("/auth");
    }
  };

  const handleUpload = () => {
    if (!user) navigate("/auth");
    else navigate("/dashboard/#uploadsection");
  };

  const handleRecommendation = () => {
    if (!user) navigate("/auth");
    else navigate("/dashboard/#recommendationsection");
  };

  const handleInsights = () => {
    if (!user) navigate("/auth");
    else navigate("/history");
  };

  const cardBase =
    "p-8 bg-white/90 rounded-2xl border border-slate-200/80 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)] cursor-pointer group transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_26px_44px_-24px_rgba(15,23,42,0.35)]";

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

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.96, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_8%_12%,rgba(20,184,166,0.1),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.08),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f7fbfb_48%,#f8fbff_100%)] py-16 sm:py-24 px-5 sm:px-6 mt-14">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-800 mb-10 transition-colors font-semibold"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Back</span>
        </button>

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
              className="display-font inline-block text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(20,184,166,0.35)] peer"
              variants={headingVariants}
            >
              Documentation
            </motion.h1>
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
              variants={headingVariants}
            ></motion.div>
          </div>
          <motion.p
            className="text-base sm:text-lg text-slate-600 mt-4 sm:mt-6"
            variants={headingVariants}
          >
            Get started with VideoDiscovery in just a few easy steps
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >

          {/* Card 1 */}
          <motion.div
            onClick={handleCreateAccount}
            className={`${cardBase} hover:border-teal-300 hover:shadow-teal-200/55`}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -20px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-teal-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Create an Account
            </h3>
            <p className="text-slate-600 text-sm text-center">
              Sign up quickly using your email or username.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            onClick={handleUpload}
            className={`${cardBase} hover:border-teal-300 hover:shadow-teal-200/55`}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -20px rgba(34, 211, 238, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-teal-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Upload Videos
            </h3>
            <p className="text-slate-600 text-sm text-center">
              Upload videos and let AI analyze them.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            onClick={handleRecommendation}
            className={`${cardBase} hover:border-cyan-300 hover:shadow-cyan-200/55`}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -20px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-100 to-sky-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Discover Recommendations
            </h3>
            <p className="text-slate-600 text-sm text-center">
              Explore AI-generated video suggestions.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            onClick={handleInsights}
            className={`${cardBase} hover:border-sky-300 hover:shadow-sky-200/55`}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px -20px rgba(236, 72, 153, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-sky-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Info className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              View History
            </h3>
            <p className="text-slate-600 text-sm text-center">
              View history and improve recommendations.
            </p>
          </motion.div>

        </motion.div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-8 text-center animate-modal">

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Already Registered
            </h2>

            <p className="text-gray-600 mb-6">
              You already have an account. Continue to your dashboard.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition"
              >
                Go to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
