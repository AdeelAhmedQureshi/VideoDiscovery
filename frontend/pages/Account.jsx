import { useState } from "react";
import { User, Mail, Lock, Trash2, ArrowLeft, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Account() {
  const { user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onClose: null
  });

  const showPopup = ({ type, title, message, onClose }) => {
    setPopup({
      open: true,
      type,
      title,
      message,
      onClose: onClose || null
    });
  };
  const handleDeactivateAccount = async () => {
    try {
      if (!deactivatePassword) {
        showPopup({
          type: "warning",
          title: "Password required",
          message: "Please enter your current password to deactivate your account."
        });
        return;
      }

      if (deactivateConfirmation.trim().toUpperCase() !== "DEACTIVATE") {
        showPopup({
          type: "warning",
          title: "Confirmation required",
          message: "Please type DEACTIVATE to confirm account deactivation."
        });
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/users/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          password: deactivatePassword,
          confirmation: deactivateConfirmation.trim().toUpperCase()
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || "Error deactivating account");

      showPopup({
        type: "success",
        title: "Account deactivated",
        message:
          data.message ||
          "Your account is deactivated. You can reactivate within 30 days; after that it will be permanently deleted.",
        onClose: () => navigate("/auth")
      });
      setDeactivatePassword("");
      setDeactivateConfirmation("");
      setShowDeactivateModal(false);
      signOut();
    } catch (err) {
      showPopup({
        type: "error",
        title: "Deactivation failed",
        message: err.message || "Failed to deactivate account."
      });
    }
  };

  const validatePassword = (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const isLongEnough = value.length >= 8;

    if (!isLongEnough || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    return "";
  };

  const handleUpdateName = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/users/update-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // for HttpOnly cookies
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error updating name");

      showPopup({
        type: "success",
        title: "Name updated",
        message: data.message || "Your name has been updated successfully."
      });
      await refreshUser();
    } catch (err) {
      showPopup({
        type: "error",
        title: "Update failed",
        message: err.message || "Failed to update name."
      });
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/users/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ email, password: emailPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error updating email");

      showPopup({
        type: "success",
        title: "Email updated",
        message: data.message || "Your email has been updated. Please log in again.",
        onClose: () => navigate("/auth")
      });
      setEmailPassword("");
      await refreshUser();
    } catch (err) {
      showPopup({
        type: "error",
        title: "Update failed",
        message: err.message || "Failed to update email."
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const nameChanged = name.trim() !== (user?.name || "").trim();
      const emailChanged = email.trim() !== (user?.email || "").trim();

      if (!nameChanged && !emailChanged) {
        showPopup({
          type: "info",
          title: "No changes",
          message: "There are no changes to save."
        });
        return;
      }

      if (emailChanged && !emailPassword) {
        showPopup({
          type: "warning",
          title: "Password required",
          message: "Please enter your current password to update email."
        });
        return;
      }

      if (nameChanged) {
        await handleUpdateName();
      }

      if (emailChanged) {
        await handleUpdateEmail();
      }
    } catch (err) {
      showPopup({
        type: "error",
        title: "Save failed",
        message: err.message || "Failed to save changes."
      });
    }
  };
  const handleUpdatePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        showPopup({
          type: "warning",
          title: "Password mismatch",
          message: "New password and confirm password do not match."
        });
        return;
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        showPopup({
          type: "warning",
          title: "Weak password",
          message: passwordError
        });
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/users/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error updating password");

      showPopup({
        type: "success",
        title: "Password updated",
        message: data.message || "Your password has been updated. Please log in again.",
        onClose: () => navigate("/auth")
      });
    } catch (err) {
      showPopup({
        type: "error",
        title: "Update failed",
        message: err.message || "Failed to update password."
      });
    }
  };
  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        showPopup({
          type: "warning",
          title: "Password required",
          message: "Please enter your current password to delete your account."
        });
        return;
      }

      if (deleteConfirmation.trim().toUpperCase() !== "DELETE") {
        showPopup({
          type: "warning",
          title: "Confirmation required",
          message: "Please type DELETE to confirm account deletion."
        });
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/users/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation.trim().toUpperCase()
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error deleting account");

      showPopup({
        type: "success",
        title: "Account deleted",
        message: data.message || "Your account has been deleted successfully."
      });
      setDeletePassword("");
      setDeleteConfirmation("");
      setShowDeleteModal(false);
      signOut();
    } catch (err) {
      showPopup({
        type: "error",
        title: "Delete failed",
        message: err.message || "Failed to delete account."
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
        delayChildren: 0.05,
        staggerChildren: 0.1,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50 py-16 px-4 sm:px-6 lg:px-10">
      <style>{`
        .account-title {
          font-family: "Space Grotesk", "Poppins", sans-serif;
          letter-spacing: -0.02em;
        }
        .account-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.75));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
        }
        .account-glow {
          background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.35), transparent 55%),
                      radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.25), transparent 45%),
                      radial-gradient(circle at 80% 90%, rgba(34, 211, 238, 0.2), transparent 55%);
        }
        .account-pill {
          background: linear-gradient(90deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.12));
          border: 1px solid rgba(14, 165, 233, 0.2);
        }
      `}</style>

      <div className="relative max-w-5xl mx-auto">
        <div className="account-glow absolute inset-0 -z-10 rounded-[48px]"></div>

        {/* Back Button & Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors mb-8 font-semibold"
          >
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.7 }}
            variants={containerVariants}
          >
            <div className="inline-block relative mb-5">
              <motion.h1
                className="inline-block text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_200%] transition-[background-position,filter,transform] duration-500 hover:bg-[position:100%_50%] hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] peer"
                variants={headingVariants}
              >
                Account Settings
              </motion.h1>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm transition-all duration-500 peer-hover:blur-md peer-hover:h-1.5 peer-hover:opacity-80"
                variants={headingVariants}
              ></motion.div>
            </div>
            <motion.p className="text-slate-600 max-w-xl mx-auto" variants={headingVariants}>
              Manage your profile, refresh credentials, and keep everything secure in one place.
            </motion.p>
          </motion.div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">Changes saved successfully!</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Information Card */}
          <div className="account-card rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-white/70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
                  <p className="text-slate-600 text-sm mt-1">Update your personal details</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/80">
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      type="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Current Password (for email change)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="account-card rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-white/70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                  <p className="text-slate-600 text-sm mt-1">Update your password to keep your account secure</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/80">
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">Password requirements:</p>
                      <ul className="space-y-1 text-gray-700">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                  onClick={handleUpdatePassword}>
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="rounded-3xl overflow-hidden border border-red-200 bg-white/90 shadow-[0_24px_48px_rgba(190,18,60,0.08)]">
            <div className="px-8 py-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
                  <p className="text-red-700 text-sm mt-1">Irreversible actions</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Deactivate Account (30-day recovery) */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">Deactivate Account (30 days)</h3>
                    <p className="text-sm text-amber-800">
                      Temporarily disable your account. You can recover it within 30 days. After 30 days,
                      your account and data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeactivateModal(true)}
                className="mb-6 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center cursor-pointer"
              >
                <Shield className="w-4 h-4 mr-2" />
                Deactivate for 30 days
              </button>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Delete Account</h3>
                    <p className="text-sm text-red-700">
                      Once you delete your account, there is no going back. All your data, settings, and content will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Confirm Account Deactivation
                </h3>
              </div>
            </div>

            <div className="p-8 bg-white/90">
              <p className="text-gray-900 font-medium mb-4">
                Deactivating will immediately disable your account. You can reactivate anytime within 30 days.
                After 30 days, your account will be permanently deleted.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={deactivatePassword}
                      onChange={(e) => setDeactivatePassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-12 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type DEACTIVATE to confirm
                  </label>
                  <input
                    value={deactivateConfirmation}
                    onChange={(e) => setDeactivateConfirmation(e.target.value)}
                    placeholder="DEACTIVATE"
                    className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
                  onClick={handleDeactivateAccount}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Confirm Account Deletion
                </h3>
              </div>
            </div>

            <div className="p-8 bg-white/90">
              <p className="text-gray-900 font-medium mb-4">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove:
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 font-bold">•</span>
                  <span>All your personal information and profile data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 font-bold">•</span>
                  <span>Your account settings and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 font-bold">•</span>
                  <span>Access to all associated services</span>
                </li>
              </ul>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-12 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                  onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {popup.open && (
        <div className="fixed top-6 left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2">
          <div className="account-card overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {popup.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-white" />
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
    </section>
  );
}