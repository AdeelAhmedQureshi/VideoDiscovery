import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export function RecommendationFeedback({ videoId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittedRating, setSubmittedRating] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/api/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          video_id: videoId,
          rating,
          comment: comment || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Failed to submit feedback");
      }

      await response.json();
      setSubmittedRating(rating);
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);

      // Reset form fields after success toast state appears.
      setTimeout(() => {
        setRating(0);
        setComment("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-3xl mx-auto mb-12"
    >
      {feedbackSubmitted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Thank You for Your Feedback!
          </h3>
          <p className="text-green-700">
            Your feedback helps us improve our recommendations.
          </p>
          {submittedRating > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm font-semibold text-green-800">
                Submitted Rating: {submittedRating}/5
              </p>
              <div
                className="flex items-center gap-1"
                aria-label={`Submitted rating ${submittedRating} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`submitted-star-${star}`}
                    className={`w-5 h-5 ${
                      submittedRating >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : !showFeedbackForm ? (
        <button
          onClick={() => setShowFeedbackForm(true)}
          className="w-full bg-white/92 border-2 border-teal-200 hover:border-teal-400 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg group"
        >
          <div className="flex items-center justify-center gap-3">
            <MessageSquare className="w-6 h-6 text-teal-700 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-slate-800">
              Share Your Feedback (Optional)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            How satisfied are you with these recommendations?
          </p>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Share Your Feedback
            </h3>
            <p className="text-cyan-50 text-sm mt-1">
              Help us improve your experience
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rate these recommendations 
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-medium text-gray-600">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Comments 
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setRating(0);
                  setComment("");
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                disabled={submittingFeedback}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submittingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}