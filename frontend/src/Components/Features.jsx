import { Eye, Mic, FileText, Zap, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Analysis",
    description: "YOLO-powered object detection identifies key elements, scenes, and objects within your video content.",
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-500",
  },
  {
    icon: Mic,
    title: "Audio Processing",
    description: "Whisper AI transcribes speech and audio with high accuracy for comprehensive content understanding.",
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: FileText,
    title: "Text Embedding",
    description: "CLIP generates powerful visual-text embeddings for semantic similarity matching.",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: Zap,
    title: "Rapid Multimodal Analysis", // UPDATED TITLE
    description: "Optimized pipeline to quickly extract and fuse visual, audio, and text features.", // UPDATED DESCRIPTION
    iconBg: "bg-gradient-to-br from-yellow-100 to-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    icon: Shield,
    title: "Secure & Confidential", // UPDATED TITLE
    description: "User data is protected with secure hashing (bcrypt), and uploaded videos ensure privacy and confidentiality.", // UPDATED DESCRIPTION
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Semantic Search & Recommendation", // ENHANCED TITLE
    description: "Multimodal Fusion generates a context-aware semantic query to fetch and rank highly relevant results.", // ENHANCED DESCRIPTION
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    iconColor: "text-orange-500",
  },
];

export  function Features() {
  return (
    <section id="features-section" className="py-24 px-6 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}