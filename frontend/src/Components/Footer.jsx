import { Video, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f5fbfb_58%,#f7fbff_100%)]">
      <style>{`
        .footer-title {
          font-family: "Sora", "Manrope", sans-serif;
          letter-spacing: -0.01em;
        }
        .footer-sheen {
          background: radial-gradient(circle at 15% 20%, rgba(20, 184, 166, 0.16), transparent 45%),
                      radial-gradient(circle at 85% 0%, rgba(14, 165, 233, 0.14), transparent 45%),
                      radial-gradient(circle at 80% 90%, rgba(15, 118, 110, 0.1), transparent 50%);
        }
        .footer-pill {
          background: linear-gradient(90deg, rgba(20, 184, 166, 0.14), rgba(14, 165, 233, 0.12));
          border: 1px solid rgba(20, 184, 166, 0.2);
        }
      `}</style>

      <div className="footer-sheen absolute inset-0" aria-hidden="true"></div>

      <div className="relative container mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-linear-to-br from-teal-500 via-cyan-500 to-sky-500 flex items-center justify-center shadow-md">
                <Video className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="footer-title font-bold text-xl sm:text-2xl text-slate-900">VideoDiscovery</span>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
              Multimodal video understanding for intelligent discovery, faster search, and confident recommendations.
            </p>

            <div className="footer-pill inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-teal-700">
              Built for research and real-world discovery
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="footer-title font-semibold text-slate-900 text-base sm:text-lg">Product</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <a href="#features-section" className="hover:text-teal-700 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#howitworks" className="hover:text-teal-700 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="/documentation" className="hover:text-teal-700 transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="footer-title font-semibold text-slate-900 text-base sm:text-lg">Resources</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-teal-700 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-700 transition-colors">
                  Research Paper
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-700 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-700 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-12 pt-5 sm:pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] sm:text-sm text-slate-500">
            © 2026 VideoDiscovery. Multimodal video understanding for web-based discovery.
          </p>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a
              href="mailto:contact@videodiscovery.com"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}