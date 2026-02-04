import { Play, ExternalLink } from "lucide-react";

// Mock data for demonstration
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

export  function RecommendationsSection() {
  return (
    <section className="py-24 px-6 bg-white" id="recommendation-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Recommended Videos
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Based on multimodal analysis of your video content, here are the most semantically similar videos we found.
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="p-5 space-y-3">
                <h3 className="font-semibold text-base leading-tight text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <div className="flex items-center text-sm text-cyan-600 font-medium pt-1">
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