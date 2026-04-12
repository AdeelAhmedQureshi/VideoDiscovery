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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[radial-gradient(circle_at_10%_12%,rgba(20,184,166,0.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.1),transparent_36%),linear-gradient(180deg,#f4fbfa_0%,#f8fcff_46%,#ffffff_100%)]">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-sm p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-100">
            <ShieldCheck size={14} />
            Account Recovery
          </span>
        </div>

        <h2 className="display-font text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Forgot Password</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {step === "email"
            ? "Enter your account email to receive a one-time OTP."
            : "Enter the 6-digit OTP sent to your email."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100/70 p-1">
          <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${step === "email" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>
            1. Email
          </div>
          <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${step === "otp" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>
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
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl brand-ring outline-none bg-white"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition disabled:from-teal-300 disabled:to-cyan-300"
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
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl tracking-[0.35em] brand-ring outline-none bg-white"
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
                className="w-full py-3 border border-teal-500 text-teal-700 hover:bg-teal-50 rounded-xl font-semibold transition"
              >
                Back
              </button>
              <button
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition disabled:from-teal-300 disabled:to-cyan-300"
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

