import { Upload, Video, BookOpen, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../contexts/AuthContext";

export function Documentation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProtectedNav = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };
  const cardBase =
    "p-8 bg-white rounded-2xl border border-gray-100 shadow-lg cursor-pointer group transition-all duration-300 hover:-translate-y-4 hover:shadow-xl";

  return (
    <section className="min-h-screen bg-linear-to-b from-white to-gray-50 py-24 px-6 mt-14">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Documentation
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn how to use VideoDiscovery to analyze videos and discover related content with AI-powered insights.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

          {/* Step 1 */}
          <div
            onClick={() => navigate("/auth")}
            className={`${cardBase} hover:border-blue-400 hover:shadow-blue-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-950 transition-colors">
              Create an Account
            </h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
              Sign up quickly using your email or username to start using VideoDiscovery.
            </p>
          </div>


          {/* Step 2 */}
          <div
            onClick={handleProtectedNav}
            className={`${cardBase} hover:border-cyan-400 hover:shadow-cyan-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-950 transition-colors">
              Upload Videos
            </h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
              Upload your videos and let the AI start analyzing the content.
            </p>
          </div>


          {/* Step 3 */}
          <div
            onClick={handleProtectedNav}
            className={`${cardBase} hover:border-purple-400 hover:shadow-purple-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-100 to-purple-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-950 transition-colors">
              Discover Recommendations
            </h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
              Explore AI-generated related videos using multimodal analysis.
            </p>
          </div>


          {/* Step 4 */}
          <div
            onClick={handleProtectedNav}
            className={`${cardBase} hover:border-pink-400 hover:shadow-pink-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-pink-100 to-pink-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Info className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-950 transition-colors">
              Data Insights & History
            </h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
              View analysis history and refine recommendations with feedback.
            </p>
          </div>


        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/auth"
            className="inline-block px-10 py-4 bg-cyan-500 hover:bg-cyan-600
                       text-white text-lg font-semibold rounded-xl
                       shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
          </a>
        </div>

      </div>
    </section>
  );
}
