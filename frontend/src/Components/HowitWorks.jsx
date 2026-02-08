import { motion } from "framer-motion";

export function HowItWorks() {
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
    <>
      <div id="howitworks" className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 sm:p-10 lg:p-12 mb-16 mx-4 sm:mx-6">
        <motion.div
          className="text-center mb-10 sm:mb-16"
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
              How it Works
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
            Three simple steps to unlock powerful video discovery
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={containerVariants}
        >
          <motion.div
            className="text-center space-y-3 rounded-2xl p-4 transition-colors duration-300"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 40px -22px rgba(15, 23, 42, 0.35)" }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="text-5xl font-bold text-cyan-500">01</div>
            <h4 className="inline-block text-xl font-semibold text-gray-900 transition-all duration-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 hover:tracking-wide hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]">Video Analysis</h4>
            <p className="text-gray-600 text-medium">Our AI extracts visual features, audio transcripts from your uploaded video.</p>
          </motion.div>
          <motion.div
            className="text-center space-y-3 rounded-2xl p-4 transition-colors duration-300"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 40px -22px rgba(15, 23, 42, 0.35)" }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="text-5xl font-bold text-cyan-500">02</div>
            <h4 className="inline-block text-xl font-semibold text-gray-900 transition-all duration-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 hover:tracking-wide hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]">Semantic Matching</h4>
            <p className="text-gray-600 text-medium">Using CLIP, YOLO, and Whisper and other models, we create multimodal embeddings for deep content understanding.</p>
          </motion.div>
          <motion.div
            className="text-center space-y-3 rounded-2xl p-4 transition-colors duration-300"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 40px -22px rgba(15, 23, 42, 0.35)" }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="text-5xl font-bold text-cyan-500">03</div>
            <h4 className="inline-block text-xl font-semibold text-gray-900 transition-all duration-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 hover:tracking-wide hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]">Recommendations</h4>
            <p className="text-gray-600 text-medium">Discover semantically similar videos from across the web based on comprehensive AI analysis.</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  )


}