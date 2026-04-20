import { Eye, Mic, FileText, Zap, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Eye,
    title: "Visual Analysis",
    description: "YOLO-powered object detection identifies key elements, scenes, and objects within your video content.",
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-500",
    hoverBorder: "hover:border-cyan-400",
    hoverShadow: "hover:shadow-cyan-200/60",
  },
  {
    icon: Mic,
    title: "Audio Processing",
    description: "Whisper AI transcribes speech and audio with high accuracy for comprehensive content understanding.",
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-400",
    hoverShadow: "hover:shadow-orange-200/60",
  },
  {
    icon: FileText,
    title: "Text Embedding",
    description: "CLIP generates powerful visual-text embeddings for semantic similarity matching.",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconColor: "text-blue-500",
    hoverBorder: "hover:border-blue-400",
    hoverShadow: "hover:shadow-blue-200/60",
  },
  {
    icon: Zap,
    title: "Rapid Multimodal Analysis",
    description: "Optimized pipeline to quickly extract and fuse visual, audio, and text features.",
    iconBg: "bg-gradient-to-br from-yellow-100 to-yellow-50",
    iconColor: "text-yellow-600",
    hoverBorder: "hover:border-yellow-400",
    hoverShadow: "hover:shadow-yellow-200/60",
  },
  {
    icon: Shield,
    title: "Secure & Confidential",
    description: "User data is protected with secure hashing (bcrypt), and uploaded videos ensure privacy and confidentiality.",
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-500",
    hoverBorder: "hover:border-cyan-400",
    hoverShadow: "hover:shadow-cyan-200/60",
  },
  {
    icon: TrendingUp,
    title: "Semantic Search & Recommendation",
    description: "Multimodal Fusion generates a context-aware semantic query to fetch and rank highly relevant results.",
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-400",
    hoverShadow: "hover:shadow-orange-200/60",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delayChildren: 0.02,
        staggerChildren: 0.06,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.96, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="features-section"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_44%,#f8fbff_100%)] scroll-mt-24"
    >
      <motion.div
        className="text-center mb-12 sm:mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.7 }}
        variants={containerVariants}
      >
        <div className="inline-block relative mb-4">
          <motion.h1
            className="display-font inline-block text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-300 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(20,184,166,0.35)] peer"
            variants={headingVariants}
          >
            Features
          </motion.h1>
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full blur-sm transition-all duration-300 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
            variants={headingVariants}
          ></motion.div>
        </div>
        <motion.p
          className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 sm:mt-4 md:mt-6 px-4"
          variants={headingVariants}
        >
          Powerful tools for advanced video discovery and analysis
        </motion.p>
      </motion.div>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`
                relative overflow-hidden
                p-5 sm:p-6 md:p-8 bg-white/90 rounded-xl sm:rounded-2xl
                border border-slate-200/80
                shadow-[0_16px_36px_-24px_rgba(15,23,42,0.38)]
                transition-all duration-300 ease-out
                ${feature.hoverBorder}
                hover:shadow-[0_24px_44px_-22px_rgba(15,23,42,0.35)] ${feature.hoverShadow}
                group
                cursor-pointer
              `}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 40px -22px rgba(15, 23, 42, 0.35)" }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <motion.div
                className="pointer-events-none absolute -inset-10 rounded-2xl bg-[radial-gradient(600px_circle_at_0%_0%,rgba(255,255,255,0.85),rgba(255,255,255,0))] opacity-0"
                initial={false}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1, x: 18, y: 12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              <div
                className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl
                  ${feature.iconBg}
                  flex items-center justify-center
                  mb-4 sm:mb-5
                  transition-all duration-200
                `}
              >
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <feature.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`}
                  />
                </motion.div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900 group-hover:text-slate-950 transition-colors duration-200">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-200">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
