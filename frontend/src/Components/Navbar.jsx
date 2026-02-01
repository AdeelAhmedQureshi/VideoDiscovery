import { Button } from "@/Components/ui/button";
import { Github, Video, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import { UserAvatar } from "./../Components/UserAvatar";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 h-22 flex items-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-gray-900">VideoDiscovery</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#features-section" className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="/documentation" className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors">Documentation</a>
            {user && (
              <a
                href="/dashboard"
                className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </a>
            )}
          </nav>

          {/* Auth */}
          {user ? <UserAvatar /> : (
            <button
              onClick={() => navigate('/auth')}
              className="bg-cyan-500 h-10 sm:h-12 cursor-pointer hover:bg-cyan-600 text-white text-base sm:text-lg font-semibold px-6 sm:px-8 rounded-xl shadow-md transition-all"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
