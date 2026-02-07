import { useState } from "react";
import { Video, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../contexts/AuthContext";
import { UserAvatar } from "./../Components/UserAvatar";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 h-22 flex items-center">
      <style>{`
        .nav-link {
          transition: color 0.2s, box-shadow 0.2s;
        }
        .nav-link:hover {
          color: #0ea5e9; /* cyan-500 / blue shade */
          box-shadow: 0 2px 0 0 #0ea5e9;
        }
        .logo-link {
          transition: color 0.2s;
        }
        .logo-link:hover {
          color: #0ea5e9;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer logo-link" onClick={() => navigate('/')}> 
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-gray-900">VideoDiscovery</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {user && (
              <a
                href="/dashboard"
                className="nav-link text-lg font-semibold text-gray-600"
              >
                Dashboard
              </a>
            )}
            <a href="#features-section" className="nav-link text-lg font-semibold text-gray-600">Features</a>
            <a href="/documentation" className="nav-link text-lg font-semibold text-gray-600">Documentation</a>
            
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center">
            {user ? <UserAvatar /> : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-cyan-500 h-10 sm:h-12 cursor-pointer hover:bg-cyan-600 text-white text-base sm:text-lg font-semibold px-6 sm:px-8 rounded-xl shadow-md transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-cyan-600 hover:border-cyan-200 transition"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
            {user && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => {
                navigate("/", { state: { scrollTo: "features-section" } });
                setMenuOpen(false);
              }}
              className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
            >
              Features
            </button>
            <button
              onClick={() => {
                navigate("/documentation");
                setMenuOpen(false);
              }}
              className="w-full text-left text-base font-semibold text-gray-700 hover:text-cyan-600"
            >
              Documentation
            </button>

            <div className="pt-2 border-t border-gray-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigate("/account");
                      setMenuOpen(false);
                    }}
                    className="text-base font-semibold text-gray-700 hover:text-cyan-600"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-base font-semibold text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("/auth");
                    setMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600 transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
