import { useState } from 'react';
import { Video, Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const nav = useNavigate();
  const { signIn, signUp, sendReactivationCode, verifyReactivation } = useAuth();
  const [deactivatedNotice, setDeactivatedNotice] = useState('');
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateEmail, setReactivateEmail] = useState('');
  const [reactivateCode, setReactivateCode] = useState('');
  const [reactivateSending, setReactivateSending] = useState(false);
  const [reactivateVerifying, setReactivateVerifying] = useState(false);
  const [reactivateMessage, setReactivateMessage] = useState('');
  const [reactivateError, setReactivateError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsNoticeOpen, setTermsNoticeOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDeactivatedNotice('');

    try {
      if (isSignUp) {
        if (!agreeToTerms) {
          setTermsNoticeOpen(true);
          setIsLoading(false);
          return;
        }
        await signUp(fullName, email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error(err);
      // Auto-suggest reactivation when backend indicates deactivation
      const msg = (err?.message || '').toLowerCase();
      if (!isSignUp && (msg.includes('deactivated') || msg.includes('deactivate'))) {
        setReactivateEmail(email);
        setDeactivatedNotice('Your account is deactivated. Do you want to reactivate it?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartReactivation = async () => {
    const targetEmail = reactivateEmail || email;
    if (!targetEmail) {
      setReactivateError('Please enter your email first.');
      setReactivateOpen(true);
      return;
    }

    setReactivateError('');
    setReactivateMessage('');
    setReactivateCode('');
    setReactivateEmail(targetEmail);
    setReactivateOpen(true);
    setReactivateSending(true);

    try {
      const res = await sendReactivationCode(targetEmail);
      setReactivateMessage(res?.message || 'Verification code sent to your email.');
    } catch (err) {
      setReactivateError(err.message || 'Unable to send verification code.');
    } finally {
      setReactivateSending(false);
    }
  };

  const handleVerifyReactivation = async (e) => {
    e.preventDefault();
    setReactivateError('');
    setReactivateVerifying(true);
    try {
      await verifyReactivation(reactivateEmail, reactivateCode);
      setReactivateOpen(false);
      setReactivateCode('');
      setReactivateMessage('');
    } catch (err) {
      setReactivateError(err.message || 'Invalid or expired code.');
    } finally {
      setReactivateVerifying(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 mt-6 bg-[radial-gradient(circle_at_8%_14%,rgba(20,184,166,0.12),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(14,165,233,0.1),transparent_36%),linear-gradient(180deg,#f4fbfa_0%,#f8fcff_45%,#ffffff_100%)]">

      {/* Back Button */}
      <button
        onClick={() => nav('/')}
        className="self-start ml-2 sm:ml-10 mb-4 text-slate-600 hover:text-teal-700 font-semibold flex items-center gap-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 sm:w-17 sm:h-17 rounded-3xl bg-linear-to-br from-teal-500 via-cyan-500 to-sky-500 flex items-center justify-center shadow-[0_14px_30px_rgba(14,116,144,0.32)]">
            <Video className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="display-font text-2xl sm:text-3xl font-bold text-slate-900">VideoDiscovery</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">AI-powered video understanding platform</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white/92 rounded-3xl shadow-[0_26px_60px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="display-font text-xl sm:text-2xl font-bold text-slate-900">
                {isSignUp ? 'Create Account' : 'Login Account'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                {isSignUp ? 'Sign up to start analyzing your videos' : 'Sign in to continue to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {isSignUp && (
                <div className="relative">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-900 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={isLoading}
                    placeholder="John Doe"
                    className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg brand-ring outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <User className="absolute left-3 top-[44px] w-5 h-5 text-slate-400" />
                </div>
              )}

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="you@example.com"
                  className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg brand-ring outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <User className="absolute left-3 top-[44px] w-5 h-5 text-slate-400 justify-center flex items-center" />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg brand-ring outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isSignUp && password && !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}/.test(password)
                    ? "border-red-500"
                    : "border-slate-300"
                    }`}
                />
                <Lock className="absolute left-3 top-[44px] w-5 h-5 text-slate-400 justify-center flex items-center" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] w-5 h-5 text-slate-400 hover:text-teal-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {isSignUp && password && !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}/.test(password) && (
                  <p className="mt-1 text-xs text-red-500">
                    Password must be 8 characters, include uppercase, lowercase, number & special character
                  </p>
                )}
              </div>

              {!isSignUp && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    className="text-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors cursor-pointer"
                    onClick={() => nav('/forgot-password')}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {isSignUp && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={e => setAgreeToTerms(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 mt-0.5 text-teal-600 border-slate-300 rounded cursor-pointer focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 transition-all"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer flex-1 leading-relaxed">
                    I agree to the <span className="text-teal-700 hover:text-teal-800 font-medium cursor-pointer">Terms of Service</span> and <span className="text-teal-700 hover:text-teal-800 font-medium cursor-pointer">Privacy Policy</span>
                  </label>
                </div>
              )}

              {!isSignUp && (
                <div className="mt-3">
                  {deactivatedNotice && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <p className="font-medium">{deactivatedNotice}</p>
                      <p className="mt-1 text-amber-800">We will send a verification code to your email.</p>
                      <button
                        type="button"
                        onClick={handleStartReactivation}
                        className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                      >
                        Reactivate
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (isSignUp && !agreeToTerms)}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-semibold text-white rounded-lg cursor-pointer transition-all"
              >
                {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="text-sm sm:text-base text-teal-700 hover:text-teal-800 hover:underline transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Register Here"}
              </button>
            </div>
            {reactivateOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">Reactivate Account</h3>
                    <p className="text-white/85 text-sm">Enter the verification code sent to your email.</p>
                  </div>
                  <form onSubmit={handleVerifyReactivation} className="p-6 space-y-4">
                    <div className="text-sm text-slate-600">
                      <p>
                        We sent a 6-digit code to <span className="font-semibold text-slate-800">{reactivateEmail}</span>.
                      </p>
                    </div>

                    {reactivateMessage && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                        {reactivateMessage}
                      </div>
                    )}

                    {reactivateError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {reactivateError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Verification code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={reactivateCode}
                        onChange={e => setReactivateCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Enter 6-digit code"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReactivateOpen(false);
                          setReactivateError('');
                          setReactivateMessage('');
                          setReactivateCode('');
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reactivateVerifying || reactivateSending || !reactivateCode}
                        className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                      >
                        {reactivateVerifying ? 'Verifying...' : 'Verify & Reactivate'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Code expires in 10 minutes.</span>
                      <button
                        type="button"
                        onClick={handleStartReactivation}
                        disabled={reactivateSending}
                        className="text-amber-700 hover:underline disabled:opacity-60"
                      >
                        {reactivateSending ? 'Sending...' : 'Resend code'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {termsNoticeOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">Terms & Service Agreement Required</h3>
                    <p className="text-white/85 text-sm">Please accept to continue</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-700">
                      You must agree to our <span className="font-semibold text-gray-900">Terms of Service</span> and <span className="font-semibold text-gray-900">Privacy Policy</span> to create an account.
                    </p>
                    <p className="text-xs text-gray-600">
                      By accepting, you agree to our policies and commit to using this platform responsibly.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setTermsNoticeOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-200 font-medium"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTermsNoticeOpen(false);
                          setAgreeToTerms(true);
                        }}
                        className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium"
                      >
                        I Agree
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
