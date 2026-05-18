import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TotalVideosSection } from "@/Components/TotalVideosSection";

export default function VideosPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_46%,#f8fbff_100%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 font-bold" />
            Back
          </button>
        </div>

        {/* Videos Section */}
        <TotalVideosSection />
      </div>
    </div>
  );
}
