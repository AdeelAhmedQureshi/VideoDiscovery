import { Upload, Video, BookOpen, Info } from "lucide-react";

export function Documentation() {
  return (
    <section className="min-h-screen bg-linear-to-b from-white to-gray-50 py-24 px-6 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Documentation</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn how to use VideoDiscovery to analyze videos and discover related content with AI-powered insights.
          </p>
        </div>

        {/* Steps Grid (Kept as is) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* Step 1 */}
          <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Create an Account</h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              Sign up quickly using your email or username to start using VideoDiscovery.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Upload Videos</h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              Upload your videos in supported formats and let the AI start analyzing the content.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-100 to-purple-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Discover Recommendations</h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              Explore AI-generated related videos based on visual, audio, and text analysis.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-pink-100 to-pink-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Info className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Data Insights & History</h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              View multimodal analysis results, and use the user feedback to continuously refine recommendation accuracy.
            </p>
          </div>

        </div>

        

        {/* CTA - UPDATED */}
        <div className="text-center">
          <a
            href="/auth" // Navigate to the /auth page
            className="inline-block px-10 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
          </a>
          {/* <p className="text-gray-500 text-sm mt-4">No credit card required • Free to start</p> */}
        </div>
      </div>
    </section>
  );
}