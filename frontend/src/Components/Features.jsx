import { Eye, Mic, FileText, Zap, Shield, TrendingUp } from "lucide-react";

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
  return (
    <section
      id="features-section"
      className="py-5 px-6 bg-gradient-to-b from-white to-gray-50 scroll-mt-24"
    >
      <div className="text-center mb-16">
        <div className="inline-block relative mb-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Features
          </h1>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm"></div>
        </div>
        <p className="text-lg text-gray-500 mt-6">Powerful tools for advanced video discovery and analysis</p>
      </div>
      <div className="container mx-auto max-w-7xl cursor-pointer">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                p-8 bg-white rounded-2xl
                border border-gray-100
                shadow-sm
                transition-all duration-300 ease-out
                hover:-translate-y-4
                ${feature.hoverBorder}
                hover:shadow-lg ${feature.hoverShadow}
                group
              `}
            >
              <div
                className={`
                  w-14 h-14 rounded-2xl
                  ${feature.iconBg}
                  flex items-center justify-center
                  mb-5
                  transition-all duration-300
                  group-hover:scale-110
                  group-hover:rotate-3
                `}
              >
                <feature.icon
                  className={`w-7 h-7 ${feature.iconColor}`}
                />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-gray-950 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
