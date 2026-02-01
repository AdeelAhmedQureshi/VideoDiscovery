import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../Services/ForgotPasswordAPI";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation function
  const validatePassword = (pwd) => {
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(pwd) &&
      upper.test(pwd) &&
      lower.test(pwd) &&
      number.test(pwd) &&
      special.test(pwd)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    if (!validatePassword(password)) {
      return setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      navigate("/auth");
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
          Reset Password
        </h2>

        {error && (
          <p className="mt-4 text-red-500 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              New Password
            </label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
