
import { Upload, Video } from "lucide-react";
import { motion } from "framer-motion"; 

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-white mt-16">
      
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
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Animated Heading */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Discover Videos with
            <span className="block mt-3 text-blue-500 ">
              AI-Powered Intelligence
            </span>
          </motion.h1>

          {/* Animated Description */}
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            Upload any video and let our advanced multimodal AI analyze visual, audio, and textual content to discover semantically related videos from across the web.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Upload className="w-5 h-5" />
              Upload Video
            </motion.button>

            {/* UPDATED BUTTON: Changed to motion.a and added href */}
            <motion.a 
              href="/documentation" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border-2 border-gray-200 transition-all duration-200 text-base"
            >
              <Video className="w-5 h-5" />
              Learn More
            </motion.a>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.3 }
              }
            }}
          >
            {[
              { title: "YOLO", desc: "Object Detection" },
              { title: "Whisper", desc: "Speech-to-Text" },
              { title: "CLIP", desc: "Visual Embedding" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.3 }}
              >
                <div className="text-4xl font-bold text-cyan-500">{stat.title}</div>
                <div className="text-sm text-gray-600">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
