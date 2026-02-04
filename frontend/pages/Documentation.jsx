import { Upload, Video, BookOpen, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export function Documentation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);

  // ---------- Handlers ----------
  const handleCreateAccount = () => {
    if (user) {
      setShowModal(true);
    } else {
      navigate("/auth");
    }
  };

  const handleUpload = () => {
    if (!user) navigate("/auth");
    else navigate("/dashboard/#uploadsection");
  };

  const handleRecommendation = () => {
    if (!user) navigate("/auth");
    else navigate("/dashboard#recommendationsection");
  };

  const handleInsights = () => {
    if (!user) navigate("/auth");
    else navigate("/dashboard#historysection");
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
        <div className="text-center mb-16">
          <div className="inline-block relative mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Documentation
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm"></div>
          </div>
          <p className="text-lg text-gray-500 mt-6">
            Get started with VideoDiscovery in just a few easy steps
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

          {/* Card 1 */}
          <div
            onClick={handleCreateAccount}
            className={`${cardBase} hover:border-blue-400 hover:shadow-blue-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Create an Account
            </h3>
            <p className="text-gray-600 text-sm text-center">
              Sign up quickly using your email or username.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={handleUpload}
            className={`${cardBase} hover:border-cyan-400 hover:shadow-cyan-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-100 to-cyan-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Upload Videos
            </h3>
            <p className="text-gray-600 text-sm text-center">
              Upload videos and let AI analyze them.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={handleRecommendation}
            className={`${cardBase} hover:border-purple-400 hover:shadow-purple-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-100 to-purple-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Discover Recommendations
            </h3>
            <p className="text-gray-600 text-sm text-center">
              Explore AI-generated video suggestions.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={handleInsights}
            className={`${cardBase} hover:border-pink-400 hover:shadow-pink-200/60`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-pink-100 to-pink-50 mb-5 mx-auto group-hover:scale-110 transition-transform">
              <Info className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              View History
            </h3>
            <p className="text-gray-600 text-sm text-center">
              View history and improve recommendations.
            </p>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-modal">

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Already Registered
            </h2>

            <p className="text-gray-600 mb-6">
              You already have an account. Continue to your dashboard.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition"
              >
                Go to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
