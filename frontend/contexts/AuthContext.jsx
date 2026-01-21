import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginUser, signupUser } from "../Services/AuthApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      console.log("SIGNUP RESPONSE 👉", res.data);

      const userData = {
      name,
      email,
    };

      // if (!userData) {
      //   throw new Error("User not found in signup response");
      // }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      //alert("Account created successfully!");
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    }
  };

  // SIGN IN
  const signIn = async (email, password) => {
    try {
      const res = await loginUser({ email, password });

      console.log("LOGIN RESPONSE 👉", res.data);

      const userData = {
      name: res.data.name || res.data.data?.name,
      email: res.data.email || res.data.data?.email,
    };

      if (!userData) {
        throw new Error("User not found in login response");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials");
    }
  };

  // SIGN OUT
  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
