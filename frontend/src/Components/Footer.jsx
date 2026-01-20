import { Video, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand  */}
          <div className="space-y-6 ml-18"> 
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">VideoDiscovery</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Multimodal video understanding for intelligent video discovery and recommendation.
            </p>
          </div>

          {/* Product  */}
          <div className="space-y-6 ml-28">
            <h3 className="font-semibold text-gray-900">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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
              {/* <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Pricing
                </a>
              </li> */}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-8 ml-28">
            <h3 className="font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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

          {/* Team - Intentionally commented out */}
          {/* <div className="space-y-6 ml-28git">
            <h3 className="font-semibold text-gray-900">Team</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Muhammad Kaleem</li>
              <li>Adeel Ahmed Qureshi</li>
              <li>Mahnoor Rajput</li>
              <li className="pt-2 text-xs text-gray-500">
                Sukkur IBA University
              </li>
            </ul>
          </div> */}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2026 VideoDiscovery Multimodal Video Understanding for Web-based Video Discovery and Recommendation 
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-500 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-500 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:contact@videodiscovery.com"
              className="text-gray-600 hover:text-cyan-500 transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}