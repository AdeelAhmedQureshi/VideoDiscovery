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
    <section
      id="features-section"
      className="py-16 sm:py-20 px-5 sm:px-6 bg-gradient-to-b from-white to-gray-50 scroll-mt-24"
    >
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
            Features
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
          Powerful tools for advanced video discovery and analysis
        </motion.p>
      </motion.div>
      <div className="container mx-auto max-w-7xl cursor-pointer">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                p-8 bg-white rounded-2xl
                border border-gray-100
                shadow-sm
                transition-all duration-500 ease-out
                ${feature.hoverBorder}
                hover:shadow-lg ${feature.hoverShadow}
                group
              `}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 40px -22px rgba(15, 23, 42, 0.35)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <motion.div
                className="pointer-events-none absolute -inset-10 rounded-2xl bg-[radial-gradient(600px_circle_at_0%_0%,rgba(255,255,255,0.85),rgba(255,255,255,0))] opacity-0"
                initial={false}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1, x: 18, y: 12 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <div
                className={`
                  w-14 h-14 rounded-2xl
                  ${feature.iconBg}
                  flex items-center justify-center
                  mb-5
                  transition-all duration-300
                `}
              >
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                >
                  <feature.icon
                    className={`w-7 h-7 ${feature.iconColor}`}
                  />
                </motion.div>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-gray-950 transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
