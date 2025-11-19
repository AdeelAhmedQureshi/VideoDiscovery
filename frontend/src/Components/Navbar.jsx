import { Button } from "@/Components/ui/button";
import { Github, Video } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "./../../contexts/AuthContext";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">VideoDiscovery</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features-section"
              className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#upload-section"
              className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Upload
            </a>
            <a
              href="/documentation"
              className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Documentation
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 rounded-lg shadow-sm"
              onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
