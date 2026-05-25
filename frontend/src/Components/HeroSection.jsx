
import { Upload, Video } from "lucide-react";
import { motion } from "framer-motion"; 

export function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-white mt-6">
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.4, 0.7] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
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
          
          {/* Animated Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="inline-flex gap-3 sm:gap-4 flex-wrap justify-center cursor-default">
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
              className="block mt-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-all duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_18px_rgba(34,211,238,0.5)] cursor-default"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              AI-Powered Intelligence
            </motion.span>
          </motion.h1>

          {/* Animated Description */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed group cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <span className="transition-all duration-300 hover:text-gray-800">
              Upload any video and let our  
            </span>
            <span className="font-medium text-cyan-600 transition-all duration-300 hover:text-cyan-500 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                 advanced multimodal AI 
            </span>
            <span className="transition-all duration-300 hover:text-gray-800">
               analyze visual, audio, and textual content to discover 
            </span>
            <span className="font-medium text-blue-600 transition-all duration-300 hover:text-blue-500 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">
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
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -15px rgba(34, 211, 238, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-xl shadow-lg transition-all duration-300 text-base overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Video className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative">Learn More</span>
            </motion.a>
          </motion.div>

        </div>
      </div>      
    </section>
  );
}
