import { useState } from "react";
import { Video, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./../../contexts/AuthContext";
import { UserAvatar } from "./../Components/UserAvatar";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/86 backdrop-blur-xl border-b border-slate-200/70 h-22 flex items-center">
      <style>{`
        .nav-link {
          position: relative;
          transition: color 0.25s;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 100%;
          height: 2px;
          border-radius: 999px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
          background: linear-gradient(90deg, #1f8f7f, #0ea5e9);
        }
        .nav-link:hover {
          color: #0f766e;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .nav-link.active {
          color: #0f766e;
        }
        .nav-link.active::after {
          transform: scaleX(1);
        }
        .logo-link {
          transition: color 0.2s, transform 0.2s;
        }
        .logo-link:hover {
          color: #0f766e;
          transform: translateY(-1px);
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer logo-link" onClick={() => navigate('/')}> 
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 via-cyan-500 to-sky-500 flex items-center justify-center shadow-[0_10px_24px_rgba(14,116,144,0.28)]">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="display-font font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">VideoDiscovery</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-9">
            <a
              href="/"
              className={`nav-link text-[1.02rem] font-semibold text-slate-600 ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </a>
            {user && (
              <a
                href="/dashboard"
                className={`nav-link text-[1.02rem] font-semibold text-slate-600 ${location.pathname === "/dashboard" ? "active" : ""}`}
              >
                Dashboard
              </a>
            )}
            <a href="#features-section" className="nav-link text-[1.02rem] font-semibold text-slate-600">Features</a>
            <a href="/documentation" className="nav-link text-[1.02rem] font-semibold text-slate-600">Documentation</a>
            
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center">
            {user ? <UserAvatar /> : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 h-10 sm:h-11 cursor-pointer hover:from-teal-700 hover:to-cyan-700 text-white text-base font-semibold px-6 sm:px-7 rounded-xl shadow-[0_10px_24px_rgba(21,128,117,0.35)] transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-200 transition"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
            <button
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
              className={`w-full text-left text-base font-semibold hover:text-teal-700 ${location.pathname === "/" ? "text-teal-700 underline decoration-2 underline-offset-4" : "text-slate-700"}`}
            >
              Home
            </button>
            {user && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                className={`w-full text-left text-base font-semibold hover:text-teal-700 ${location.pathname === "/dashboard" ? "text-teal-700 underline decoration-2 underline-offset-4" : "text-slate-700"}`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => {
                navigate("/", { state: { scrollTo: "features-section" } });
                setMenuOpen(false);
              }}
              className="w-full text-left text-base font-semibold text-slate-700 hover:text-teal-700"
            >
              Features
            </button>
            <button
              onClick={() => {
                navigate("/documentation");
                setMenuOpen(false);
              }}
              className="w-full text-left text-base font-semibold text-slate-700 hover:text-teal-700"
            >
              Documentation
            </button>

            <div className="pt-2 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigate("/account");
                      setMenuOpen(false);
                    }}
                    className="text-base font-semibold text-slate-700 hover:text-teal-700"
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
                  className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition"
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
