import { Video, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-linear-to-br from-white via-slate-50 to-cyan-50">
      <style>{`
        .footer-title {
          font-family: "Space Grotesk", "Poppins", sans-serif;
          letter-spacing: -0.01em;
        }
        .footer-sheen {
          background: radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.18), transparent 45%),
                      radial-gradient(circle at 85% 0%, rgba(56, 189, 248, 0.18), transparent 45%),
                      radial-gradient(circle at 80% 90%, rgba(59, 130, 246, 0.12), transparent 50%);
        }
        .footer-pill {
          background: linear-gradient(90deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.12));
          border: 1px solid rgba(14, 165, 233, 0.2);
        }
      `}</style>

      <div className="footer-sheen absolute inset-0" aria-hidden="true"></div>

      <div className="relative container mx-auto px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="footer-title font-bold text-2xl text-slate-900">VideoDiscovery</span>
            </div>

            <p className="text-base text-slate-600 leading-relaxed max-w-sm">
              Multimodal video understanding for intelligent discovery, faster search, and confident recommendations.
            </p>

            <div className="footer-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-cyan-700">
              Built for research and real-world discovery
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="footer-title font-semibold text-slate-900 text-lg">Product</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#features-section" className="hover:text-cyan-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#howitworks" className="hover:text-cyan-600 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="/documentation" className="hover:text-cyan-600 transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="footer-title font-semibold text-slate-900 text-lg">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Research Paper
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-slate-500">
            © 2026 VideoDiscovery. Multimodal video understanding for web-based discovery.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:contact@videodiscovery.com"
              className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}