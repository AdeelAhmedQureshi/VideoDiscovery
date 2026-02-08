import { Play, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const mockRecommendations = [
  {
    id: 1,
    title: "AI-Powered Video Analysis Tutorial",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    duration: "12:34",
    similarity: 95,
    tags: ["AI", "Machine Learning", "Tutorial"],
  },
  {
    id: 2,
    title: "Computer Vision in Modern Applications",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
    duration: "8:45",
    similarity: 92,
    tags: ["Computer Vision", "AI"],
  },
  {
    id: 3,
    title: "Deep Learning for Video Understanding",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop",
    duration: "15:20",
    similarity: 89,
    tags: ["Deep Learning", "Neural Networks"],
  },
  {
    id: 4,
    title: "Object Detection with YOLO Explained",
    thumbnail: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=225&fit=crop",
    duration: "10:15",
    similarity: 87,
    tags: ["YOLO", "Object Detection"],
  },
  {
    id: 5,
    title: "Speech Recognition Technology Overview",
    thumbnail: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=225&fit=crop",
    duration: "9:30",
    similarity: 85,
    tags: ["Speech Recognition", "NLP"],
  },
  {
    id: 6,
    title: "Multimodal AI: The Future of Understanding",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    duration: "14:50",
    similarity: 84,
    tags: ["Multimodal AI", "Future Tech"],
  },
];

export function RecommendationsSection() {
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
    <section className="py-16 sm:py-24 px-5 sm:px-6 bg-white" id="recommendation-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
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
              Recommended Videos
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
            Based on multimodal analysis of your video content, here are the most semantically similar videos we found.
          </motion.p>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockRecommendations.map((video) => (
            <div
              key={video.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-medium">
                  {video.duration}
                </div>

                {/* Similarity badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold shadow-md">
                  {video.similarity}% Match
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2.5">
                <h3 className="font-semibold text-sm sm:text-base leading-tight text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] sm:text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <div className="flex items-center text-xs sm:text-sm text-cyan-600 font-medium pt-1">
                  <span>Watch Video</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}