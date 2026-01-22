import { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../Services/ForgotPasswordAPI";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf7fb] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your email to receive a reset link
        </p>

        {success && (
          <p className="mt-4 text-green-600 text-sm font-medium">
            {success}
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-500 text-sm font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email
            </label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="text-cyan-600 hover:underline text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

