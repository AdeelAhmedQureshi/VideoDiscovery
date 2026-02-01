import { Button } from "@/Components/ui/button";
import { Video, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UploadSection } from "@/Components/UploadSection";
import AnalyticsPanel from "@/Components/Analysis";
import { RecommendationsSection } from "@/Components/RecommendationsSection";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";
import { UserAvatar } from "./../src/Components/UserAvatar";
export const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm h-22 justify-center flex items-center cursor-pointer">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16"
                        onClick={() => { navigate('/') }}>
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
                                <Video className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-2xl text-gray-900">VideoDiscovery</span>
                        </div>
                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-10">
                             <a
                                href="/"
                                className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Home
                            </a>
                            <a
                                href="#features-section"
                                className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Features
                            </a>

                            <a
                                href="/documentation"
                                className="text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Documentation
                            </a>
                           
                            
                        </nav>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3 cursor-pointer">
                            <UserAvatar />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mt-20">
                <AnalyticsPanel />
                <UploadSection />
                <RecommendationsSection />
            </main>
        </>
    );
};
