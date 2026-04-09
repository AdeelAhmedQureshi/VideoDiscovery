import { useState } from "react";
import { Mail, KeyRound, ArrowLeft, ShieldCheck, CircleCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyResetOtp } from "../Services/ForgotPasswordAPI";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await forgotPassword(email);
      setStep("otp");
      setSuccess("OTP sent to your email. Enter it below to continue.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await verifyResetOtp(email, otp);
      const resetToken = res?.data?.reset_token;

      if (!resetToken) {
        throw new Error("Reset token not received");
      }

      setSuccess("OTP verified. Redirecting to reset password...");
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-100 bg-white/95 shadow-xl backdrop-blur-sm p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            <ShieldCheck size={14} />
            Account Recovery
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Forgot Password</h2>
        <p className="text-sm text-slate-500 mt-2">
          {step === "email"
            ? "Enter your account email to receive a one-time OTP."
            : "Enter the 6-digit OTP sent to your email."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${step === "email" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500"}`}>
            1. Email
          </div>
          <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${step === "otp" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500"}`}>
            2. OTP Verify
          </div>
        </div>

        {success && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 inline-flex items-start gap-2">
            <CircleCheck size={16} className="mt-0.5" />
            <span>{success}</span>
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-300 outline-none"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition disabled:bg-cyan-300"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">6-digit OTP</label>
              <div className="relative mt-1">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl tracking-[0.35em] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-300 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Tip: OTP expires in 10 minutes.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full py-3 border border-cyan-500 text-cyan-700 hover:bg-cyan-50 rounded-xl font-semibold transition"
              >
                Back
              </button>
              <button
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition disabled:bg-cyan-300"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

