import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser, requestReactivationCode, verifyReactivationCode } from "../Services/AuthApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onClose: null
  });
  const navigate = useNavigate();

  const showPopup = ({ type, title, message, onClose }) => {
    setPopup({
      open: true,
      type,
      title,
      message,
      onClose: onClose || null
    });
  };

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
        message: "You are signed in successfully."
      });
      console.log(userData)
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
      {popup.open && (
        <div className="fixed top-6 left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {popup.type === "success" ? (
                    <span className="text-white text-xl font-bold">✓</span>
                  ) : (
                    <span className="text-white text-xl font-bold">!</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-widest text-white/80">Notification</p>
                  <h3 className="text-lg font-bold text-white">{popup.title}</h3>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white/90">
              <p className="text-slate-700 font-medium mb-4">{popup.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const next = popup.onClose;
                    setPopup({ ...popup, open: false, onClose: null });
                    if (next) next();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-2xl hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
