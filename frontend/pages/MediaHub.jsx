import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TotalVideosSection } from "@/Components/TotalVideosSection";
import { AIRecommendationsSection } from "@/Components/AIRecommendationsSection";
import { UserFeedbackSection } from "@/Components/UserFeedbackSection";
import { motion } from "framer-motion";

export default function MediaHub() {
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
    <div className="min-h-screen font-sans text-slate-800 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_46%,#f8fbff_100%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
        {/* Back Button */}
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
              Media Hub
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
            Manage your videos, explore AI recommendations, and track feedback all in one place
          </motion.p>
        </motion.div>

        {/* Videos Section */}
        <section className="mb-20 scroll-mt-24">
          <TotalVideosSection />
        </section>

        {/* Recommendations Section */}
        <section className="mb-20 scroll-mt-24">
          <AIRecommendationsSection />
        </section>

        {/* Feedback Section */}
        <section className="scroll-mt-24">
          <UserFeedbackSection />
        </section>
      </div>
    </div>
  );
}
