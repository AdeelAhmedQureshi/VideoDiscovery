import { useState } from "react";
import { User, Mail, Lock, Trash2, ArrowLeft, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveProfile = () => {
    // Add your save logic here
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back Button & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors mb-8 font-xl font-bold"
          >
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal information and security
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">Changes saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 px-8 py-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              <p className="text-gray-600 text-sm mt-1">Update your personal details</p>
            </div>

            <div className="p-8">
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
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900"
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
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  className="px-8 py-3.5 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 px-8 py-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <p className="text-gray-600 text-sm mt-1">Update your password to keep your account secure</p>
            </div>

            <div className="p-8">
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
                      className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900"
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
                        className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900"
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
                        className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900"
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

                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
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
                <button className="px-8 py-3.5 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-8 py-6 border-b-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
              <p className="text-red-700 text-sm mt-1">Irreversible actions</p>
            </div>

            <div className="p-8">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
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
                className="px-6 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Confirm Account Deletion
                </h3>
              </div>
            </div>

            <div className="p-8">
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-200"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}