import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser, requestReactivationCode, verifyReactivationCode } from "../Services/AuthApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializingModels, setInitializingModels] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onClose: null,
    variant: "default",
    autoCloseMs: 0,
    requireAction: false
  });
  const navigate = useNavigate();

  const showPopup = ({ type, title, message, onClose, variant = "default", autoCloseMs, requireAction = false }) => {
    const resolvedAutoCloseMs = autoCloseMs ?? (requireAction ? 0 : 2400);
    setPopup({
      open: true,
      type,
      title,
      message,
      onClose: onClose || null,
      variant,
      autoCloseMs: resolvedAutoCloseMs,
      requireAction
    });
  };

  useEffect(() => {
    if (!popup.open || !popup.autoCloseMs) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      const next = popup.onClose;
      setPopup((prev) => ({ ...prev, open: false, onClose: null }));
      if (next) next();
    }, popup.autoCloseMs);

    return () => clearTimeout(timeoutId);
  }, [popup.open, popup.autoCloseMs, popup.onClose]);

  // Load user on refresh (SAFE)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Invalid user in localStorage", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const initEngineModels = async () => {
    try {
      setInitializingModels(true);
      await fetch("http://localhost:8000/api/init-models", { method: "POST" });
      
      let attempts = 0;
      while (attempts < 20) {
        const res = await fetch("http://localhost:8000/api/models-status");
        if (res.ok) {
          const data = await res.json();
          if (data?.is_loaded) break;
        }
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;
      }
    } catch (e) {
      console.error("Model init error:", e);
    } finally {
      setInitializingModels(false);
    }
  };

  // SIGN UP
  const signUp = async (name, email, password) => {
    try {
      const res = await signupUser({ name, email, password });
      const payload = res?.data || res;

      console.log("SIGNUP RESPONSE 👉", payload);

      const userData = {
        name: payload?.name || name,
        email: payload?.email || email,
        user_id: payload?.user_id,
      };

      localStorage.setItem("token", payload?.access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      showPopup({
        type: "success",
        title: "Account created",
        message: "Your account has been created successfully."
      });
      await initEngineModels();
      navigate("/dashboard");
    } catch (err) {
      showPopup({
        type: "error",
        title: "Signup failed",
        message: err.message || "Unable to create your account."
      });
    }
  };

  // SIGN IN
  const signIn = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      const payload = res?.data || res;

      console.log("LOGIN RESPONSE 👉", payload);

      const userData = {
        name: payload?.name,
        email: payload?.email,
        user_id: payload?.user_id,
      };

      if (!payload?.access_token) {
        throw new Error("Access token missing in login response");
      }

      localStorage.setItem("token", payload.access_token);

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      showPopup({
        type: "success",
        title: "Welcome back",
        message: "You are signed in successfully.",
        variant: "login-success-bar",
        autoCloseMs: 2000
      });
      console.log(userData)
      await initEngineModels();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      showPopup({
        type: "error",
        title: "Sign in failed",
        message: err.message || "Invalid credentials. Please try again."
      });
      throw err; // allow caller to react (e.g., open reactivate modal)
    }
  };

  const sendReactivationCode = async (email) => {
    try {
      const res = await requestReactivationCode({ email });
      return res;
    } catch (err) {
      throw err;
    }
  };

  const verifyReactivation = async (email, code) => {
    try {
      const res = await verifyReactivationCode({ email, code });
      const payload = res?.data || res;

      if (payload?.access_token) {
        localStorage.setItem("token", payload.access_token);
        await refreshUser();

        showPopup({
          type: "success",
          title: "Account reactivated",
          message: "Your account has been successfully reactivated. Welcome back! Your data is restored."
        });
        navigate("/dashboard");
      } else {
        showPopup({
          type: "success",
          title: "Account active",
          message: res?.message || "Your account is already active."
        });
      }
      return res;
    } catch (err) {
      showPopup({
        type: "error",
        title: "Reactivation failed",
        message: err.message || "Unable to reactivate your account."
      });
      throw err;
    }
  };

  // SIGN OUT
  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth");
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Failed to refresh user");

      const userData = data?.data || data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser, sendReactivationCode, verifyReactivation }}>
      {children}
      {initializingModels && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl flex flex-col items-center max-w-sm w-full shadow-2xl animate-[fadeIn_220ms_ease-out]">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Initializing AI Engine</h3>
              <p className="text-gray-600 text-center text-sm">Please wait while the AI models (YOLO, Whisper, CLIP) are loaded into Memory. This step ensures blazingly fast analysis.</p>
           </div>
        </div>
      )}
      {popup.open && (
        <div className={`fixed left-1/2 z-50 -translate-x-1/2 ${popup.requireAction ? "top-5 w-[min(88vw,420px)]" : "top-4 w-max max-w-[92vw]"}`}>
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_65px_-24px_rgba(15,23,42,0.5)] animate-[fadeIn_220ms_ease-out] backdrop-blur-sm">
            <div className={`relative px-6 py-4 ${popup.type === "success" ? "bg-gradient-to-r from-emerald-600 to-green-600" : popup.type === "error" ? "bg-gradient-to-r from-rose-600 to-red-600" : popup.type === "warning" ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/35">
                  {popup.type === "success" ? (
                    <span className="text-white text-xl font-bold">✓</span>
                  ) : (
                    <span className="text-white text-xl font-bold">!</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {popup.requireAction && (
                    <p className="text-xs uppercase tracking-[0.22em] text-white/80">Notification</p>
                  )}
                  <h3 className="text-lg font-bold text-white truncate">{popup.title}</h3>
                  {!popup.requireAction && (
                    <p className="text-white/90 text-sm">{popup.message}</p>
                  )}
                </div>
              </div>
            </div>

            {!popup.requireAction ? (
              <div className="h-1.5 bg-white/25">
                <div
                  className="h-full bg-white/90 origin-left"
                  style={{ animation: `loginPopupTimer ${popup.autoCloseMs}ms linear forwards` }}
                />
              </div>
            ) : (
              <div className="px-6 py-5 bg-white/90">
                <p className="text-slate-700 font-medium leading-relaxed mb-5">{popup.message}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const next = popup.onClose;
                      setPopup({ ...popup, open: false, onClose: null });
                      if (next) next();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-2xl hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg shadow-slate-900/20"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
          <style>{`@keyframes loginPopupTimer{from{transform:scaleX(1)}to{transform:scaleX(0)}}@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
