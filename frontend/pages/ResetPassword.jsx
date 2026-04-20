import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, CircleCheck, CircleX, ArrowLeft } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
  const [success, setSuccess] = useState("");
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

    if (!token) {
      return setError("Invalid or missing reset token. Please verify OTP again.");
    }

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
    setSuccess("");

    try {
      await resetPassword(token, password);
      setSuccess("Password updated successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/auth"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checks = {
    minLength: /.{8,}/.test(password),
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allChecksPassed = Object.values(checks).every(Boolean);

  const RequirementItem = ({ ok, text }) => (
    <li className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-600" : "text-slate-500"}`}>
      {ok ? <CircleCheck size={14} /> : <CircleX size={14} />}
      <span>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[radial-gradient(circle_at_10%_12%,rgba(20,184,166,0.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.1),transparent_36%),linear-gradient(180deg,#f4fbfa_0%,#f8fcff_46%,#ffffff_100%)]">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-sm p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-100">
            <ShieldCheck size={14} />
            Secure Reset
          </span>
        </div>

        <h2 className="display-font text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a strong new password for your account.
        </p>

        {success && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl brand-ring outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl brand-ring outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Password must include:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <RequirementItem ok={checks.minLength} text="At least 8 characters" />
              <RequirementItem ok={checks.upper} text="One uppercase letter" />
              <RequirementItem ok={checks.lower} text="One lowercase letter" />
              <RequirementItem ok={checks.number} text="One number" />
              <RequirementItem ok={checks.special} text="One special character" />
              <RequirementItem ok={confirm.length > 0 && password === confirm} text="Passwords match" />
            </ul>
          </div>

          <button
            disabled={loading || !allChecksPassed || password !== confirm}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-teal-300 disabled:to-cyan-300 text-white rounded-xl font-semibold transition"
          >
            {loading ? "Resetting..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
