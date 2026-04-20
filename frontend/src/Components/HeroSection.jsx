
import { Video } from "lucide-react";
import { motion } from "framer-motion"; 

export function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden mt-6">
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 soft-grid opacity-35" />
        <motion.div 
          className="absolute top-[12%] left-[10%] w-[28rem] h-[28rem] bg-teal-200/35 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.4, 0.7] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div 
          className="absolute bottom-[8%] right-[8%] w-[30rem] h-[30rem] bg-sky-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ repeat: Infinity, duration: 5, delay: 1 }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/40"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10 pt-16 sm:pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <motion.div
            className="mx-auto w-fit rounded-full border border-teal-200/80 bg-white/70 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-teal-700"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Multimodal Discovery Platform
          </motion.div>
          
          {/* Animated Heading */}
          <motion.h1
            className="display-font text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-900 px-2 sm:px-3 md:px-4 w-full overflow-visible break-words whitespace-normal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap justify-center cursor-default">
              {["Discover", "Videos", "with"].map((word, i) => (
                <motion.span
                  key={word}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <motion.span 
              className="block mt-3 sm:mt-4 md:mt-5 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent bg-[length:200%_200%] transition-all duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_18px_rgba(13,148,136,0.4)] cursor-default px-1 word-break"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              AI-Powered Intelligence
            </motion.span>
          </motion.h1>

          {/* Animated Description */}
          <motion.p
            className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed group cursor-default px-2 break-words"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <span className="transition-all duration-300 hover:text-gray-800">
              Upload any video and let our  
            </span>
            <b></b>
            <span className="font-semibold text-teal-700 transition-all duration-300 hover:text-teal-600 hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.35)]">
                 advanced multimodal AI 
            </span>
            <span className="transition-all duration-300 hover:text-gray-800">
               analyze visual, audio, and textual content to discover 
            </span>
            <span className="font-semibold text-sky-700 transition-all duration-300 hover:text-sky-600 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]">
               semantically related videos 
            </span>
            <span className="transition-all duration-300 hover:text-gray-800">
               from across the web.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 sm:pt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <motion.a 
              href="/documentation" 
              whileHover={{ scale: 1.05, boxShadow: "0 22px 42px -16px rgba(13, 148, 136, 0.45)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-[0_14px_30px_rgba(14,116,144,0.35)] transition-all duration-300 text-base overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Video className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative">Learn More</span>
            </motion.a>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {["Visual + Audio + Text", "Semantic Matching Engine", "Fast Insight Delivery"].map((item) => (
              <div
                key={item}
                className="glass-panel rounded-xl px-4 py-3 text-sm sm:text-base text-slate-700 font-semibold"
              >
                {item}
              </div>
            ))}
          </motion.div>

        </div>
      </div>      
    </section>
  );
}
